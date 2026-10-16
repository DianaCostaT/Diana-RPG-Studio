'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = process.env.DIANA_BATTLE_SOURCE ? path.resolve(process.env.DIANA_BATTLE_SOURCE) : path.resolve(__dirname, '../upstream/RPGReactor');

for (const source of ['editor/src/battle/BattleData.js', 'runtime/reactor_battle_data.js']) {
    let B;
    if(process.env.DIANA_BATTLE_SOURCE)B=require(path.join(root,source));
    else {
        const fs=require('node:fs'),vm=require('node:vm');
        let text=fs.readFileSync(path.join(root,source),'utf8');
        const patch=fs.readFileSync(path.resolve(__dirname,'../patches/zzzzzzzzz-sprite-motion-aliases.patch'),'utf8');
        const part=patch.split('diff --git a/'+source+' b/'+source)[1].split('diff --git ')[0];
        const before=part.split(/\r?\n/).find(l=>l.startsWith('-    B.spriteGridFrame')).slice(1);
        const after=part.split(/\r?\n/).find(l=>l.startsWith('+    B.spriteGridFrame')).slice(1);
        const actual=text.split(/\r?\n/).find(l=>l.includes('B.spriteGridFrame='));
        assert.equal(actual.replaceAll('0.5','.5'),before.replaceAll('0.5','.5'),'additive patch context');text=text.replace(actual,after);
        const context={module:{exports:{}},console};vm.runInNewContext(text,context);B=context.module.exports;
    }
    for (const kind of ['actors', 'enemies']) {
        const graphic = (animations = {}) => B.graphic({[kind]: {1: {graphic: {
            mode: 'static', name: 'sheet',
            motions: {swing: {pose: 'attack'}, thrust: {pose: 'attack'}, guard: {pose: 'idle'}, missing: {pose: 'absent'}},
            spriteAnimation: {version: 1, columns: 4, rows: 2, anchor: {x: .25, y: .75}, animations: {
                idle: {frames: [0, 1], speed: 3, loop: true},
                attack: {frames: [4, 5, 6], speed: 2, loop: 'once'}, ...animations
            }}
        }}}}, kind, 1, {});
        test(`${source}: ${kind} resolve swing/thrust e guard com a cadência da grade`, () => {
            for (const motion of ['swing', 'thrust']) {
                assert.deepEqual(JSON.parse(JSON.stringify(B.graphicFrame(graphic(), 400, 200, motion, 2))), {x: 100, y: 100, width: 100, height: 100, anchor: {x: .25, y: .75}});
                assert.equal(B.graphicFrame(graphic(), 400, 200, motion, 999).x, 200);
            }
            assert.equal(B.graphicFrame(graphic(), 400, 200, 'guard', 3).x, 100);
            assert.equal(B.graphicFrame(graphic(), 400, 200, 'guard', 6).x, 0);
        });
        test(`${source}: ${kind} prefere chave explícita ao alias`, () => {
            const value = graphic({swing: {frames: [7], speed: 1, loop: true}});
            assert.equal(B.graphicFrame(value, 400, 200, 'swing', 0).x, 300);
            assert.equal(B.graphicFrame(value, 400, 200, 'swing', 0).y, 100);
        });
        test(`${source}: ${kind} usa idle para alias ausente e movimento desconhecido`, () => {
            for (const motion of ['missing', 'unknown']) {
                assert.equal(B.graphicFrame(graphic(), 400, 200, motion, 3).x, 100);
                assert.equal(B.graphicFrame(graphic(), 400, 200, motion, 3).y, 0);
            }
            const value = graphic();
            delete value.spriteAnimation.animations.idle;
            assert.equal(B.spriteGridFrame(value, 400, 200, 'unknown', 0), null);
        });
    }
}
