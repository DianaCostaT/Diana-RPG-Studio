'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
test('host desktop principal aponta para Tauri e conserva NW como contingencia', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    assert.equal(pkg.scripts.start, 'node scripts/launch-tauri.cjs');
    assert.equal(pkg.scripts['start:nw'], 'node scripts/launch.cjs');
    assert.match(pkg.scripts['tauri:build'], /cargo build --release/);
});

test('scaffold Tauri abre editor preparado e define identidade do Luae RPG', () => {
    const config = JSON.parse(fs.readFileSync(path.join(root, 'src-tauri/tauri.conf.json'), 'utf8'));
    assert.equal(config.productName, 'Luae RPG');
    assert.equal(config.build.frontendDist, '../build/diana/editor');
    assert.equal(config.app.windows[0].title, 'Luae RPG');
    assert.ok(fs.existsSync(path.join(root, 'src-tauri/src/main.rs')));
    assert.ok(fs.existsSync(path.join(root, 'src-tauri/build.rs')));
});

test('launcher Tauri informa toolchain ausente sem tentar instalar dependencias', () => {
    const launcher = fs.readFileSync(path.join(root, 'scripts/launch-tauri.cjs'), 'utf8');
    assert.match(launcher, /spawnSync\(cargo, \['--version'\]/);
    assert.match(launcher, /Rust\/Cargo nao encontrado/);
    assert.doesNotMatch(launcher, /npm install|rustup install|winget install/i);
});
