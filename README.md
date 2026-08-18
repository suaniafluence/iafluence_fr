# IAfluence

Site web d'**IAfluence** — conseil IA à l'heure pour professionnels, indépendants, TPE et PME.

Le site est un ensemble de pages HTML statiques servies par Nginx. Un petit service Flask
expose uniquement l'API des outils MCP sous `/api/`. Il n'y a pas d'étape de build, pas de
bundler et pas de `package.json` : les fichiers HTML de la racine sont les pages déployées.

## Accès rapide

| Environnement | Commande |
|---|---|
| **Serveur AWS** | `ssh ubuntu@13.51.113.255` |
| **Site en production** | https://iafluence.fr |
| **API MCP locale** | `http://localhost:5000/api/mcp/tools` |

---

## Structure

```
/
├── index.html                     # Conseil IA à l'heure (accueil)
├── realisations.html              # Prototypes et preuves de concept
├── about.html                     # Suan Tay et IAfluence
├── contact.html                   # Contact et prise de rendez-vous
├── mentions-legales.html          # Obligatoire
├── politique-confidentialite.html # Obligatoire
├── sitemap.xml / robots.txt / llms.txt
├── static/
│   ├── css/     conseil-ia.css · nav.css · realisations.css · cookie-consent.css
│   ├── js/      webmcp-init.js · site-config.js · cookie-consent.js · main.js
│   └── images/
├── chatbot/                       # Backend Flask (nom historique)
│   ├── app.py                     # Point d'entrée, ne monte que le blueprint MCP
│   ├── backend/mcp.py             # Outils MCP : schémas, données, routes, envoi e-mail
│   └── requirement.txt
└── tests/test_mcp.py
```

Le répertoire `chatbot/` ne contient plus de chatbot : le nom est conservé parce que
l'unité systemd et la configuration Nginx du serveur pointent vers ce chemin.

---

## Les 4 pages et le référencement

Ajouter ou retirer une page implique de mettre à jour **quatre** endroits :

1. `sitemap.xml`
2. les blocs `<nav>` d'en-tête et de pied de page des autres pages
3. `llms.txt` — le résumé du site destiné aux assistants IA
4. `robots.txt` si les règles de crawl changent

Chaque page porte son `<link rel="canonical">`, ses balises OpenGraph et son JSON-LD.
Les entités sont reliées par des `@id` partagés (`#business`, `#suan-tay`, `#website`),
ce qui permet aux moteurs de comprendre qu'il s'agit de la même entreprise partout.

Le `FAQPage` de `index.html` doit rester **identique mot pour mot** au contenu visible
des `<details>` de la section FAQ : c'est la condition posée par Google.

`robots.txt` autorise explicitement les crawlers génératifs (GPTBot, ClaudeBot,
PerplexityBot, Google-Extended…).

---

## Outils MCP et WebMCP

Les quatre capacités exposées aux agents IA sont **définies deux fois**, et les deux
définitions doivent rester synchronisées :

- `static/js/webmcp-init.js` — côté navigateur. Enregistre les outils dans l'API WebMCP
  native (`document.modelContext.registerTool()`), avec repli sur `window.WebMCP`.
- `chatbot/backend/mcp.py` — côté serveur. Schémas, données, contrôle d'origine,
  rate limiting par IP et envoi d'e-mail via Gmail SMTP.

| Tool | Endpoint | Effet |
|---|---|---|
| `get_offers` | `GET /api/offers` | Offres et tarifs |
| `contact` | `POST /api/contact` | Envoie un e-mail |
| `request_quote` | `POST /api/quote` | Envoie un e-mail |
| `book_call` | `POST /api/book-call` | Envoie un e-mail |

Découverte : `GET /api/mcp/tools`. Appel générique : `POST /api/mcp/call`
avec `{ "name": ..., "arguments": {...} }`.

`OFFERS` dans `mcp.py` est la source faisant foi pour les tarifs communiqués aux agents.
Elle doit rester cohérente avec les prix affichés sur `index.html` et avec le JSON-LD.

### Depuis un navigateur

```js
await window.WebMCP.ready;            // statut de l'enregistrement natif
window.WebMCP.getTools();             // lister les outils
await window.WebMCP.callTool('get_offers', {});
```

---

## Développement local

```bash
pip install -r chatbot/requirement.txt
python chatbot/app.py          # API sur http://localhost:5000
```

Les pages HTML s'ouvrent directement dans un navigateur, mais les appels `/api/*`
échouent tant que Flask ne tourne pas sur la même origine. En production, Nginx
proxyfie `/api/` vers `localhost:5000` (HTTPS via Certbot) ; Flask écoute sur
`127.0.0.1` uniquement.

### Variables d'environnement

`chatbot/.env` (non versionné) :

```env
EMAIL_EXPEDITEUR=votre@gmail.com
EMAIL_DESTINATAIRE=contact@iafluence.fr
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

Sans ces variables, `mcp.py` retombe sur une adresse par défaut et l'envoi échoue
silencieusement à l'exécution plutôt qu'au démarrage.

### Liens de réservation et paiement

Ils ne sont **jamais** écrits en dur dans le HTML. Ils vivent dans
`static/js/site-config.js` sous `window.IAFLUENCE_CONFIG.links` ; le markup s'y
raccroche avec `<a href="#" data-iafluence-link="stripe2h">` et le script réécrit
le `href` au chargement.

### Analytics

Google Analytics et Microsoft Clarity ne sont **jamais** posés dans le HTML.
`static/js/cookie-consent.js` les injecte après consentement et supprime leurs
cookies en cas de refus.

---

## Tests

```bash
pip install pytest
pytest
```

`tests/test_mcp.py` couvre la découverte des outils, les endpoints de lecture, le
contrôle d'origine, le rejet des outils inconnus et la validation des e-mails.
Un workflow GitHub Actions les exécute à chaque push et chaque PR sur `main`.

---

## Déploiement

```bash
ssh ubuntu@13.51.113.255
cd /var/www/html
git pull
sudo systemctl restart chatbot     # service Flask de l'API MCP
sudo journalctl -u chatbot -f
```
