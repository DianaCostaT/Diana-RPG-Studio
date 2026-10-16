const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = process.env.DIANA_BATTLE_SOURCE
    ? path.resolve(process.env.DIANA_BATTLE_SOURCE)
    : path.resolve(__dirname, '../upstream/RPGReactor');

global.window = {
    RRAssetFiles: {
        findImage(folder, name) {
            return [
                ['battlebacks1', 'Camp'],
                ['battlebacks2', 'Céu'],
                ['sv_actors', 'Liora'],
                ['enemies', 'Lobo']
            ].some(([expectedFolder, expectedName]) => folder.endsWith(path.join('img', expectedFolder)) && name === expectedName);
        }
    }
};

const BattleTestConfigModal = require(path.join(root, 'editor/src/database/BattleTestConfigModal.js'));

function database() {
    const system = {
        testBattlers: [{ actorId: 1, level: 4, equips: [0, 0, 0, 0, 0] }]
    };
    const actors = [{ id: 1, name: 'Liora', initialLevel: 4, battlerName: 'Liora' }];
    const enemies = [{ id: 2, name: 'Lobo', battlerName: 'Lobo' }];
    const troops = [{ id: 3, name: 'Matilha', members: [{ enemyId: 2, x: 420, y: 260, hidden: false }] }];
    return {
        data: { battlePresentation: {}, actors, enemies, troops },
        getSystem: () => system,
        getActors: () => actors,
        getActor: id => actors.find(actor => actor.id === Number(id)),
        getEnemy: id => enemies.find(enemy => enemy.id === Number(id)),
        getTroop: id => troops.find(troop => troop.id === Number(id)),
        getTroops: () => troops,
        markDirty: key => { system.dirty = key; }
    };
}

test('artefato Preparar combate informa fundos, heróis, inimigos, IDs e contagens', () => {
    const modal = new BattleTestConfigModal(database(), { path: path.resolve('Projeto') }, 3, 'Camp', 'Céu', {});
    const artifact = modal.preparedArtifact();

    assert.equal(artifact.version, 1);
    assert.equal(artifact.valid, true);
    assert.deepEqual(artifact.counts, { party: 1, enemies: 1 });
    assert.deepEqual(artifact.backgrounds.battleback1, { name: 'Camp', state: 'valid', path: 'img/battlebacks1/Camp' });
    assert.equal(artifact.party[0].actorId, 1);
    assert.deepEqual(artifact.party[0].equips, [0, 0, 0, 0, 0]);
    assert.equal(artifact.party[0].asset.state, 'valid');
    assert.equal(artifact.enemies[0].enemyId, 2);
    assert.deepEqual(
        { x: artifact.enemies[0].x, y: artifact.enemies[0].y, hidden: artifact.enemies[0].hidden },
        { x: 420, y: 260, hidden: false }
    );
    assert.equal(artifact.enemies[0].asset.state, 'valid');
});

test('artefato bloqueia fundo nomeado ausente e persiste a preparação auditável', () => {
    const db = database();
    const modal = new BattleTestConfigModal(db, { path: path.resolve('Projeto') }, 3, 'Ausente', '', {});
    const artifact = modal.preparedArtifact();

    assert.equal(artifact.valid, false);
    assert.equal(artifact.backgrounds.battleback1.state, 'missing');
    assert.match(artifact.issues.join('\n'), /Fundo inferior ausente: img\/battlebacks1\/Ausente/);

    modal.persistPreparation();
    assert.deepEqual(db.getSystem().testBattlers, modal.battlers);
    assert.equal(db.getSystem().testTroopId, 3);
    assert.deepEqual(db.getSystem().dianaBattlePreparation, artifact);
    assert.equal(db.getSystem().dirty, 'system');
});

test('painel preparado mantém a superfície visual em português e valida antes de testar', () => {
    const fs = require('node:fs');
    const source = fs.readFileSync(path.join(root, 'editor/src/database/BattleTestConfigModal.js'), 'utf8');

    assert.match(source, /Preparar combate/);
    assert.match(source, /Grupo inimigo:/);
    assert.match(source, /Fundo inferior:/);
    assert.match(source, /Fundo superior:/);
    assert.match(source, /Heróis \(/);
    assert.match(source, /Inimigos:/);
    assert.match(source, /dianaBattlePreparation = preparation/);
    assert.match(source, /if \(!preparation\.valid\)/);
});
