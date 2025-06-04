# Guide d'utilisation du Chatbot IAfluence

Ce document explique comment utiliser le chatbot IAfluence une fois intégré dans votre site web.

## Introduction

Le chatbot IAfluence est un assistant virtuel intelligent qui répond aux questions sur IAfluence, ses services et son approche de l'IA. Il utilise la technologie RAG (Retrieval Augmented Generation) pour fournir des réponses précises et contextuelles.

## Interface utilisateur

Le chatbot apparaît en bas à droite de votre page web sous forme d'une fenêtre repliable :

1. **État replié** : Seul l'en-tête du chatbot est visible, avec le logo IAfluence et le titre.
2. **État déplié** : La fenêtre complète du chatbot est visible, avec l'historique des messages et le champ de saisie.

## Fonctionnalités

### Déplier/replier le chatbot

- Cliquez sur l'en-tête du chatbot ou sur le bouton avec la flèche (▼/▲) pour déplier ou replier le chatbot.

### Poser une question

1. Cliquez dans le champ de saisie en bas du chatbot.
2. Tapez votre question sur IAfluence.
3. Appuyez sur la touche Entrée ou cliquez sur le bouton d'envoi (flèche).

### Types de questions supportées

Le chatbot peut répondre à diverses questions concernant IAfluence, notamment :

- Informations générales sur IAfluence
- Services proposés par IAfluence
- Approche de l'IA et sécurité des données
- Public cible et région d'activité
- Méthodologie de travail
- Et bien plus encore...

### Exemples de questions

Voici quelques exemples de questions que vous pouvez poser au chatbot :

- "Qu'est-ce qu'IAfluence ?"
- "Quels sont vos services ?"
- "Comment IAfluence protège-t-il les données ?"
- "Quelle est votre approche de l'IA ?"
- "Pour quelles entreprises travaillez-vous ?"
- "Où êtes-vous situé ?"

## Personnalisation (pour les administrateurs)

Si vous êtes l'administrateur du site, vous pouvez personnaliser l'apparence du chatbot en modifiant les options dans le fichier de configuration ou directement dans le code d'intégration :

```javascript
window.IAfluenceChatbot.init({
    primaryColor: '#007BFF',  // Couleur principale
    accentColor: '#28A745',   // Couleur d'accent
    // Autres options...
});
```

## Maintenance et mise à jour

Le chatbot se met à jour automatiquement avec les dernières informations sur IAfluence lorsque la base de connaissances est mise à jour côté serveur. Aucune action n'est requise de la part des utilisateurs.

## Limites

Le chatbot est conçu pour répondre aux questions concernant IAfluence. Il peut ne pas être en mesure de répondre à des questions très spécifiques ou techniques qui sortent de son domaine de connaissances.

## Support

Si vous rencontrez des problèmes avec le chatbot ou si vous avez des questions qui nécessitent une assistance humaine, veuillez contacter IAfluence directement à support@iafluence.com.

---

Nous espérons que ce chatbot vous aidera à obtenir rapidement des informations sur IAfluence. N'hésitez pas à l'utiliser pour toutes vos questions !
