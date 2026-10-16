'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), path = require('node:path');
const B = require(path.join(process.env.DIANA_BATTLE_SOURCE || path.resolve(__dirname, '../upstream/RPGReactor'), 'editor/src/battle/BattleData.js'));
const starter = require('../src/DianaStarterData.js'), sample = require('../src/DianaJRPGSample.js');
function fixture() {
    const data = starter.populate({'System.json': {terms: {}}, 'Items.json': [null], 'Animations.json': [null], 'MapInfos.json': [null, {}], 'Map001.json': {width: 17, height: 13, data: Array(1326).fill(0), events: [null]}, 'Tilesets.json': [null, {tilesetNames: [], flags: Array(8192).fill(0)}]});
    sample.populate(data, B); sample.addNativeMedievalRtp(data); sample.completeStarter(data, B); return data;
}
test('novo jogo oferece dois heróis equipados, consumíveis e inimigos acessíveis', () => {
    const data = fixture(), system = data['System.json'];
    assert.deepEqual(system.partyMembers, [1, 2]); assert.equal(system.title1Name, 'BosqueClareira');
    assert.deepEqual(data['Actors.json'][1].equips, [1, 0, 0, 2, 0]);
    assert.deepEqual(data['Actors.json'][2].equips, [1, 1, 0, 2, 0]);
    for (const id of [1, 2, 3]) assert.ok(data['Items.json'][id].effects.length);
    for (const id of [1, 2, 3, 4]) assert.ok(data['Troops.json'][id].members.every(m => data['Enemies.json'][m.enemyId]));
    for (const id of [3, 4, 5]) assert.equal(data['Map003.json'].events[id].pages[0].list.find(c => c.code === 301).parameters[1], id - 1);
    assert.equal(data['Map001.json'].events[7].pages[0].list.find(c => c.code === 302).parameters[1], 1);
    assert.equal(data['Armors.json'][1].etypeId, 2);
    assert.ok(data['Classes.json'][1].traits.some(t => t.code === 51 && t.dataId === 1));
});
test('suprimentos são concedidos uma vez por self switch, sem bloquear o mapa', () => {
    const event = fixture()['Map001.json'].events[13], [initial, finished] = event.pages;
    assert.equal(initial.trigger, 3); assert.equal(initial.through, true); assert.equal(initial.priorityType, 0);
    assert.deepEqual(initial.list.filter(c => c.code === 126).map(c => c.parameters), [[1, 0, 0, 5], [2, 0, 0, 3], [3, 0, 0, 2]]);
    assert.equal(initial.list.at(-2).code, 123); assert.equal(finished.conditions.selfSwitchValid, true);
    assert.equal(finished.conditions.selfSwitchCh, 'A'); assert.deepEqual(finished.list.map(c => c.code), [0]);
});
test('Defender e consumir itens não herdam aproximação ou giro da sequência de ataque', () => {
    const data = fixture(), settings = data['BattlePresentation.json'];
    for (const [kind, ids] of [['skills', [2]], ['items', [1, 2, 3]]]) for (const itemId of ids) {
        const sequence = B.resolve(settings, data['ActionSequences.json'], {kind, itemId, isAttack: false, battlerKind: 'actors', battlerId: 1, classId: 1});
        assert.ok(sequence, kind + itemId); assert.equal(sequence.steps.filter(s => s.type === 'impact').length, 1);
        assert.ok(sequence.steps.every(s => !['move', 'direction'].includes(s.type)));
        assert.equal(sequence.steps.find(s => s.type === 'motion').motion, kind === 'skills' ? 'guard' : 'item');
    }
    for (const id of [1, 2]) {
        const variants = settings.actors[id].graphic.guardGraphics;
        assert.notDeepEqual(variants.weapon.spriteAnimation.animations.guard.frames, variants.shield.spriteAnimation.animations.guard.frames);
        for (const value of Object.values(variants)) assert.deepEqual(B.validateSpriteAnimation(value.spriteAnimation), []);
    }
});
test('espada, escudo, traje e consumíveis apontam para células originais do IconSet', () => {
    const data = fixture(), PNG = require('../upstream/RPGReactor/editor/node_modules/pngjs').PNG;
    const atlas = PNG.sync.read(require('node:fs').readFileSync(require('node:path').resolve('assets/rtp/medieval/pack/img/system/IconSet.png')));
    assert.deepEqual([atlas.width, atlas.height], [512, 512]);
    const references = [data['Weapons.json'][1].iconIndex, data['Armors.json'][1].iconIndex, data['Armors.json'][2].iconIndex, ...[1, 2, 3].map(id => data['Items.json'][id].iconIndex)];
    assert.deepEqual(references, [3, 4, 5, 1, 6, 7]);
    const signatures = new Set();
    for (const id of references) {
        const cell = Buffer.alloc(32 * 32 * 4);
        for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
            const offset = ((Math.floor(id / 16) * 32 + y) * atlas.width + (id % 16) * 32 + x) * 4;
            atlas.data.copy(cell, (y * 32 + x) * 4, offset, offset + 4);
        }
        assert.ok(Array.from({length: 32 * 32}, (_, i) => cell[i * 4 + 3]).some(alpha => alpha > 0), `icon ${id} has visible artwork`);
        const signature = require('node:crypto').createHash('sha256').update(cell).digest('hex');
        assert.equal(signatures.has(signature), false, `icon ${id} has its own art`); signatures.add(signature);
    }
});
