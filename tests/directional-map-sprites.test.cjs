'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const patch = fs.readFileSync(path.join(__dirname, '../patches/zzzzzzzzzzzzzz-diana-directional-walk.patch'), 'utf8');
const hunk = patch.split('diff --git a/runtime/reactor_sprites.js')[1];
const header = hunk.match(/^@@ -(\d+),(\d+) \+(\d+),(\d+) @@/m);
assert.ok(header, 'runtime patch has a counted hunk');
const hunkBody = hunk.slice(hunk.indexOf('\n', hunk.indexOf('@@')) + 1).split(/\r?\ndiff --git /)[0].split(/\r?\n/);
const oldLines = hunkBody.filter(line => line.startsWith(' ') || line.startsWith('-')).length;
const newLines = hunkBody.filter(line => line.startsWith(' ') || line.startsWith('+')).length;
assert.equal(oldLines, Number(header[2]), 'hunk accounts for every original runtime line');
assert.equal(newLines, Number(header[4]), 'hunk accounts for every added runtime line');
const integration = hunk.split(/\r?\ndiff --git /)[0].split(/\r?\n/)
    .filter(line => line.startsWith('+') && !line.startsWith('+++'))
    .map(line => line.slice(1)).join('\n');
const runtime = fs.readFileSync(path.join(__dirname, '../upstream/RPGReactor/runtime/reactor_sprites.js'), 'utf8');
assert.doesNotThrow(() => new vm.Script(runtime + '\n' + integration, {filename: 'reactor_sprites.js'}),
    'patched runtime remains syntactically complete');

function spriteMethods() {
    function SpriteCharacter() {}
    SpriteCharacter.prototype.characterPatternX = function() {
        const grid = this._character.grid, animation = this._character.dianaWalkAnimation();
        const cell = animation.frames[this._character.pattern()];
        return grid ? cell % grid.columns : -1;
    };
    SpriteCharacter.prototype.characterPatternY = function() {
        const grid = this._character.grid, animation = this._character.dianaWalkAnimation();
        const cell = animation.frames[this._character.pattern()];
        return grid ? Math.floor(cell / grid.columns) : -1;
    };
    const context = {Sprite_Character: SpriteCharacter, dianaGridForCharacter: character => character.grid};
    vm.runInNewContext(integration, context);
    return SpriteCharacter;
}

test('grade 6x4 usa as quatro linhas de direção e conserva o quadro de caminhada', () => {
    const Sprite = spriteMethods();
    for (const [direction, row] of [[2, 0], [4, 1], [6, 2], [8, 3]]) {
        const character = {grid: {columns: 6, rows: 4}, direction: () => direction,
            dianaWalkAnimation: () => ({frames: [2, 1, 0, 5, 4, 3]}), pattern: () => 0};
        const sprite = new Sprite(); sprite._character = character;
        assert.equal(sprite.characterPatternX(), 2);
        assert.equal(sprite.characterPatternY(), row);
    }
});

test('listas direcionais explicitas escolhem os quadros completos do artista', () => {
    const Sprite = spriteMethods();
    for (const [direction, cell] of [[2, 0], [4, 7], [6, 14], [8, 21]]) {
        const character = {grid: {columns: 7, rows: 4}, direction: () => direction,
            dianaWalkAnimation: () => ({frames: [1, 2], directions: {'2': [0, 1], '4': [7, 8], '6': [14, 15], '8': [21, 22]}}), pattern: () => 0};
        const sprite = new Sprite(); sprite._character = character;
        assert.equal(sprite.characterPatternX(), cell % 7);
        assert.equal(sprite.characterPatternY(), Math.floor(cell / 7));
    }
});

