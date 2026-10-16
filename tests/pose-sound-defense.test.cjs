'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = process.env.DIANA_BATTLE_SOURCE
    ? path.resolve(process.env.DIANA_BATTLE_SOURCE)
    : path.resolve(__dirname, '../upstream/RPGReactor');
const patch = fs.readFileSync(
    path.resolve(__dirname, '../patches/zzzzzzzzzz-guard-pose-sound.patch'),
    'utf8'
);
const aliasPatch = fs.readFileSync(
    path.resolve(__dirname, '../patches/zzzzzzzzz-sprite-motion-aliases.patch'),
    'utf8'
);

const sources = [
    'editor/src/battle/BattleData.js',
    'runtime/reactor_battle_data.js'
];

const clone = value => JSON.parse(JSON.stringify(value));
const applyPatch = (text, source, contents, required = true) => {
    const part = contents.split(`diff --git a/${source} b/${source}`)[1]?.split('\ndiff --git ')[0];
    if (!part) {
        assert.ok(!required, `patch section for ${source}`);
        return text;
    }
    for (const hunk of part.split(/\n@@ /).slice(1)) {
        const lines = hunk.slice(hunk.indexOf('\n') + 1).split('\n');
        const before = lines.filter(line => line.startsWith(' ') || line.startsWith('-')).map(line => line.slice(1)).join('\n');
        const after = lines.filter(line => line.startsWith(' ') || line.startsWith('+')).map(line => line.slice(1)).join('\n');
        const compatible = text.includes(before)
            ? [before, after]
            : [before.replaceAll('0.5', '.5'), after.replaceAll('0.5', '.5')];
        assert.ok(text.includes(compatible[0]), `patch context for ${source}`);
        text = text.replace(compatible[0], compatible[1]);
    }
    return text;
};
const patchSource = source => {
    if (process.env.DIANA_BATTLE_SOURCE) return fs.readFileSync(path.join(root, source), 'utf8');
    let text = fs.readFileSync(path.join(root, source), 'utf8').replace(/\r\n/g, '\n');
    text = applyPatch(text, source, aliasPatch, false);
    return applyPatch(text, source, patch);
};
const loadBattleData = source => {
    if (process.env.DIANA_BATTLE_SOURCE) return require(path.join(root, source));
    const context = { module: { exports: {} }, console };
    vm.runInNewContext(patchSource(source), context);
    return context.module.exports;
};
const defenseGraphic = () => ({
    mode: 'static',
    type: 'character',
    name: 'Original',
    direction: 4,
    motions: { idle: { pose: 'idle' }, guard: { pose: 'idle' } },
    spriteAnimation: {
        version: 1,
        columns: 2,
        rows: 1,
        animations: {
            idle: { frames: [0], speed: 1, loop: true },
            guard: { frames: [1], speed: 1, loop: true }
        }
    },
    poseSounds: {
        idle: { name: 'Idle', volume: 15 },
        guard: { name: 'Guard', volume: 120, pitch: 10, pan: -120 }
    },
    guardGraphics: {
        weapon: {
            name: 'GuardWeapon',
            direction: 6,
            spriteAnimation: {
                version: 1,
                columns: 2,
                rows: 1,
                animations: { guard: { frames: [1], speed: 1, loop: true } }
            },
            poseSounds: { guard: { name: 'WeaponGuard' } }
        },
        shield: {
            name: 'GuardShield',
            direction: 4,
            spriteAnimation: {
                version: 1,
                columns: 2,
                rows: 1,
                animations: { guard: { frames: [1], speed: 1, loop: true } }
            },
            poseSounds: { guard: { name: 'ShieldGuard' } }
        }
    }
});

