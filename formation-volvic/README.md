# Documentation d'utilisation - Projet Formation Volvic

## Présentation du projet

Ce projet implémente un système d'inscription pour la formation Volvic d'IAfluence. Il comprend :

- Un formulaire d'inscription HTML avec validation
- Un compteur dynamique qui affiche différents messages selon le nombre d'inscrits
- Une notification automatique par email lorsque 12 inscrits sont atteints
- Une base de données Supabase pour stocker les inscriptions
- Un script Python pour gérer les inscriptions et le compteur

## Structure des fichiers

```
formation-volvic/
├── index.html               # Page principale avec formulaire d'inscription
├── mentions-legales.html    # Page des mentions légales
├── styles.css               # Styles CSS du site
├── script.js                # Script JavaScript principal
├── notification.js          # Script pour la notification par email
├── supabase-setup.sql       # Commandes SQL pour configurer Supabase
├── supabase_manager.py      # Script Python pour gérer les inscriptions
└── test.sh                  # Script de test des fonctionnalités
```

## Configuration requise

- Serveur web (Apache, Nginx, etc.)
- Python 3.6+ avec le package `supabase`
- Compte Supabase avec une base de données configurée

## Installation et déploiement

### 1. Configuration de la base de données Supabase

1. Connectez-vous à votre compte Supabase : https://app.supabase.io/
2. Accédez à votre projet
3. Allez dans l'onglet "SQL Editor"
4. Créez une nouvelle requête
5. Copiez-collez les commandes SQL du fichier `supabase-setup.sql`
6. Exécutez la requête

Les commandes SQL créeront :
- Une table `inscriptions_volvic` pour stocker les emails
- Une politique de sécurité ligne à ligne (RLS)
- Une politique d'insertion pour permettre à tout le monde d'ajouter des inscriptions

### 2. Déploiement sur le serveur

Pour déployer le projet sur le serveur (51.44.83.98) avec la clé SSH fournie :

```bash
# Rendre la clé SSH utilisable
chmod 400 Chatbot.pem

# Se connecter au serveur
ssh -i Chatbot.pem ubuntu@51.44.83.98

# Créer le répertoire de destination
sudo mkdir -p /var/www/html/formation-volvic

# Donner les permissions nécessaires
sudo chown -R ubuntu:ubuntu /var/www/html/formation-volvic
```

Depuis votre machine locale, transférez les fichiers vers le serveur :

```bash
# Transférer tous les fichiers du projet
scp -i Chatbot.pem -r /home/ubuntu/formation-volvic/* ubuntu@51.44.83.98:/var/www/html/formation-volvic/
```

### 3. Configuration du serveur web (Nginx)

Sur le serveur, installez et configurez Nginx :

```bash
# Installer Nginx
sudo apt update
sudo apt install -y nginx

# Créer une configuration pour le site
sudo nano /etc/nginx/sites-available/formation-volvic
```

Contenu du fichier de configuration :

```nginx
server {
    listen 80;
    server_name iafluence.fr;

    location /formation-volvic {
        alias /var/www/html/formation-volvic;
        index index.html;
        try_files $uri $uri/ =404;
    }
}
```

Activez la configuration et redémarrez Nginx :

```bash
sudo ln -s /etc/nginx/sites-available/formation-volvic /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Installation des dépendances Python

Sur le serveur, installez les dépendances Python nécessaires :

```bash
# Installer pip si nécessaire
sudo apt install -y python3-pip

# Installer le package supabase
pip3 install supabase

# Rendre le script exécutable
chmod +x /var/www/html/formation-volvic/supabase_manager.py
```

## Utilisation

### Accès au site

Le site sera accessible à l'adresse : https://iafluence.fr/formation-volvic

### Gestion des inscriptions avec le script Python

Le script `supabase_manager.py` permet de gérer les inscriptions depuis la ligne de commande :

```bash
# Afficher l'aide
python3 supabase_manager.py

# Configurer la base de données
python3 supabase_manager.py setup

# Compter le nombre d'inscrits
python3 supabase_manager.py compter

# Inscrire un email
python3 supabase_manager.py inscrire email@example.com

# Réinitialiser le compteur (supprimer toutes les inscriptions)
python3 supabase_manager.py reinitialiser
```

### Fonctionnement du compteur dynamique

Le compteur affiche différents messages selon le nombre d'inscrits :

| Nb d'inscrits | Message affiché |
|---------------|-----------------|
| 0 à 7         | X personnes déjà inscrites. |
| 8 à 9         | 🔥 La formation est imminente ! |
| 10 à 11       | ⚡ Il ne reste plus beaucoup de places... |
| 12 ou plus    | 🚫 Les inscriptions sont closes ! |

### Notification automatique

Lorsque 12 personnes sont inscrites, un email automatique est envoyé à suan.tay@iafluence.fr avec :

- Objet : Inscriptions closes - Formation Volvic
- Corps : 12 personnes se sont inscrites. Il est temps de fermer les inscriptions.

## Maintenance

### Réinitialisation du compteur

Pour remettre le compteur à zéro, utilisez la commande :

```bash
python3 supabase_manager.py reinitialiser
```

Ou exécutez directement la requête SQL dans l'interface Supabase :

```sql
DELETE FROM inscriptions_volvic;
```

### Modification des messages du compteur

Les messages du compteur peuvent être modifiés dans le fichier `script.js` :

```javascript
// Déterminer le message à afficher selon le nombre d'inscrits
let message = '';
let classe = '';

if (count >= 12) {
    message = '🚫 Les inscriptions sont closes !';
    classe = 'compteur-ferme';
    // ...
} else if (count >= 10) {
    message = `⚡ Il ne reste plus beaucoup de places...`;
    classe = 'compteur-urgent';
} else if (count >= 8) {
    message = `🔥 La formation est imminente !`;
    classe = 'compteur-imminent';
} else {
    message = `${count} personne${count > 1 ? 's' : ''} déjà inscrite${count > 1 ? 's' : ''}.`;
    classe = 'compteur-normal';
}
```

## Dépannage

### Problèmes de connexion à Supabase

Si vous rencontrez des problèmes de connexion à Supabase, vérifiez :

1. Que les identifiants Supabase dans `script.js` et `supabase_manager.py` sont corrects
2. Que la table `inscriptions_volvic` a été créée correctement
3. Que les politiques RLS sont configurées correctement

### Problèmes d'affichage du compteur

Si le compteur ne s'affiche pas correctement :

1. Vérifiez la console JavaScript du navigateur pour les erreurs
2. Assurez-vous que le client Supabase est correctement initialisé
3. Vérifiez que la fonction `mettreAJourCompteur()` est appelée au chargement de la page

### Problèmes d'envoi de notification

La notification par email est simulée côté client dans cette implémentation. Pour une implémentation réelle, il faudrait :

1. Configurer un serveur SMTP
2. Modifier la fonction `envoyerNotificationEmail()` pour utiliser ce serveur
3. Implémenter cette fonction côté serveur plutôt que côté client

## Contact

Pour toute question ou assistance, contactez :
- Email : suan.tay@iafluence.fr
