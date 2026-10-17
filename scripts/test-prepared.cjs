'use strict';
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const fs = require('node:fs');
const tests = ['tests/battle-poses.test.cjs', 'tests/upstream/diana-battle-held-poses.test.cjs'];
tests.push('tests/sprite-repair.test.cjs');
if (fs.existsSync(path.join(root,'tests/pose-authoring.test.cjs'))) tests.push('tests/pose-authoring.test.cjs');
if (fs.existsSync(path.join(root,'tests/pose-translations.test.cjs'))) tests.push('tests/pose-translations.test.cjs');
if (fs.existsSync(path.join(root,'tests/animation-sequences.test.cjs'))) tests.push('tests/animation-sequences.test.cjs');
for(const name of ['diana-sprite-audio-contract','diana-battle-preparation','sprite-motion-aliases','sprite-motion-duration','pose-sound-defense'])if(fs.existsSync(path.join(root,'tests',name+'.test.cjs')))tests.push('tests/'+name+'.test.cjs');
const result = spawnSync(process.execPath, ['--test', ...tests], {
    cwd: root, stdio: 'inherit', env: { ...process.env, DIANA_BATTLE_SOURCE: process.argv[2]?path.resolve(process.argv[2]):path.join(root, 'build', 'diana') }
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
