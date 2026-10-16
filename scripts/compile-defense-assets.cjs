'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const raster = require('./jrpg-raster.cjs');
const root = path.resolve(__dirname, '..');
function compile() {
    const out = path.join(root, 'assets/defense/pack');
    const source = path.join(root, 'assets/jrpg-test/originals/DefesaClareira.png');
    const frames = raster.cells(raster.PNG.sync.read(fs.readFileSync(source)), 6, 4);
    const sheet = new raster.PNG({width: 1152, height: 768});
    for (let row = 0; row < 4; row++) raster.aligned(frames[row], sheet, {cellWidth: 192, cellHeight: 192, row, targetHeight: 156, baseline: 186});
    const save = (relative, bytes) => {const file = path.join(out, relative); fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, bytes);};
    save('img/sv_actors/DefesaClareira.png', raster.PNG.sync.write(sheet));
    save('img/titles1/BosqueClareira.png', fs.readFileSync(path.join(root, 'assets/jrpg-test/pack/img/battlebacks1/BosqueClareira.png')));
    save('img/system/IconSet.png', fs.readFileSync(path.join(root, 'assets/rtp/medieval/pack/img/system/DianaMedievalIcons.png')));
    const files = ['img/sv_actors/DefesaClareira.png', 'img/titles1/BosqueClareira.png', 'img/system/IconSet.png'].map(relative => {
        const bytes = fs.readFileSync(path.join(out, relative)), image = raster.PNG.sync.read(bytes);
        return {path: relative, width: image.width, height: image.height, sha256: crypto.createHash('sha256').update(bytes).digest('hex')};
    });
    const manifest = {version: 1, license: 'MIT', origin: 'Defesa original gerada com imagegen para Diana; cenário e ícones originais reutilizados dos packs Diana.', files};
    save('manifest.json', JSON.stringify(manifest, null, 2) + '\n');
    save('LICENSE', fs.readFileSync(path.join(root, 'LICENSE')));
    return manifest;
}
module.exports = {compile};
if (require.main === module) console.log('Defesas compiladas: ' + compile().files.length + ' imagens.');
