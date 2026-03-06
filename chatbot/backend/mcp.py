"""
WebMCP Backend — iafluence.fr
Expose les tools MCP via REST JSON et envoie les emails via Gmail SMTP.
"""
import os
import re
import time
import smtplib
from collections import defaultdict
from email.message import EmailMessage
from flask import Blueprint, jsonify, request
from dotenv import load_dotenv

load_dotenv()

mcp_bp = Blueprint('mcp', __name__)

# ─── Configuration ────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    'https://iafluence.fr',
    'https://www.iafluence.fr',
    'http://localhost:5000',
    'http://localhost',
]
EMAIL_FROM = os.getenv('EMAIL_EXPEDITEUR', 'suan.tay.job@gmail.com')
EMAIL_TO   = os.getenv('EMAIL_DESTINATAIRE', 'suan.tay.job@gmail.com')
GMAIL_PWD  = os.getenv('GMAIL_APP_PASSWORD', '')

# ─── Rate limiting (in-memory, par IP) ────────────────────────────────────────
_rl_buckets = defaultdict(list)

def _rate_ok(ip, max_req=10, window=60):
    now = time.time()
    _rl_buckets[ip] = [t for t in _rl_buckets[ip] if now - t < window]
    if len(_rl_buckets[ip]) >= max_req:
        return False
    _rl_buckets[ip].append(now)
    return True

# ─── Sécurité ─────────────────────────────────────────────────────────────────
def _check_origin():
    origin  = request.headers.get('Origin', '')
    referer = request.headers.get('Referer', '')
    return any(origin.startswith(o) for o in ALLOWED_ORIGINS) or \
           any(referer.startswith(o) for o in ALLOWED_ORIGINS)

def _get_ip():
    return request.headers.get('X-Real-IP') or \
           request.headers.get('X-Forwarded-For', '').split(',')[0].strip() or \
           request.remote_addr

def _valid_email(email):
    return bool(re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email))

# ─── Envoi email ──────────────────────────────────────────────────────────────
def _send_email(subject, body):
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From']    = EMAIL_FROM
    msg['To']      = EMAIL_TO
    msg.set_content(body)
    with smtplib.SMTP('smtp.gmail.com', 587) as s:
        s.ehlo(); s.starttls()
        s.login(EMAIL_FROM, GMAIL_PWD)
        s.send_message(msg)

# ─── Données statiques ────────────────────────────────────────────────────────
OFFERS = [
    {
        "id": "pack-decouverte",
        "title": "Pack Découverte IA",
        "description": "Stratégie IA (2h) + Atelier Prompt Engineering + GPT personnalisé + support mail 7 jours.",
        "price_range": "1 490 € TTC",
        "cta_url": "https://iafluence.fr/pack1.html"
    },
    {
        "id": "pack-operationnel",
        "title": "Pack Opérationnel Cloud",
        "description": "Stratégie IA approfondie, GPT métier, déploiement cloud sécurisé, formation + support visio.",
        "price_range": "3 900 € TTC",
        "cta_url": "https://iafluence.fr/pack2.html"
    },
    {
        "id": "pack-souverain",
        "title": "Pack IA Souveraine",
        "description": "Stratégie complète, 2-3 GPTs connectés, déploiement sur infra dédiée, intégration API + RGPD.",
        "price_range": "8 900 € TTC",
        "cta_url": "https://iafluence.fr/pack3.html"
    },
    {
        "id": "custom-gpt",
        "title": "Custom GPT On-Premise",
        "description": "Solution IA sur mesure : interview → élaboration → livraison. Abonnement maintenance possible.",
        "price_range": "Sur devis",
        "cta_url": "https://iafluence.fr/customgpt.html"
    },
    {
        "id": "ia-on-premise",
        "title": "IA Générative On-Premise",
        "description": "Audit infra, installation, mise en production, formation IT et utilisateurs, RGPD.",
        "price_range": "À partir de 15 000 € HT",
        "cta_url": "https://iafluence.fr/#contact"
    },
]

