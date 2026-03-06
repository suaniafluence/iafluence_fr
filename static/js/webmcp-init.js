/**
 * WebMCP — iafluence.fr
 * Registre de tools côté navigateur.
 * Les agents IA peuvent appeler window.WebMCP.callTool(name, args)
 * ou lire window.WebMCP.getTools() pour découvrir les tools disponibles.
 */
(function () {
    'use strict';

    const API_BASE = '/api';

    // ── Helpers ──────────────────────────────────────────────────────────────

    async function _post(path, body) {
        const r = await fetch(API_BASE + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || 'Erreur serveur');
        return json;
    }

    async function _get(path) {
        const r = await fetch(API_BASE + path);
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || 'Erreur serveur');
        return json;
    }

    // ── Définition des tools ─────────────────────────────────────────────────

    const _tools = {

        get_offers: {
            description: 'Retourne les offres et packs de services IAfluence avec prix et liens.',
            inputSchema: { type: 'object', properties: {}, required: [] },
            handler: async () => _get('/offers')
        },

        get_case_studies: {
            description: "Retourne les études de cas clients IAfluence.",
            inputSchema: { type: 'object', properties: {}, required: [] },
            handler: async () => _get('/case-studies')
        },

        contact: {
            description: 'Envoie un message de contact à IAfluence.',
            inputSchema: {
                type: 'object',
                properties: {
                    name:    { type: 'string', description: 'Nom complet' },
                    email:   { type: 'string', format: 'email' },
                    message: { type: 'string', description: 'Message' }
                },
                required: ['name', 'email', 'message']
            },
            handler: async (args) => _post('/contact', args)
        },

        request_quote: {
            description: 'Demande un devis personnalisé IAfluence.',
            inputSchema: {
                type: 'object',
                properties: {
                    name:     { type: 'string' },
                    email:    { type: 'string', format: 'email' },
                    company:  { type: 'string' },
                    need:     { type: 'string', description: 'Besoin IA décrit' },
                    budget:   { type: 'string' },
                    deadline: { type: 'string' }
                },
                required: ['name', 'email', 'need']
            },
            handler: async (args) => _post('/quote', args)
        },

        book_call: {
            description: "Réserve un appel découverte avec IAfluence.",
            inputSchema: {
                type: 'object',
                properties: {
                    name:            { type: 'string' },
                    email:           { type: 'string', format: 'email' },
                    preferred_dates: { type: 'string', description: 'Disponibilités souhaitées' },
                    topic:           { type: 'string', description: "Sujet de l'appel" }
                },
                required: ['name', 'email']
            },
            handler: async (args) => _post('/book-call', args)
        }
    };

    // ── Validation légère ────────────────────────────────────────────────────

    function _validate(schema, args) {
        const required = schema.required || [];
        const missing = required.filter(k => !args[k]);
        if (missing.length) throw new Error('Champs manquants : ' + missing.join(', '));
    }

    // ── API publique exposée sur window.WebMCP ───────────────────────────────

    window.WebMCP = {
        version: '1.0.0',
        site: 'iafluence.fr',

        /** Liste des tools disponibles (format MCP) */
        getTools: function () {
            return Object.entries(_tools).map(([name, t]) => ({
                name,
                description: t.description,
                inputSchema: t.inputSchema
            }));
        },

        /** Appelle un tool par son nom avec ses arguments */
        callTool: async function (name, args) {
            const tool = _tools[name];
            if (!tool) throw new Error('Tool inconnu : ' + name);
            _validate(tool.inputSchema, args || {});
            return await tool.handler(args || {});
        },

        /** Raccourci : récupère la liste des tools depuis le serveur */
        discoverTools: async function () {
            return _get('/mcp/tools');
        }
    };

    console.info('[WebMCP] Initialisé — ' + Object.keys(_tools).length + ' tools enregistrés.');
})();
