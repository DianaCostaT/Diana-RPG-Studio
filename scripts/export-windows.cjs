'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { copyTree, copySdk, manifest, freshDestination, options } = require('./package-windows.cjs');
function exportWindows({ project, destination, sdk = path.resolve(__dirname, '../tools/nwjs-sdk-v0.118.0-win-x64') } = {}) {
    if (!project || !destination) throw new Error('Informe --project e --out (pasta nova).');
    for (const file of ['package.json', 'index.html', 'data/System.json', 'js/reactor_main.js', 'LICENSE', 'THIRD_PARTY_NOTICES.md']) {
        if (!fs.existsSync(path.join(project, file))) throw new Error('Projeto Diana incompleto: ' + file);
    }
    const out = freshDestination(destination, [project, sdk]);
    const sdkInfo = copySdk(sdk, out);
    copyTree(project, path.join(out, 'game'), file => ['node_modules', '.git', 'Demo', 'save', 'profile'].includes(path.basename(file)) || /^(debug\.log|project\.rpgreactor)$/i.test(path.basename(file)));
    copyTree(path.resolve(__dirname, '../licenses'), path.join(out, 'game/licenses'));
    fs.writeFileSync(path.join(out, 'Jogar.cmd'), '@echo off\r\nstart "" "%~dp0nw.exe" --user-data-dir="%~dp0profile" "%~dp0game"\r\n');
    return { out, report: manifest(out, { kind: 'game', sdk: sdkInfo, sourceProject: path.basename(project), demoIncluded: false,
        assets: 'Recursos copiados do projeto indicado; direitos sao responsabilidade do autor, nao inferidos pelo exportador.' }) };
}
module.exports = { exportWindows };
if (require.main === module) { try { console.log(exportWindows(options(process.argv.slice(2))).out); } catch (error) { console.error(error.message); process.exitCode = 1; } }
