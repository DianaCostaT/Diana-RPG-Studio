'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { copyTree, freshDestination, packageWindows } = require('../scripts/package-windows.cjs');
const { exportWindows } = require('../scripts/export-windows.cjs');
function fixture() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'diana-package-test-'));
    const write = (p, text) => { fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.writeFileSync(path.join(root, p), text); };
    for (const name of ['nw.exe', 'nw.dll', 'node.dll', 'ffmpeg.dll']) write('sdk/' + name, 'fixture ' + name);
    write('sdk/credits.html', 'This is sample credits page.');
    write('sdk/chromedriver.exe', 'not shipped');
    return { root, write };
}
test('destino existente ou sobreposto e links nao sao aceitos', () => {
    const { root, write } = fixture(); write('source/file', 'preservado');
    assert.throws(() => freshDestination(path.join(root, 'source'), []), /ja existe/);
    assert.throws(() => freshDestination(path.join(root, 'source/child'), [path.join(root, 'source')]), /sobrepoe/);
    fs.symlinkSync(path.join(root, 'source'), path.join(root, 'junction'), process.platform === 'win32' ? 'junction' : 'dir');
    assert.throws(() => copyTree(path.join(root, 'junction'), path.join(root, 'copy')), /Link\/junction/);
    assert.equal(fs.readFileSync(path.join(root, 'source/file'), 'utf8'), 'preservado');
});
test('pacote copia closure real sem lamejs, ferramentas dev ou junction e registra gate notices', () => {
    const { root, write } = fixture();
    write('prepared/editor/src/forge/SoundEffectGenerator/AudioExport.js', 'MP3 opcional desativado');
    write('prepared/editor/package.json', JSON.stringify({ main: 'index.html', dependencies: { pngjs: '1', lamejs: '1' }, devDependencies: { forbidden: '1' } }));
    write('prepared/editor/index.html', '<html>fixture</html>'); write('prepared/provenance.json', '{}');
    write('deps/pngjs/package.json', JSON.stringify({ name: 'pngjs', version: '1', license: 'MIT' }));
    write('deps/pngjs/LICENSE', 'MIT fixture'); write('deps/lamejs/package.json', '{}');
    fs.symlinkSync(path.join(root, 'deps'), path.join(root, 'prepared/editor/node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
    const result = packageWindows({ prepared: path.join(root, 'prepared'), sdk: path.join(root, 'sdk'), destination: path.join(root, 'out') });
    assert.equal(result.report.distributionStatus, 'blocked-license-review');
    assert.equal(result.report.sdk.officialCreditsComplete, false);
    assert.equal(fs.lstatSync(path.join(root, 'out/app/editor/node_modules/pngjs')).isSymbolicLink(), false);
    assert.equal(fs.existsSync(path.join(root, 'out/app/editor/node_modules/lamejs')), false);
    assert.equal(fs.existsSync(path.join(root, 'out/chromedriver.exe')), false);
    assert.equal(fs.readFileSync(path.join(root,'out/Diana.exe')).subarray(0,2).toString(),'MZ');
    assert.equal(result.report.dependencies[0].licenseFiles[0], 'LICENSE');
    assert.equal(fs.readFileSync(path.join(root, 'out/credits.html'), 'utf8'), 'This is sample credits page.');
});
test('export exige runtime e notices e nao altera projeto', () => {
    const { root, write } = fixture();
    write('project/package.json', '{}');
    assert.throws(() => exportWindows({ project: path.join(root, 'project'), sdk: path.join(root, 'sdk'), destination: path.join(root, 'out') }), /incompleto/);
    for (const p of ['index.html', 'data/System.json', 'js/reactor_main.js', 'LICENSE', 'THIRD_PARTY_NOTICES.md']) write('project/' + p, 'fixture');
    write('project/Demo/commercial.png', 'excluded'); write('project/save/file', 'excluded');
    const result = exportWindows({ project: path.join(root, 'project'), sdk: path.join(root, 'sdk'), destination: path.join(root, 'out') });
    assert.equal(result.report.kind, 'game');
    assert.equal(fs.existsSync(path.join(root, 'out/game/Demo')), false);
    assert.equal(fs.existsSync(path.join(root, 'project/Demo/commercial.png')), true);
});
