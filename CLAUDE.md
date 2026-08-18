# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The production website of **IAfluence** (iafluence.fr), a French AI consulting micro-business. It is **not** a framework project: there is no `package.json`, no bundler, no build step. The HTML files at the repo root *are* the deployed pages, and `static/` is served as-is. A small Flask app (`chatbot/`) provides the dynamic `/api/*` surface.

All user-facing content is in **French**. Match that in copy, comments in the HTML/CSS, and commit messages that touch content.

## Commands

```bash
# Chatbot / API backend (run from repo root; Python puts chatbot/ on sys.path)
pip install -r chatbot/requirement.txt
pip install anthropic          # NOT in requirement.txt but imported by backend/openrouter_api.py
python chatbot/app.py          # → http://localhost:5000

# Tests (run from repo root — tests import `chatbot.backend.rag`)
pytest
pytest tests/test_rag.py::test_get_relevant_context_is_string   # single test
```

CI (`.github/workflows/tests.yml`) runs `pytest` on Python 3.12 for every push to `main` and every PR.

Previewing the static pages with `python -m http.server` works for layout, but every `/api/*` call (WebMCP tools, contact forms) will 404 unless Flask is running on the same origin — in production nginx proxies `/api/` to `localhost:5000`.

Deployment is manual on an AWS EC2 box: `ssh ubuntu@13.51.113.255`, project at `/var/www/html`, chatbot under systemd (`sudo systemctl restart chatbot`, `sudo journalctl -u chatbot -f`).

## Architecture

### Two halves that must stay in sync

The five capabilities the site exposes to AI agents are **defined twice**:

- `static/js/webmcp-init.js` — browser side. Registers tools via the native `document.modelContext.registerTool()` API, falling back to a `window.WebMCP` object when the experimental API is absent. Holds titles, descriptions, JSON schemas, and annotations; each handler just `fetch`es a dedicated REST endpoint.
- `chatbot/backend/mcp.py` — server side. Flask blueprint holding a second copy of the schemas (`MCP_TOOLS`), the dispatcher (`POST /api/mcp/call`), the dedicated endpoints (`/api/offers`, `/api/case-studies`, `/api/contact`, `/api/quote`, `/api/book-call`), origin checking, per-IP rate limiting, and Gmail SMTP sending.

Adding, renaming, or reshaping a tool means editing **both files**. The tools are `get_offers`, `get_case_studies`, `contact`, `request_quote`, `book_call`.

`mcp.py` also hardcodes the `OFFERS` and `CASE_STUDIES` payloads. Those prices and links are duplicated in the HTML pricing pages (`pack1-3.html`, `customgpt.html`, `index.html`) — changing a price in one place without the other makes the site lie to agents.

Despite the naming, this REST surface is MCP-*shaped* JSON, not an MCP server with MCP transport. `mcp-test.html` is a manual harness for exercising it in a browser.

### Chatbot pipeline

`chatbot/app.py` → guardrails → `RAGProcessor` → Anthropic. Non-obvious details:

- `backend/openrouter_api.py` is named after a provider it no longer uses: the class `OpenRouterAPI` wraps the **Anthropic SDK** (`claude-haiku-4-5-20251001` by default, override with `ANTHROPIC_MODEL`). `openai` is still pinned in `requirement.txt` but unused.
- `backend/rag.py` imports FAISS/embeddings from langchain but **never uses them** — retrieval is naive keyword-overlap scoring over text chunks of `chatbot/data/iafluence_data.txt`. Editing that text file is how you change what the bot knows.
- Guardrails are layered: `sanitize_input()` in `app.py` (500-char cap + a regex blocklist for prompt injection, returning a canned deflection) plus `SYSTEM_PROMPT` in `openrouter_api.py` (scope-limited to IAfluence, 2–4 sentence answers).
- `/api/chat` returns JSON; `/api/chat/stream` streams raw text token-by-token. The widget renders it as Markdown client-side (markdown-it + DOMPurify).

### Static site conventions

Three generations of page styling coexist. Copy the one that matches the page you're extending rather than mixing them:

| Style | Pages | Stack |
|---|---|---|
| Current design system | `index.html`, `about.html`, `contact.html`, `realisations.html`, `mentions-legales.html`, `politique-confidentialite.html` | `static/css/conseil-ia.css` (+ `realisations.css`) |
| Tailwind CDN | `pack1-3.html`, `customgpt.html` | `https://cdn.tailwindcss.com`, Poppins/Roboto |
| Legacy | `services.html` | `static/css/styles.css` + `responsive.css` |

Every public page includes `static/css/nav.css?v=3` (bump the query string when nav styles change), `cookie-consent.css`, and `static/js/cookie-consent.js` + `static/js/webmcp-init.js`. Add `static/js/site-config.js` on any page with booking/payment CTAs.

- **Never hardcode booking or Stripe URLs in HTML.** They live in `static/js/site-config.js` under `window.IAFLUENCE_CONFIG.links`; markup opts in with `<a href="#" data-iafluence-link="discoveryCall">`, and the script rewrites `href` on load.
- **Never add Google Analytics or Clarity tags to HTML.** `static/js/cookie-consent.js` injects GA (`G-K6QH3MSLX0`) and Clarity (`vcjdk47uxg`) only after the visitor opts in, and clears their cookies on opt-out. Bypassing it breaks the consent guarantee.
- Adding or removing a public page means updating **four** places: `sitemap.xml`, the header/footer `<nav>` blocks on the other pages, `llms.txt` (the AI-agent-facing site summary), and `robots.txt` if crawl rules change.
- Pages carry hand-written JSON-LD (`ProfessionalService`, offers, FAQ) in `<head>`. Keep the structured prices consistent with the visible ones.

### Not part of the main site

`conseil-ia/`, `merci-conseil-ia/`, `formation-volvic/` (Supabase signup app), `rlv/`, `mastere-ia-site/`, `envoimail/`, `CV/`, `Petit-dej/`, plus `index2.html`, `chatbot-frame.html`, `index.nginx-debian.html`, and `mention-legales.html` (a stale near-duplicate of `mentions-legales.html`) are standalone POCs, archives, or leftovers. They have their own conventions and are not wired into the main navigation — don't refactor them alongside site changes. `.bak` files under `chatbot/` are dead.

## Secrets

`chatbot/.env` (gitignored) supplies `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, and the Gmail SMTP trio `EMAIL_EXPEDITEUR` / `EMAIL_DESTINATAIRE` / `GMAIL_APP_PASSWORD`. `mcp.py` falls back to a personal Gmail address when they are unset, so a misconfigured deploy silently fails on send rather than at boot.
