# IAfluence

Site web d'**IAfluence** — spécialiste IA sur mesure pour les professionnels et entreprises.

## Accès rapide

| Environnement | Commande |
|---|---|
| **Serveur AWS** | `ssh ubuntu@13.51.113.255` |
| **Site local** | `http://localhost` |
| **Chatbot local** | `http://localhost:5000` |

---

## Structure du dépôt

```
/
├── index.html                  # Page d'accueil principale
├── static/
│   ├── images/                 # Assets (favicon, caricature, etc.)
│   ├── js/
│   │   └── webmcp-init.js      # SDK WebMCP côté navigateur
│   └── linkedin_posts.json     # URLs des posts LinkedIn (chargés dynamiquement)
├── chatbot/                    # Application Flask du chatbot
│   ├── app.py                  # Serveur Flask + guardrails
│   ├── backend/
│   │   ├── openrouter_api.py   # Client Anthropic Claude (streaming réel)
│   │   ├── mcp.py              # Blueprint Flask — API MCP REST
│   │   └── rag.py              # Processeur RAG (contexte IAfluence)
│   ├── static/js/chatbot.js    # Widget chatbot + streaming + Markdown
│   └── templates/index.html    # Template Flask du widget
├── envoimail/                  # Envoi d'e-mails Flask (SMTP Gmail)
├── formation-volvic/           # Inscription formation avec Supabase
└── rlv/                        # Site vitrine POC
```

---

## Chatbot IAfluence

### Fonctionnement

Le chatbot est une application **Flask** qui combine :
- **Anthropic Claude** (`claude-haiku-4-5-20251001`) comme modèle de langage
- **RAG** (Retrieval-Augmented Generation) pour injecter le contexte IAfluence
- **Streaming réel** token par token via l'API Anthropic
- **Guardrails** : limite de longueur (500 chars), détection d'injection de prompt
- **Markdown** rendu côté client avec `marked.js`

### Prérequis

- Python 3.10+
- Un compte [Anthropic](https://console.anthropic.com/) avec une clé API

### Installation

```bash
cd chatbot
pip install -r requirement.txt
```

### Configuration `.env`

Créez `chatbot/.env` :

```env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-haiku-4-5-20251001

# MCP — envoi d'e-mails
EMAIL_EXPEDITEUR=votre@gmail.com
EMAIL_DESTINATAIRE=contact@iafluence.fr
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### Lancement

```bash
python chatbot/app.py
# → http://localhost:5000
```

---

## API MCP (WebMCP)

Le chatbot expose une **API REST compatible MCP** permettant aux agents IA d'interagir avec IAfluence.

### Découverte des tools

```
GET /api/mcp/tools
```

### Tools disponibles

| Tool | Description |
|---|---|
| `get_offers` | Liste des packs et tarifs |
| `get_case_studies` | Études de cas clients |
| `contact` | Envoie un message de contact |
| `request_quote` | Demande un devis |
| `book_call` | Réserve un appel découverte |

### Appel générique

```
POST /api/mcp/call
{ "name": "contact", "arguments": { "name": "...", "email": "...", "message": "..." } }
```

### Endpoints dédiés

```
GET  /api/offers
GET  /api/case-studies
POST /api/contact
POST /api/quote
POST /api/book-call
```

### SDK navigateur

`window.WebMCP` est exposé globalement sur le site :

```js
// Lister les tools
window.WebMCP.getTools();

// Appeler un tool
await window.WebMCP.callTool('get_offers', {});
await window.WebMCP.callTool('contact', { name: 'Jean', email: 'jean@ex.com', message: 'Bonjour' });
```

---

## Site principal (`index.html`)

Fonctionnalités notables :
- **Sélecteur de langue** par drapeaux 🇫🇷🇬🇧🇪🇸 (Google Translate intégré, barre masquée)
- **Posts LinkedIn** chargés dynamiquement depuis `static/linkedin_posts.json`
- **Analytics** : Google Analytics (`G-K6QH3MSLX0`) + Microsoft Clarity (`vcjdk47uxg`)

Pour mettre à jour les posts LinkedIn, éditez simplement `static/linkedin_posts.json` :

```json
[
  "https://www.linkedin.com/embed/feed/update/urn:li:...",
  "https://www.linkedin.com/embed/feed/update/urn:li:...",
  "https://www.linkedin.com/embed/feed/update/urn:li:..."
]
```

---

## Autres modules

- **`envoimail/`** : envoi d'e-mails Flask. Variables requises : `EMAIL_EXPEDITEUR`, `EMAIL_DESTINATAIRE`, `GMAIL_APP_PASSWORD`, `SECRET_KEY`.
- **`formation-volvic/`** : inscription à une formation avec Supabase. Voir [`formation-volvic/README.md`](formation-volvic/README.md).
- **`rlv/`** : site vitrine POC. Voir [`rlv/documentation.md`](rlv/documentation.md).

---

## Tests

```bash
pip install pytest
pytest
```

Un workflow GitHub Actions exécute les tests à chaque push/PR sur `main`.

---

## Déploiement AWS

Le site tourne sur une instance AWS EC2 Ubuntu.

```bash
# Connexion
ssh ubuntu@13.51.113.255

# Emplacement du projet
cd /var/www/html

# Redémarrer le chatbot (si géré par systemd)
sudo systemctl restart chatbot

# Voir les logs
sudo journalctl -u chatbot -f
```
