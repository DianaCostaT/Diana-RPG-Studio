'use strict';
const fs = require('node:fs');
const path = require('node:path');
// Reuse the existing destination protection and inventory, without the NW SDK.
const { copyTree, freshDestination, manifest, options } = require('./package-windows.cjs');
function packageTauri({ destination, prepared, executable } = {}) {
    const root = path.resolve(__dirname, '..');
    prepared = path.resolve(prepared || path.join(root, 'build/diana'));
    executable = path.resolve(executable || path.join(root, 'src-tauri/target/release/luae-rpg.exe'));
    for (const file of [executable, path.join(prepared, 'runtime/reactor_main.js'), path.join(prepared, 'provenance.json')]) {
        if (!fs.statSync(file).isFile()) throw Error('Arquivo necessário ausente: ' + file);
    }
    if (!destination) throw Error('Informe --out com uma pasta nova para o pacote Tauri.');
    const out = freshDestination(path.resolve(destination), [prepared, path.dirname(executable)]);
    fs.copyFileSync(executable, path.join(out, 'Luae RPG.exe'));
    copyTree(path.join(prepared, 'runtime'), path.join(out, 'runtime'));
    for (const name of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) fs.copyFileSync(path.join(root, name), path.join(out, name));
    fs.writeFileSync(path.join(out, 'LEIA-ME.txt'), 'Luae RPG — pacote portátil Tauri para teste local.\nAbra Luae RPG.exe. Requer Windows e WebView2 instalado.\nMantenha runtime e os avisos ao lado do executável.\nDistribuição pública pendente de auditoria de licenças. Não é um instalador.\n', 'utf8');
    return { out, report: manifest(out, { kind: 'editor', host: 'tauri', version: require('../package.json').version, distribution: 'local-preview', provenance: JSON.parse(fs.readFileSync(path.join(prepared, 'provenance.json'), 'utf8')) }) };
}
module.exports = { packageTauri };
if (require.main === module) {
    try { console.log(packageTauri(options(process.argv.slice(2))).out); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
}
