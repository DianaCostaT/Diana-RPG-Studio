'use strict';
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const cargo = process.platform === 'win32' ? 'cargo.exe' : 'cargo';
const editor = path.join(root, 'build', 'diana', 'editor', 'index.html');
if (!fs.existsSync(editor)) {
    throw new Error('Prepare o editor antes de iniciar o host Tauri (npm run prepare:editor).');
}
const probe = spawnSync(cargo, ['--version'], { stdio: 'ignore', windowsHide: true });
if (probe.error || probe.status !== 0) {
    throw new Error('Rust/Cargo nao encontrado. Instale a toolchain MSVC do Tauri para compilar o host.');
}
const result = spawnSync(cargo, ['run', '--manifest-path', path.join(root, 'src-tauri', 'Cargo.toml')], {
    cwd: root, stdio: 'inherit', windowsHide: false
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
