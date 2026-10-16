/* Diana Studio chrome is applied after the base editor without changing project content. */
(function(root) {
    'use strict';

    const product = 'Diana RPG Studio';
    const labels = new Map([
        ['RPGReactor', product],
        ['RPGReactor Editor', product],
        ['RPGReactor Project Manager', product],
        ['Welcome to RPGReactor', `Bem-vinda ao ${product}`],
        ['New RPGReactor Project', 'Novo projeto Diana'],
        ['Open RPGReactor Project', 'Abrir projeto Diana']
    ]);
    const chromeSelector = [
        '#app-title', '#titlebar-title', '#compat-titlebar .title',
        '.app-title', '.welcome-title', '.dialog-title', '.rr-modal-header h1',
        '.rr-modal-header h2', '.rr-modal-header h3', '[data-diana-brandable]',
        '[data-i18n="app.title"]', '[data-i18n="about.title"]'
    ].join(',');

    const isLegal = node => !!node?.closest?.(
        '[data-legal], [data-license], .legal-notice, .license-notice, #third-party-notices'
    );
    const isChrome = node => !!node?.matches?.(chromeSelector);
    const replaceLabel = value => labels.get(value) || value;

    function brandElement(node) {
        if (!node || isLegal(node) || !isChrome(node)) return false;
        let changed = false;
        if (node.textContent && node.children.length === 0) {
            const next = replaceLabel(node.textContent.trim());
            if (next !== node.textContent) {
                node.textContent = next;
                changed = true;
            }
        }
        for (const attribute of ['title', 'aria-label', 'placeholder']) {
            const current = node.getAttribute?.(attribute);
            const next = replaceLabel(current);
            if (next !== current) {
                node.setAttribute(attribute, next);
                changed = true;
            }
        }
        return changed;
    }

    function brandDocument(document) {
        if (!document) return 0;
        let changed = 0;
        if (document.title === 'RPGReactor') {
            document.title = product;
            changed++;
        }
        for (const node of document.querySelectorAll(chromeSelector)) {
            if (brandElement(node)) changed++;
        }
        return changed;
    }

    function observe(document) {
        if (!document?.body || !root.MutationObserver || document.body.dataset.dianaStudioObserved) return;
        document.body.dataset.dianaStudioObserved = 'true';
        new root.MutationObserver(records => {
            for (const record of records) {
                for (const node of record.addedNodes) {
                    if (node.nodeType !== 1) continue;
                    brandElement(node);
                    for (const child of node.querySelectorAll?.(chromeSelector) || []) brandElement(child);
                }
            }
        }).observe(document.body, {childList: true, subtree: true});
    }

    function install(document = root.document) {
        const changed = brandDocument(document);
        observe(document);
        return changed;
    }

    root.DianaStudio = {product, replaceLabel, brandElement, brandDocument, install};
    if (typeof module !== 'undefined') module.exports = root.DianaStudio;
    if (root.document) {
        if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', () => install());
        else install();
    }
})(globalThis);
