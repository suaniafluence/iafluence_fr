# IAfluence

Ce dépôt contient le site web d'**IAfluence** ainsi que plusieurs projets annexes.
On y trouve :

- Les pages HTML du site principal à la racine du dépôt
- Le dossier `chatbot/` contenant l'application Flask du chatbot IAfluence
- Le dossier `envoimail/` pour l'envoi d'e-mails via Flask
- Le dossier `formation-volvic/` présentant un projet d'inscription avec Supabase
- Le dossier `rlv/` utilisé pour un site de démonstration de POC

## Aperçu rapide

Ouvrez simplement `index.html` dans un navigateur pour consulter la page d'accueil du site.

## Lancer le chatbot

Le dossier `chatbot/` permet de démarrer un service Flask qui fournit un chatbot basé sur la technologie RAG.

### Prérequis

- Python 3
- `pip` installé

### Installation

1. Placez-vous dans le dossier `chatbot` :
   ```bash
   cd chatbot
   ```
2. Installez les dépendances :
   ```bash
   pip install openai langchain langchain-community pypdf tiktoken faiss-cpu python-dotenv flask
   ```
3. Créez un fichier `.env` à la racine du dossier `chatbot` et définissez au minimum :
   ```
   OPENROUTER_API_KEY=VotreCleAPI
   OPENROUTER_MODEL=qwen/qwq-32b:free
   SITE_URL=https://votre-site.com
   SITE_NAME=Nom de votre site
   ```
4. Lancez l'application :
   ```bash
   python app.py
   ```

Une fois démarré, le service écoute par défaut sur le port `5000`.

## Autres dossiers

- `envoimail/` : petit exemple d'envoi d'e-mail avec Flask. Les variables d'environnement `EMAIL_EXPEDITEUR`, `EMAIL_DESTINATAIRE`, `GMAIL_APP_PASSWORD` et `SECRET_KEY` doivent être définies.
- `formation-volvic/` : projet d'inscription à une formation. Reportez-vous au fichier [`formation-volvic/README.md`](formation-volvic/README.md) pour toutes les instructions détaillées.
- `rlv/` : site vitrine pour présenter différents POC, documenté dans [`rlv/documentation.md`](rlv/documentation.md).

## Licence

Aucune licence spécifique n'est fournie avec ce dépôt.