CASE_STUDIES = [
    {
        "title": "Automatisation du service client",
        "industry": "Événementiel (Phosphoriales)",
        "results": "Automatisation complète du service client en 1 semaine. Résultats dépassant les attentes.",
        "link": "https://iafluence.fr/#apropos"
    },
    {
        "title": "Solution IA sur mesure",
        "industry": "Indépendant (Meiline.fr)",
        "results": "Solution personnalisée adaptée aux besoins spécifiques. Expertise en IA générative reconnue.",
        "link": "https://iafluence.fr/#apropos"
    },
    {
        "title": "Formation équipe IA",
        "industry": "Associatif (RLV)",
        "results": "Formation qui a déclenché l'adoption quotidienne des outils IA pour gagner en productivité.",
        "link": "https://iafluence.fr/#apropos"
    },
]

# ─── Schémas des tools ────────────────────────────────────────────────────────
MCP_TOOLS = [
    {
        "name": "get_offers",
        "description": "Retourne les offres et packs de services IAfluence avec prix et liens.",
        "inputSchema": {"type": "object", "properties": {}, "required": []}
    },
    {
        "name": "get_case_studies",
        "description": "Retourne les études de cas clients IAfluence.",
        "inputSchema": {"type": "object", "properties": {}, "required": []}
    },
    {
        "name": "contact",
        "description": "Envoie un message de contact à IAfluence.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "name":    {"type": "string", "description": "Nom complet"},
                "email":   {"type": "string", "format": "email"},
                "message": {"type": "string", "description": "Message"}
            },
            "required": ["name", "email", "message"]
        }
    },
    {
        "name": "request_quote",
        "description": "Demande un devis personnalisé IAfluence.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "name":     {"type": "string"},
                "email":    {"type": "string", "format": "email"},
                "company":  {"type": "string"},
                "need":     {"type": "string", "description": "Besoin IA décrit"},
                "budget":   {"type": "string"},
                "deadline": {"type": "string"}
            },
            "required": ["name", "email", "need"]
        }
    },
    {
        "name": "book_call",
        "description": "Réserve un appel découverte avec IAfluence.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "name":            {"type": "string"},
                "email":           {"type": "string", "format": "email"},
                "preferred_dates": {"type": "string", "description": "Disponibilités souhaitées"},
                "topic":           {"type": "string", "description": "Sujet de l'appel"}
            },
            "required": ["name", "email"]
        }
    },
]

# ─── Routes MCP ───────────────────────────────────────────────────────────────

@mcp_bp.route('/api/mcp/tools', methods=['GET'])
def mcp_tools():
    """Découverte des tools (GET /api/mcp/tools)"""
    return jsonify({"tools": MCP_TOOLS})


@mcp_bp.route('/api/mcp/call', methods=['POST'])
def mcp_call():
    """Dispatcher générique (POST /api/mcp/call) — body: {name, arguments}"""
    ip = _get_ip()
    if not _rate_ok(ip, max_req=20, window=60):
        return jsonify({"error": "Rate limit dépassé. Réessayez dans une minute."}), 429

    if not _check_origin():
        return jsonify({"error": "Origine non autorisée."}), 403

    data = request.get_json(silent=True) or {}
    name = data.get('name', '')
    args = data.get('arguments', {})

    dispatch = {
        'get_offers':      _tool_get_offers,
        'get_case_studies': _tool_get_case_studies,
        'contact':         _tool_contact,
        'request_quote':   _tool_request_quote,
        'book_call':       _tool_book_call,
    }

    if name not in dispatch:
        return jsonify({"error": f"Tool inconnu : {name}"}), 404

    return dispatch[name](args)


# ─── Endpoints dédiés (appelables directement) ────────────────────────────────

@mcp_bp.route('/api/offers', methods=['GET'])
def api_get_offers():
    return _tool_get_offers({})

@mcp_bp.route('/api/case-studies', methods=['GET'])
def api_get_case_studies():
    return _tool_get_case_studies({})