for (const source of sources) {
    const B = loadBattleData(source);

    test(`${source}: defesa escolhe arma/escudo sem mutar nem inverter o gráfico original`, () => {
        const original = defenseGraphic();
        const before = clone(original);
        const weapon = B.motionGraphic(original, 'guard');
        const shield = B.motionGraphic(original, 'guard', [{ etypeId: 2 }]);

        assert.notStrictEqual(weapon, original);
        assert.equal(weapon.name, 'GuardWeapon');
        assert.equal(weapon.direction, 6);
        assert.equal(shield.name, 'GuardShield');
        assert.equal(shield.direction, 4);
        assert.deepEqual(original, before);
        assert.strictEqual(B.motionGraphic(original, 'idle', [{ etypeId: 2 }]), original);
    });

    test(`${source}: poseKey e poseSound preservam aliases e normalizam somente SE válido`, () => {
        const graphic = defenseGraphic();

        assert.equal(B.poseKey(graphic, 'guard'), 'guard');
        assert.equal(B.poseKey(graphic, 'idle'), 'idle');
        assert.deepEqual(clone(B.poseSound(graphic, 'guard')), {
            name: 'Guard',
            volume: 100,
            pitch: 50,
            pan: -100
        });
        assert.deepEqual(clone(B.poseSound({ motions: { swing: { pose: 'attack' } }, poseSounds: { attack: { name: 'Swing' } } }, 'swing')), {
            name: 'Swing',
            volume: 90,
            pitch: 100,
            pan: 0
        });
        for (const name of ['', '../outside', 'folder\\sound']) {
            assert.equal(B.poseSound({ poseSounds: { idle: { name } } }, 'idle'), null);
        }
    });
}

const RuntimeB = loadBattleData('runtime/reactor_battle_data.js');
const sounds = [];
const context = {
    ReactorBattleData: RuntimeB,
    AudioManager: { playSe: sound => sounds.push(clone(sound)) },
    DataManager: { isDatabaseLoaded: () => true }
};
vm.runInNewContext(
    patchSource('runtime/reactor_battle_presentation.js'),
    context
);
const P = context.ReactorBattlePresentation;

for (const kind of ['actors', 'enemies']) {
    test(`runtime ${kind}: toca uma vez por entrada de pose, não por quadro ou loop`, () => {
        sounds.length = 0;
        const graphic = defenseGraphic();
        const sprite = {};

        P.updatePoseSound(sprite, graphic, 'idle');
        P.updatePoseSound(sprite, graphic, 'idle');
        P.updatePoseSound(sprite, graphic, 'guard');
        P.updatePoseSound(sprite, graphic, 'guard');
        P.updatePoseSound(sprite, graphic, 'idle');
        P.updatePoseSound(sprite, graphic, 'guard');

        assert.deepEqual(sounds.map(sound => sound.name), ['Idle', 'Guard', 'Idle', 'Guard']);
    });

    test(`runtime ${kind}: sons explícitos distinguem entradas de status no mesmo atlas`, () => {
        sounds.length = 0;
        const graphic = defenseGraphic();
        graphic.spriteAnimation.animations = { idle: { frames: [0], speed: 1, loop: true } };
        graphic.motions = {
            poison: { pose: 'idle' },
            blind: { pose: 'idle' }
        };
        graphic.poseSounds = {
            poison: { name: 'Poison' },
            blind: { name: 'Blind' }
        };
        const sprite = {};

        P.updatePoseSound(sprite, graphic, 'poison');
        P.updatePoseSound(sprite, graphic, 'poison');
        P.updatePoseSound(sprite, graphic, 'blind');
        P.updatePoseSound(sprite, graphic, 'blind');
        P.updatePoseSound(sprite, graphic, 'poison');

        assert.deepEqual(sounds.map(sound => sound.name), ['Poison', 'Blind', 'Poison']);
    });

    test(`runtime ${kind}: status que entra em guarda seleciona defesa e seu som`, () => {
        sounds.length = 0;
        const graphic = defenseGraphic();
        P.settings = {
            [kind]: { 1: { graphic } },
            states: { 9: { graphicMotion: { motion: 'guard' } } }
        };
        const battler = {
            isActor: () => kind === 'actors',
            [kind === 'actors' ? 'actorId' : 'enemyId']: () => 1,
            [kind === 'actors' ? 'actor' : 'enemy']: () => ({}),
            armors: () => [{ etypeId: 2 }],
            states: () => [{ id: 9, priority: 100 }]
        };
        const resolved = P.graphicFor(battler);
        assert.equal(resolved.name, 'GuardShield');
        assert.equal(resolved.direction, 4);

        const sprite = { _dianaSoundPose: 'idle' };
        P.updatePoseSound(sprite, resolved, 'guard');
        assert.deepEqual(sounds, [{ name: 'ShieldGuard', volume: 90, pitch: 100, pan: 0 }]);
    });
}
