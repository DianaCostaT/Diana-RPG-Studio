'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

test('patch remove lamejs LGPL-3.0 e transitivo do manifest/lock do commit upstream fixado', t => {
    const root = path.resolve(__dirname, '..');
    const upstream = path.join(root, 'upstream', 'RPGReactor');
    const pin = JSON.parse(fs.readFileSync(path.join(root, 'upstream-lock.json'), 'utf8'));
    const files = ['package.json', 'package-lock.json'];
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'diana-no-lamejs-'));
    t.after(() => fs.rmSync(temp, { recursive: true, force: true }));

    fs.mkdirSync(path.join(temp, 'editor'));
    for (const file of files) {
        const contents = execFileSync('git', ['-C', upstream, 'show', `${pin.commit}:editor/${file}`]);
        fs.writeFileSync(path.join(temp, 'editor', file), contents);
    }
    const patch = path.join(root, 'patches', 'zzzzzzzz-remove-lamejs-dependency.patch');
    execFileSync('git', ['apply', '--check', patch], { cwd: temp, stdio: 'pipe' });
    execFileSync('git', ['apply', patch], { cwd: temp, stdio: 'pipe' });

    const manifest = JSON.parse(fs.readFileSync(path.join(temp, 'editor', 'package.json'), 'utf8'));
    const lock = JSON.parse(fs.readFileSync(path.join(temp, 'editor', 'package-lock.json'), 'utf8'));
    assert.equal(manifest.dependencies.lamejs, undefined);
    assert.equal(lock.packages[''].dependencies.lamejs, undefined);
    assert.equal(lock.packages['node_modules/lamejs'], undefined);
    assert.equal(lock.packages['node_modules/use-strict'], undefined);
});
