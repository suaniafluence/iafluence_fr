from flask import Flask, render_template, request, jsonify, Response, stream_with_context
import os
from dotenv import load_dotenv
import sys
import time
import json

#sys.path.append("/home/ubuntu/chatbot")
from backend.rag import RAGProcessor
from backend.openrouter_api import OpenRouterAPI

# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)
app.static_folder = 'static'

# Initialiser l'API OpenRouter
openrouter_api = OpenRouterAPI()

# Initialiser le processeur RAG
rag_processor = RAGProcessor()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    
    # Utiliser le RAG pour enrichir la requête
    context = rag_processor.get_relevant_context(user_message)
    
    # Préparer le message avec le contexte
    prompt = f"""Contexte: {context}
    
Question: {user_message}
    
Réponds de manière efficace, précise mais joviale à propos d'IAfluence. Utilise un ton amical et professionnel."""
    
    try:
        # Appel à l'API OpenRouter via notre module
        response = openrouter_api.get_response(prompt)
        
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat/stream', methods=['POST'])
def chat_stream():
    data = request.json
    user_message = data.get('message', '')
    
    # Utiliser le RAG pour enrichir la requête
    context = rag_processor.get_relevant_context(user_message)
    
    # Préparer le message avec le contexte
    prompt = f"""Contexte: {context}
    
Question: {user_message}
    
Réponds de manière efficace, précise mais joviale à propos d'IAfluence. Utilise un ton amical et professionnel."""
    
    def generate():
        try:
            # Obtenir la réponse complète
            full_response = openrouter_api.get_response(prompt)
            
            # Simuler un streaming caractère par caractère
            for i in range(len(full_response) + 1):
                chunk = full_response[:i]
                # Pause très courte entre chaque caractère (plus rapide que ChatGPT)
                time.sleep(0.01)  
                yield chunk
                
        except Exception as e:
            yield f"Désolé, une erreur est survenue lors de la communication avec l'API: {str(e)}"
    
    return Response(stream_with_context(generate()), mimetype='text/plain')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
