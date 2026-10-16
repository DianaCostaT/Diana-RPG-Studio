'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Studio = require('../src/DianaStudio.js');

class Element {
    constructor(selector, text = '', attributes = {}) {
        this.selector = selector;
        this.textContent = text;
        this.attributes = {...attributes};
        this.children = [];
    }
    getAttribute(name) { return this.attributes[name] ?? null; }
    setAttribute(name, value) { this.attributes[name] = value; }
    matches(selector) { return selector.split(',').map(value => value.trim()).includes(this.selector); }
    closest(selector) { return this.legal && selector.includes('.legal-notice') ? this : null; }
}

test('marca somente rótulos explícitos do chrome Diana', () => {
    const title = new Element('#app-title', 'RPGReactor');
    const welcome = new Element('.welcome-title', 'Welcome to RPGReactor');
    const branded = new Element('[data-diana-brandable]', 'RPGReactor Editor', {title: 'Open RPGReactor Project'});

    assert.equal(Studio.brandElement(title), true);
    assert.equal(title.textContent, 'Diana RPG Studio');
    assert.equal(Studio.brandElement(welcome), true);
    assert.equal(welcome.textContent, 'Bem-vinda ao Diana RPG Studio');
    Studio.brandElement(branded);
    assert.equal(branded.textContent, 'Diana RPG Studio');
    assert.equal(branded.attributes.title, 'Abrir projeto Diana');
});

test('não altera conteúdo autoral, campos de dados ou avisos legais', () => {
    const projectName = new Element('input', 'RPGReactor');
    const legal = new Element('.legal-notice', 'RPGReactor');
    legal.legal = true;
    const custom = new Element('.project-description', 'RPGReactor');

    assert.equal(Studio.brandElement(projectName), false);
    assert.equal(Studio.brandElement(legal), false);
    assert.equal(Studio.brandElement(custom), false);
    assert.equal(projectName.textContent, 'RPGReactor');
    assert.equal(legal.textContent, 'RPGReactor');
    assert.equal(custom.textContent, 'RPGReactor');
});

test('documento troca título e nós de chrome sem buscar conteúdo arbitrário', () => {
    const title = new Element('#app-title', 'RPGReactor');
    const custom = new Element('.project-description', 'RPGReactor');
    const document = {
        title: 'RPGReactor',
        querySelectorAll: () => [title, custom]
    };

    assert.equal(Studio.brandDocument(document), 2);
    assert.equal(document.title, 'Diana RPG Studio');
    assert.equal(title.textContent, 'Diana RPG Studio');
    assert.equal(custom.textContent, 'RPGReactor');
});
