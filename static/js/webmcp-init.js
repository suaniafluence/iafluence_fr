/**
 * WebMCP — iafluence.fr
 *
 * Registers IAfluence capabilities with the native WebMCP browser API and
 * keeps window.WebMCP as a backwards-compatible API for older agents/tests.
 */
(function () {
    'use strict';

    if (window.WebMCP && window.WebMCP.site === 'iafluence.fr') return;

    const API_BASE = '/api';

    async function parseResponse(response) {
        const contentType = response.headers.get('content-type') || '';
        const payload = contentType.includes('application/json')
            ? await response.json()
            : { error: await response.text() };

        if (!response.ok) {
            throw new Error(payload.error || `Erreur serveur (${response.status})`);
        }
        return payload;
    }

    async function post(path, body, options) {
        const response = await fetch(API_BASE + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: options && options.signal
        });
        return parseResponse(response);
    }

    async function get(path, options) {
        const response = await fetch(API_BASE + path, {
            signal: options && options.signal
        });
        return parseResponse(response);
    }

    const tools = {
        get_offers: {
            title: 'Consulter les offres IAfluence',
            description: 'Retourne les offres IAfluence avec leurs tarifs, descriptions et liens officiels.',
            inputSchema: { type: 'object', properties: {}, additionalProperties: false },
            annotations: { readOnlyHint: true, untrustedContentHint: false },
            handler: (_args, options) => get('/offers', options)
        },


        contact: {
            title: 'Contacter IAfluence',
            description: "Envoie immédiatement un e-mail de contact à IAfluence au nom de l'utilisateur. À appeler uniquement après validation explicite du nom, de l'adresse e-mail et du message par l'utilisateur.",
            inputSchema: {
                type: 'object',
                properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100, description: 'Nom complet de la personne' },
                    email: { type: 'string', format: 'email', maxLength: 200, description: 'Adresse e-mail de réponse' },
                    message: { type: 'string', minLength: 1, maxLength: 2000, description: 'Message à envoyer' }
                },
                required: ['name', 'email', 'message'],
                additionalProperties: false
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            handler: (args, options) => post('/contact', args, options)
        },

        request_quote: {
            title: 'Demander un devis IAfluence',
            description: "Envoie immédiatement une demande de devis à IAfluence. À appeler uniquement après validation explicite de toutes les informations par l'utilisateur.",
            inputSchema: {
                type: 'object',
                properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100, description: 'Nom complet' },
                    email: { type: 'string', format: 'email', maxLength: 200, description: 'Adresse e-mail de réponse' },
                    company: { type: 'string', maxLength: 200, description: "Nom de l'entreprise, si applicable" },
                    need: { type: 'string', minLength: 1, maxLength: 2000, description: 'Besoin IA à chiffrer' },
                    budget: { type: 'string', maxLength: 100, description: 'Budget indicatif, si connu' },
                    deadline: { type: 'string', maxLength: 100, description: 'Échéance souhaitée, si connue' }
                },
                required: ['name', 'email', 'need'],
                additionalProperties: false
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            handler: (args, options) => post('/quote', args, options)
        },

        book_call: {
            title: 'Demander un appel découverte IAfluence',
            description: "Envoie immédiatement une demande d'appel découverte à IAfluence. Il ne crée pas directement un rendez-vous dans un calendrier. À appeler uniquement après validation explicite des coordonnées par l'utilisateur.",
            inputSchema: {
                type: 'object',
                properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100, description: 'Nom complet' },
                    email: { type: 'string', format: 'email', maxLength: 200, description: 'Adresse e-mail de réponse' },
                    preferred_dates: { type: 'string', maxLength: 500, description: 'Créneaux ou disponibilités souhaités' },
                    topic: { type: 'string', maxLength: 500, description: "Sujet de l'appel" }
                },
                required: ['name', 'email'],
                additionalProperties: false
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            handler: (args, options) => post('/book-call', args, options)
        }
    };

    function validate(schema, args) {
        const input = args || {};
        const missing = (schema.required || []).filter((key) => {
            return typeof input[key] !== 'string' || input[key].trim() === '';
        });
        if (missing.length) throw new Error('Champs manquants : ' + missing.join(', '));
    }

    function publicTools() {
        return Object.entries(tools).map(([name, tool]) => ({
            name,
            title: tool.title,
            description: tool.description,
            inputSchema: tool.inputSchema,
            annotations: tool.annotations
        }));
    }

    async function callTool(name, args, options) {
        const tool = tools[name];
        if (!tool) throw new Error('Tool inconnu : ' + name);
        validate(tool.inputSchema, args);
        return tool.handler(args || {}, options || {});
    }

    async function registerNativeTools() {
        if (!document.modelContext || typeof document.modelContext.registerTool !== 'function') {
            return { supported: false, registered: [], errors: [] };
        }

        const registered = [];
        const errors = [];

        for (const [name, tool] of Object.entries(tools)) {
            try {
                await document.modelContext.registerTool({
                    name,
                    title: tool.title,
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                    annotations: tool.annotations,
                    execute: (args, options) => callTool(name, args, options)
                });
                registered.push(name);
            } catch (error) {
                errors.push({ name, message: error.message });
                console.warn(`[WebMCP] Échec d'enregistrement de ${name}:`, error);
            }
        }

        return { supported: true, registered, errors };
    }

    const ready = registerNativeTools();

    window.WebMCP = {
        version: '2.0.0',
        site: 'iafluence.fr',
        ready,
        getTools: publicTools,
        callTool,
        discoverTools: () => get('/mcp/tools')
    };

    ready.then((status) => {
        const mode = status.supported ? `${status.registered.length} tools natifs` : 'fallback window.WebMCP';
        console.info(`[WebMCP] Initialisé — ${mode}.`);
    });
})();