@mcp_bp.route('/api/contact', methods=['POST'])
def api_contact():
    ip = _get_ip()
    if not _rate_ok(ip, max_req=5, window=60):
        return jsonify({"error": "Trop de requêtes. Réessayez dans une minute."}), 429
    return _tool_contact(request.get_json(silent=True) or {})

@mcp_bp.route('/api/quote', methods=['POST'])
def api_quote():
    ip = _get_ip()
    if not _rate_ok(ip, max_req=5, window=60):
        return jsonify({"error": "Trop de requêtes. Réessayez dans une minute."}), 429
    return _tool_request_quote(request.get_json(silent=True) or {})

@mcp_bp.route('/api/book-call', methods=['POST'])
def api_book_call():
    ip = _get_ip()
    if not _rate_ok(ip, max_req=5, window=60):
        return jsonify({"error": "Trop de requêtes. Réessayez dans une minute."}), 429
    return _tool_book_call(request.get_json(silent=True) or {})


# ─── Implémentation des tools ─────────────────────────────────────────────────

def _tool_get_offers(_args):
    return jsonify({"offers": OFFERS})

def _tool_get_case_studies(_args):
    return jsonify({"case_studies": CASE_STUDIES})

def _tool_contact(args):
    name    = str(args.get('name', '')).strip()[:100]
    email   = str(args.get('email', '')).strip()[:200]
    message = str(args.get('message', '')).strip()[:2000]

    if not name or not email or not message:
        return jsonify({"error": "Champs obligatoires : name, email, message"}), 400
    if not _valid_email(email):
        return jsonify({"error": "Email invalide"}), 400

    try:
        _send_email(
            subject=f"[IAfluence] Contact MCP de {name}",
            body=f"Nom : {name}\nEmail : {email}\n\nMessage :\n{message}"
        )
        return jsonify({"success": True, "message": "Message envoyé avec succès."})
    except Exception as e:
        return jsonify({"error": f"Erreur envoi email : {str(e)}"}), 500

def _tool_request_quote(args):
    name     = str(args.get('name', '')).strip()[:100]
    email    = str(args.get('email', '')).strip()[:200]
    company  = str(args.get('company', 'N/A')).strip()[:200]
    need     = str(args.get('need', '')).strip()[:2000]
    budget   = str(args.get('budget', 'N/A')).strip()[:100]
    deadline = str(args.get('deadline', 'N/A')).strip()[:100]

    if not name or not email or not need:
        return jsonify({"error": "Champs obligatoires : name, email, need"}), 400
    if not _valid_email(email):
        return jsonify({"error": "Email invalide"}), 400

    try:
        _send_email(
            subject=f"[IAfluence] Demande de devis de {name} ({company})",
            body=(
                f"Nom : {name}\nEmail : {email}\nEntreprise : {company}\n"
                f"Besoin : {need}\nBudget : {budget}\nDélai : {deadline}"
            )
        )
        return jsonify({"success": True, "message": "Demande de devis envoyée."})
    except Exception as e:
        return jsonify({"error": f"Erreur envoi email : {str(e)}"}), 500

def _tool_book_call(args):
    name            = str(args.get('name', '')).strip()[:100]
    email           = str(args.get('email', '')).strip()[:200]
    preferred_dates = str(args.get('preferred_dates', 'N/A')).strip()[:500]
    topic           = str(args.get('topic', 'Découverte')).strip()[:500]

    if not name or not email:
        return jsonify({"error": "Champs obligatoires : name, email"}), 400
    if not _valid_email(email):
        return jsonify({"error": "Email invalide"}), 400

    try:
        _send_email(
            subject=f"[IAfluence] Demande d'appel de {name}",
            body=(
                f"Nom : {name}\nEmail : {email}\n"
                f"Disponibilités : {preferred_dates}\nSujet : {topic}"
            )
        )
        return jsonify({"success": True, "message": "Demande d'appel envoyée. Nous vous contacterons rapidement."})
    except Exception as e:
        return jsonify({"error": f"Erreur envoi email : {str(e)}"}), 500
