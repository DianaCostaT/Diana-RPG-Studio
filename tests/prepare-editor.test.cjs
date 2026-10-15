'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { patchPaths, brandHtml } = require('../scripts/prepare-source.cjs');

test('preparação recusa caminhos de patch fora das fontes permitidas', () => {
    assert.deepEqual(patchPaths('+++ b/runtime/reactor_battle_data.js\n'), ['runtime/reactor_battle_data.js']);
    for (const file of ['../secret', 'runtime/../../secret', 'editor/..\\secret', 'package.json']) {
        assert.throws(() => patchPaths('+++ b/' + file + '\n'), /inválido/);
    }
});

test('bootstrap entra antes da inicialização e falha se o ponto mudar', () => {
    const input = '<html lang="en"><title>RPG Reactor</title>\n    <script src="src/main.js"></script>';
    const output = brandHtml(input);
    assert.ok(output.includes('lang="pt-BR"'));
    assert.ok(output.indexOf('DianaBootstrap.js') < output.indexOf('src/main.js'));
    assert.throws(() => brandHtml('<script src="changed.js"></script>'), /mudou/);
    assert.throws(() => brandHtml(input + input), /mudou/);
});
