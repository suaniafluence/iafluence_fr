# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The production website of **IAfluence** (iafluence.fr), a French AI consulting micro-business. It is a **4-page static site** — `index.html`, `realisations.html`, `about.html`, `contact.html`, plus two legally required pages — served by Nginx, with a small Flask service exposing only the MCP tool API under `/api/`. There is no `package.json`, no bundler, no build step: the HTML files at the repo root *are* the deployed pages.

All user-facing content is in **French**. Match that in copy and in commit messages that touch content.

## Commands

```bash
# MCP API backend (run from repo root; Python puts chatbot/ on sys.path)
pip install -r chatbot/requirement.txt
python chatbot/app.py          # → http://localhost:5000/api/mcp/tools

# Tests (run from repo root — tests import `chatbot.backend.mcp`)
pytest
pytest tests/test_mcp.py::test_tool_discovery_lists_five_tools   # single test
```

CI (`.github/workflows/tests.yml`) runs `pytest` on Python 3.12 for every push to `main` and every PR.

Opening the HTML files directly works for layout, but every `/api/*` call fails unless Flask runs on the same origin — in production Nginx proxies `/api/` to `localhost:5000` and Flask binds `127.0.0.1` only.

Deployment is manual: `ssh ubuntu@13.51.113.255`, project at `/var/www/html`, Flask under systemd (`sudo systemctl restart chatbot`).

## Architecture

### `chatbot/` contains no chatbot

The directory name is historical. The conversational assistant (Anthropic client, keyword RAG, widget) was removed; the name stays because the server's systemd unit and Nginx config point at that path. Renaming it requires touching the deployed server, not just this repo.

`chatbot/app.py` is now a ~20-line entrypoint that registers one blueprint and a `/health` route. All logic lives in `chatbot/backend/mcp.py`.

### The four tools are defined twice

- `static/js/webmcp-init.js` — browser side. Registers tools via the native `document.modelContext.registerTool()` API, falling back to a `window.WebMCP` object when the experimental API is absent. Holds titles, descriptions, JSON schemas and annotations; each handler `fetch`es a dedicated REST endpoint.
- `chatbot/backend/mcp.py` — server side. A second copy of the schemas (`MCP_TOOLS`), the dispatcher (`POST /api/mcp/call`), the dedicated endpoints, origin checking, per-IP rate limiting and Gmail SMTP sending.

Adding, renaming or reshaping a tool means editing **both files**. The tools are `get_offers`, `contact`, `request_quote`, `book_call` — the last three send a real e-mail.

`OFFERS` in `mcp.py` is hardcoded and is what AI agents quote as authoritative. Two consequences:

- Prices there must match the visible prices on `index.html` and its JSON-LD. The hourly offer (75 €/h) is the current business; the old 1 490 / 3 900 / 8 900 € packs were removed along with their pages.
- Every `cta_url` and `link` must point at a page that still exists. Deleting a page without fixing these hands agents a 404.

### Static site conventions

All six pages share one design system: `static/css/conseil-ia.css` plus `nav.css?v=3` (bump the query string when nav styles change), `cookie-consent.css`, and `realisations.css` on the portfolio page only. Every page loads `static/js/cookie-consent.js` and `static/js/webmcp-init.js`; pages with booking CTAs also load `static/js/site-config.js`.

- **Never hardcode booking or Stripe URLs in HTML.** They live in `static/js/site-config.js` under `window.IAFLUENCE_CONFIG.links`; markup opts in with `<a href="#" data-iafluence-link="stripe2h">` and the script rewrites `href` on load.
- **Never add Google Analytics or Clarity tags to HTML.** `static/js/cookie-consent.js` injects GA (`G-K6QH3MSLX0`) and Clarity (`vcjdk47uxg`) only after opt-in and clears their cookies on opt-out.
- Adding or removing a page means updating **four** places: `sitemap.xml`, the header and footer `<nav>` blocks of the other pages, `llms.txt`, and `robots.txt` if crawl rules change.

### SEO / GEO surface

Every page carries a canonical link, OpenGraph tags and hand-written JSON-LD. Entities are joined by shared `@id`s — `#business`, `#suan-tay`, `#website` — so `index.html`, `about.html`, `contact.html` and `realisations.html` describe one linked graph rather than four unrelated pages. Keep those `@id`s stable.

The `FAQPage` block in `index.html` must stay **word-for-word identical** to the visible `<details>` FAQ text; that equivalence is what makes the markup eligible rather than spammy. The same rule applies to any new structured data: don't describe content that isn't on the page.

`robots.txt` explicitly allows the generative crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…), and `llms.txt` is the agent-facing site summary — it documents the pages, the facts, and the MCP endpoints, and names `get_offers` as the authoritative source for pricing.

## Secrets

`chatbot/.env` (gitignored) supplies `EMAIL_EXPEDITEUR`, `EMAIL_DESTINATAIRE` and `GMAIL_APP_PASSWORD`. `mcp.py` falls back to a default address when they are unset, so a misconfigured deploy fails silently on send rather than at boot.
