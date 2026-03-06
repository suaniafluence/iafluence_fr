from flask import Flask, render_template, request, jsonify, Response, stream_with_context
import os
import re
from dotenv import load_dotenv
from backend.rag import RAGProcessor
from backend.openrouter_api import OpenRouterAPI
from backend.mcp import mcp_bp

# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)
app.static_folder = 'static'
app.register_blueprint(mcp_bp)

openrouter_api = OpenRouterAPI()
rag_processor = RAGProcessor()

# --- Guardrails ---

MAX_INPUT_LENGTH = 500

# Patterns d'injection de prompt à bloquer
INJECTION_PATTERNS = [
    r"ignore\s+(tes|les|toutes?)\s+(instructions?|règles?|consignes?)",
    r"oublie\s+(tes|les)\s+(instructions?|règles?)",
    r"tu\s+es\s+maintenant",
    r"nouveau\s+(rôle|prompt|personnage)",
    r"act\s+as",
    r"jailbreak",
    r"DAN\b",
    r"prompt\s+injection",
    r"ignore\s+previous",
    r"system\s*:\s*",
    r"<\s*system\s*>",
]

def sanitize_input(text):
    """Valide et nettoie le message utilisateur. Retourne (texte_nettoyé, erreur)."""
    if not text or not text.strip():
        return None, "Message vide."

    text = text.strip()

    if len(text) > MAX_INPUT_LENGTH:
        return None, f"Message trop long (maximum {MAX_INPUT_LENGTH} caractères)."

    # Détection d'injection de prompt
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return None, "guardrail"

    return text, None


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    raw_message = data.get('message', '')

    user_message, error = sanitize_input(raw_message)
    if error:
        if error == "guardrail":
            return jsonify({"response": "Je suis uniquement là pour répondre à vos questions sur IAfluence. Comment puis-je vous aider ?"})
        return jsonify({"error": error}), 400

    context = rag_processor.get_relevant_context(user_message)

    try:
        response = openrouter_api.get_response(user_message, context)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/chat/stream', methods=['POST'])
def chat_stream():
    data = request.json
    raw_message = data.get('message', '')

    user_message, error = sanitize_input(raw_message)
    if error:
        msg = "Je suis uniquement là pour répondre à vos questions sur IAfluence. Comment puis-je vous aider ?" if error == "guardrail" else error
        return Response(msg, mimetype='text/plain')

    context = rag_processor.get_relevant_context(user_message)

    def generate():
        try:
            for chunk in openrouter_api.stream_response(user_message, context):
                yield chunk
        except Exception as e:
            yield f"Désolé, une erreur est survenue : {str(e)}"

    return Response(stream_with_context(generate()), mimetype='text/plain')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
