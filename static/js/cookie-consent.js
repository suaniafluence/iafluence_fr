(function () {
    const CONSENT_KEY = "iafluence_cookie_consent_v1";
    const GA_ID = "G-K6QH3MSLX0";
    const CLARITY_ID = "vcjdk47uxg";

    const defaultConsent = {
        necessary: true,
        analytics: false,
        diagnostics: false
    };

    function readConsent() {
        try {
            const stored = localStorage.getItem(CONSENT_KEY);
            return stored ? { ...defaultConsent, ...JSON.parse(stored) } : null;
        } catch (error) {
            return null;
        }
    }

    function writeConsent(consent) {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({
            necessary: true,
            analytics: Boolean(consent.analytics),
            diagnostics: Boolean(consent.diagnostics),
            savedAt: new Date().toISOString()
        }));
    }

    function deleteCookie(name) {
        const hostParts = window.location.hostname.split(".");
        const domains = [
            window.location.hostname,
            "." + window.location.hostname,
            hostParts.length > 2 ? "." + hostParts.slice(-2).join(".") : ""
        ].filter(Boolean);

        ["", "/"].forEach((path) => {
            domains.forEach((domain) => {
                document.cookie = `${name}=; Max-Age=0; path=${path || "/"}; domain=${domain}`;
            });
            document.cookie = `${name}=; Max-Age=0; path=${path || "/"}`;
        });
    }

    function clearOptionalCookies() {
        document.cookie.split(";").forEach((cookie) => {
            const name = cookie.split("=")[0].trim();
            if (/^(_ga|_gid|_gat|_clck|_clsk|CLID|ANONCHK|MR|MUID|SM)/.test(name)) {
                deleteCookie(name);
            }
        });
    }

    function loadScript(src, id) {
        if (id && document.getElementById(id)) return;
        const script = document.createElement("script");
        script.async = true;
        script.src = src;
        if (id) script.id = id;
        document.head.appendChild(script);
    }

    function enableAnalytics() {
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
        window.gtag("js", new Date());
        window.gtag("config", GA_ID, { anonymize_ip: true });
        loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, "iafluence-analytics-script");
    }

    function enableDiagnostics() {
        if (window.clarity) return;
        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
            t = l.createElement(r);
            t.async = 1;
            t.src = "https://www.clarity.ms/tag/" + i;
            t.id = "iafluence-diagnostics-script";
            y = l.getElementsByTagName(r)[0];
            y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", CLARITY_ID);
    }

    function applyConsent(consent) {
        if (!consent) return;
        if (consent.analytics) enableAnalytics();
        if (consent.diagnostics) enableDiagnostics();
        if (!consent.analytics && !consent.diagnostics) clearOptionalCookies();
    }

    function buildBanner(existingConsent) {
        const banner = document.createElement("section");
        banner.className = "cookie-consent";
        banner.setAttribute("aria-label", "Préférences de confidentialité");
        banner.hidden = Boolean(existingConsent);
        banner.innerHTML = `
            <div class="cookie-consent__inner">
                <h2>Préférences de confidentialité</h2>
                <p>Vous choisissez ce qui peut être activé. Les éléments nécessaires au fonctionnement du site restent toujours actifs.</p>
                <div class="cookie-consent__choices">
                    <label class="cookie-choice">
                        <input type="checkbox" checked disabled>
                        <span><strong>Nécessaires</strong><span>Indispensables au fonctionnement du site.</span></span>
                    </label>
                    <label class="cookie-choice">
                        <input type="checkbox" name="analytics">
                        <span><strong>Mesure d'audience</strong><span>Aide à comprendre quelles pages sont consultées.</span></span>
                    </label>
                    <label class="cookie-choice">
                        <input type="checkbox" name="diagnostics">
                        <span><strong>Amélioration du site</strong><span>Aide à détecter les problèmes d'usage et améliorer l'expérience.</span></span>
                    </label>
                </div>
                <p><a class="cookie-consent__link" href="/politique-confidentialite.html">Lire la politique de confidentialité</a></p>
                <div class="cookie-consent__actions">
                    <button type="button" data-cookie-action="reject">Tout refuser</button>
                    <button type="button" data-cookie-action="save">Enregistrer</button>
                    <button type="button" data-cookie-action="accept">Tout accepter</button>
                </div>
            </div>
        `;

        const settingsButton = document.createElement("button");
        settingsButton.type = "button";
        settingsButton.className = "cookie-settings-button";
        settingsButton.textContent = "Cookies";
        settingsButton.hidden = !existingConsent;

        document.body.appendChild(banner);
        document.body.appendChild(settingsButton);

        const analyticsInput = banner.querySelector("input[name='analytics']");
        const diagnosticsInput = banner.querySelector("input[name='diagnostics']");

        function syncInputs(consent) {
            analyticsInput.checked = Boolean(consent && consent.analytics);
            diagnosticsInput.checked = Boolean(consent && consent.diagnostics);
        }

        syncInputs(existingConsent);

        function closeBanner() {
            banner.hidden = true;
            settingsButton.hidden = false;
        }

        function save(consent) {
            const previous = readConsent();
            writeConsent(consent);
            applyConsent(consent);
            closeBanner();
            if (previous && ((previous.analytics && !consent.analytics) || (previous.diagnostics && !consent.diagnostics))) {
                window.location.reload();
            }
        }

        banner.addEventListener("click", function (event) {
            const action = event.target && event.target.getAttribute("data-cookie-action");
            if (!action) return;

            if (action === "reject") {
                analyticsInput.checked = false;
                diagnosticsInput.checked = false;
                save({ analytics: false, diagnostics: false });
            }

            if (action === "save") {
                save({ analytics: analyticsInput.checked, diagnostics: diagnosticsInput.checked });
            }

            if (action === "accept") {
                analyticsInput.checked = true;
                diagnosticsInput.checked = true;
                save({ analytics: true, diagnostics: true });
            }
        });

        settingsButton.addEventListener("click", function () {
            syncInputs(readConsent());
            banner.hidden = false;
            settingsButton.hidden = true;
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        const consent = readConsent();
        applyConsent(consent);
        buildBanner(consent);
    });

    window.gtagSendEvent = window.gtagSendEvent || function (url) {
        const consent = readConsent();
        if (consent && consent.analytics && window.gtag) {
            window.gtag("event", "conversion_click", {
                event_category: "navigation",
                event_label: url
            });
        }
        window.location.href = url;
        return false;
    };
})();
