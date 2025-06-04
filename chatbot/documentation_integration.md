# Guide d'intégration du Chatbot IAfluence

Ce document explique comment intégrer le chatbot IAfluence dans n'importe quelle page web HTML.

## Prérequis

- Un serveur web pour héberger le backend du chatbot (Flask)
- Accès à l'API OpenRouter avec une clé valide
- Les fichiers du projet chatbot

## Structure des fichiers

Le projet est organisé comme suit :
```
chatbot_project/
├── app.py                  # Application Flask principale
├── backend/
│   ├── openrouter_api.py   # Module pour l'API OpenRouter
│   └── rag.py              # Module pour le système RAG
├── data/
│   └── iafluence_data.txt  # Données pour le RAG
├── static/
│   ├── css/
│   │   └── styles.css      # Styles du chatbot
│   ├── images/
│   │   └── logo.jpg        # Logo IAfluence
│   └── js/
│       └── chatbot.js      # JavaScript du chatbot
└── templates/
    └── index.html          # Template HTML de démonstration
```

## Installation du backend

1. Clonez le dépôt ou copiez les fichiers sur votre serveur
2. Installez les dépendances Python :
   ```bash
   pip install openai langchain langchain-community pypdf tiktoken faiss-cpu python-dotenv flask
   ```
3. Configurez les variables d'environnement dans un fichier `.env` :
   ```
   OPENROUTER_API_KEY=votre_clé_api
   OPENROUTER_MODEL=qwen/qwq-32b:free
   SITE_URL=https://votre-site.com
   SITE_NAME=Nom de votre site
   ```
4. Lancez l'application Flask :
   ```bash
   python app.py
   ```
   Ou configurez-la avec un serveur WSGI comme Gunicorn pour la production.

## Intégration du chatbot dans une page web

### Option 1 : Intégration complète

Pour intégrer le chatbot dans votre site web, ajoutez le code suivant à votre page HTML :

```html
<!-- Chatbot IAfluence -->
<link rel="stylesheet" href="https://votre-serveur.com/static/css/styles.css">

<div id="iafluence-chatbot-container" class="chatbot-container">
    <div class="chatbot-header" id="chatbot-header">
        <img src="https://votre-serveur.com/static/images/logo.jpg" alt="IAfluence Logo" class="chatbot-logo">
        <div class="chatbot-title">
            <h3>IAfluence Assistant</h3>
            <p>L'IA sur mesure, la sécurité par défaut.</p>
        </div>
        <button id="chatbot-toggle" class="chatbot-toggle">
            <span class="toggle-icon">▼</span>
        </button>
    </div>
    <div class="chatbot-body" id="chatbot-body">
        <div class="chatbot-messages" id="chatbot-messages">
            <div class="message bot-message">
                <p>Bonjour ! Je suis l'assistant virtuel d'IAfluence. Comment puis-je vous aider aujourd'hui ?</p>
            </div>
        </div>
        <div class="chatbot-input">
            <input type="text" id="user-input" placeholder="Posez votre question ici...">
            <button id="send-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            </button>
        </div>
    </div>
</div>

<script src="https://votre-serveur.com/static/js/chatbot.js"></script>
<script>
    // Configuration du chatbot
    window.IAfluenceChatbot.init({
        apiUrl: 'https://votre-serveur.com/api/chat',
        // Options de personnalisation (facultatives)
        primaryColor: '#007BFF',
        accentColor: '#28A745'
    });
</script>
<!-- Fin Chatbot IAfluence -->
```

Remplacez `https://votre-serveur.com` par l'URL de votre serveur où le backend Flask est hébergé.

### Option 2 : Intégration via iframe

Si vous préférez une intégration plus simple, vous pouvez utiliser un iframe :

```html
<iframe 
    src="https://votre-serveur.com" 
    style="position: fixed; bottom: 20px; right: 20px; width: 350px; height: 500px; border: none; z-index: 9999;"
    title="IAfluence Chatbot">
</iframe>
```

## Personnalisation

Vous pouvez personnaliser l'apparence du chatbot en modifiant les options dans la méthode `init` :

```javascript
window.IAfluenceChatbot.init({
    apiUrl: 'https://votre-serveur.com/api/chat',
    primaryColor: '#votre-couleur-primaire',
    accentColor: '#votre-couleur-accent',
    // Autres options...
});
```

## API du chatbot

Le chatbot communique avec le backend via une API REST :

- **Endpoint** : `/api/chat`
- **Méthode** : POST
- **Corps de la requête** :
  ```json
  {
    "message": "Votre question ici"
  }
  ```
- **Réponse** :
  ```json
  {
    "response": "Réponse du chatbot"
  }
  ```

## Dépannage

Si vous rencontrez des problèmes :

1. Vérifiez que le backend Flask est en cours d'exécution
2. Assurez-vous que les chemins vers les fichiers CSS et JS sont corrects
3. Vérifiez les erreurs dans la console du navigateur
4. Assurez-vous que la clé API OpenRouter est valide

## Support

Pour toute question ou assistance, contactez IAfluence à support@iafluence.com
