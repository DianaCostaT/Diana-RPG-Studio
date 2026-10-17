'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');

class Element {
    constructor(tag) { this.tag = tag; this.children = []; this.dataset = {}; this.attrs = {}; this.style = {}; this.value = ''; this.className = ''; this.disabled = false; }
    append(...nodes) { this.children.push(...nodes); }
    replaceChildren(...nodes) { this.children = nodes; }
    setAttribute(key, value) { this.attrs[key] = String(value); }
    getAttribute(key) { return this.attrs[key] ?? null; }
    getContext() {
        const canvas = this;
        return {
            moveTo() {}, lineTo() {}, clearRect() {}, fillRect() {}, drawImage(image) { if (image?.imageData) canvas.imageData = image.imageData; },
            getImageData() { const source = canvas.imageData || { width: canvas.width, height: canvas.height, data: new Uint8ClampedArray(canvas.width * canvas.height * 4) }; return { width: source.width, height: source.height, data: new Uint8ClampedArray(source.data) }; },
            putImageData(imageData) { canvas.imageData = imageData; }
        };
    }
    toBlob(callback) { callback(new Blob([this.imageData?.data || new Uint8Array()], { type: 'image/png' })); }
    set textContent(value) { this._text = String(value); this.children = []; }
    get textContent() { return (this._text || '') + this.children.map(node => node.textContent || '').join(''); }
}

function loadComposer() {
    const document = { createElement: tag => new Element(tag), addEventListener() {} };
    const context = { document, requestAnimationFrame: () => 1, cancelAnimationFrame() {}, console, require, Map, Set, Promise, JSON, Math, Number, String, Object, Array, Error, Uint8Array, Uint8ClampedArray };
    vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../src/DianaBattle2D.js'), 'utf8'), context);
    return context;
}

test('centralização alinha sprites ao centro e aos pés sem atravessar células nem suavizar pixels', () => {
    const { DianaBattle2D: { SpriteSheetTools } } = loadComposer();
    const width = 24, height = 12, data = new Uint8ClampedArray(width * height * 4);
    const put = (x, y, color) => data.set(color, (y * width + x) * 4);
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) put(x, y, [220, 20, 30, 255]);
    for (let y = 8; y < 12; y++) for (let x = 20; x < 24; x++) put(x, y, [20, 30, 220, 255]);
    const result = SpriteSheetTools.center({ width, height, data }, 2, 1, 1);
    assert.equal(result.moved, 2);
    assert.deepEqual(Array.from(result.movedCells), [0, 1]);
    assert.deepEqual(Array.from(result.data.slice((7 * width + 4) * 4, (7 * width + 4) * 4 + 4)), [220, 20, 30, 255]);
    assert.deepEqual(Array.from(result.data.slice((7 * width + 16) * 4, (7 * width + 16) * 4 + 4)), [20, 30, 220, 255]);
    assert.equal(result.data[(7 * width + 3) * 4 + 3], 0, 'a sprite stays within its cell');
    assert.equal(data[(0 * width + 0) * 4 + 3], 255, 'the source image is untouched');
});

test('células vazias e folhas opacas sem limites confiáveis permanecem intactas', () => {
    const { DianaBattle2D: { SpriteSheetTools } } = loadComposer();
    const data = new Uint8ClampedArray(4 * 2 * 4);
    for (let i = 0; i < data.length; i += 4) data.set([90, 100, 110, 255], i);
    const result = SpriteSheetTools.center({ width: 4, height: 2, data }, 1, 1);
    assert.equal(result.moved, 0);
    assert.equal(result.cells[0].solid, true);
    assert.deepEqual(Array.from(result.data), Array.from(data));
    assert.throws(() => SpriteSheetTools.analyze({ width: 4, height: 2, data: new Uint8Array(3) }, 1, 1), /inválida/);
});

test('junções com pixels contínuos entre células são sinalizadas e preservadas sem corte', () => {
    const { DianaBattle2D: { SpriteSheetTools } } = loadComposer();
    const width = 8, height = 4, data = new Uint8ClampedArray(width * height * 4);
    const put = (x, y) => data.set([210, 90, 40, 255], (y * width + x) * 4);
    put(3, 1); put(4, 1);
    const cells = SpriteSheetTools.analyze({ width, height, data }, 2, 1);
    assert.deepEqual(Array.from(cells, cell => cell.ambiguous), [true, true]);
    assert.deepEqual(Array.from(cells[0].seam), ['right']);
    assert.deepEqual(Array.from(cells[1].seam), ['left']);
    const result = SpriteSheetTools.center({ width, height, data }, 2, 1, 1);
    assert.equal(result.moved, 0);
    assert.deepEqual(Array.from(result.skippedCells), [0, 1]);
    assert.deepEqual(Array.from(result.data), Array.from(data));
});

test('limiar zero preserva pixels antialias e a margem elimina toque entre quadros', () => {
    const { DianaBattle2D: { SpriteSheetTools } } = loadComposer();
    const width = 16, height = 8, data = new Uint8ClampedArray(width * height * 4);
    const put = (x, y, alpha) => data.set([200, 180, 100, alpha], (y * width + x) * 4);
    put(1, 1, 12); put(2, 2, 255); put(9, 2, 255);
    const result = SpriteSheetTools.center({ width, height, data }, 2, 1, 1);
    assert.equal(result.data.filter((value, index) => index % 4 === 3 && value === 12).length, 1);
    const left = result.alignedCells[0], right = result.alignedCells[1];
    assert.ok(left.bounds.x > left.x && left.bounds.x + left.bounds.width < left.x + left.width);
    assert.ok(right.bounds.x > right.x && right.bounds.x + right.bounds.width < right.x + right.width);
});

test('cliques na folha registram e alternam a ordem da animação sem uma esteira', () => {
    const { DianaSpriteComposer } = loadComposer(), host = new Element('div');
    const composer = DianaSpriteComposer.mount(host, { value: { version: 1, columns: 2, rows: 2, anchor: { x: .5, y: 1 }, animations: { walk: { frames: [], speed: 8, loop: true } } } });
    const all = (node = host) => [node, ...node.children.flatMap(child => all(child))];
    for (const index of [3, 0, 2]) all().find(node => node.dataset.dianaGridCell === String(index)).onclick();
    assert.deepEqual(Array.from(composer.value.animations.walk.frames), [3, 0, 2]);
    assert.equal(all().find(node => node.dataset.dianaGridCell === '0').attrs['aria-pressed'], 'true');
    all().find(node => node.dataset.dianaGridCell === '0').onclick();
    assert.deepEqual(Array.from(composer.value.animations.walk.frames), [3, 2]);
    assert.equal(all().some(node => node.className === 'diana-grid-frames'), false);
    composer.dispose();
});

test('o botão de correção atualiza a prévia e libera o salvamento somente depois do alinhamento', async () => {
    const { DianaSpriteComposer } = loadComposer(), host = new Element('div'), width = 8, height = 4, data = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) data.set([100, 150, 200, 255], (y * width + x) * 4);
    let saved = null;
    const image = { width, height, imageData: { width, height, data } };
    DianaSpriteComposer.mount(host, { value: { version: 1, columns: 2, rows: 1, anchor: { x: .5, y: 1 }, animations: { idle: { frames: [0], speed: 8, loop: true } } }, image, onSaveImage: async (blob, result) => { saved = { blob, result }; } });
    const all = (node = host) => [node, ...node.children.flatMap(child => all(child))];
    const save = all().find(node => node.textContent === 'Salvar folha corrigida no projeto');
    assert.equal(save.disabled, true);
    all().find(node => node.textContent === 'Centralizar e proteger quadros').onclick();
    const ready = all().find(node => node.textContent === 'Salvar folha corrigida no projeto');
    assert.equal(ready.disabled, false);
    await ready.onclick();
    assert.equal(saved.result.moved, 1);
    assert.equal(saved.blob.type, 'image/png');
});

test('salvar folha centralizada cria uma cópia no diretório de assets e evita sobrescrever', async () => {
    const { DianaBattle2D: { saveAlignedSheet } } = loadComposer();
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'luae-sprite-save-'));
    try {
        const blob = new Blob([new Uint8Array([1, 2, 3, 4])], { type: 'image/png' });
        const first = await saveAlignedSheet(blob, { projectRoot: root, folder: 'characters', name: '$Hero' });
        const second = await saveAlignedSheet(blob, { projectRoot: root, folder: 'characters', name: '$Hero' });
        assert.equal(first, '$Hero_centralizado');
        assert.equal(second, '$Hero_centralizado_2');
        assert.deepEqual(Array.from(fs.readFileSync(path.join(root, 'img', 'characters', first + '.png'))), [1, 2, 3, 4]);
        await assert.rejects(saveAlignedSheet(blob, { projectRoot: root, folder: '../outside', name: 'Hero' }), /pasta.*válida/i);
    } finally {
        const tempRoot = path.resolve(os.tmpdir()), resolved = path.resolve(root);
        assert.ok(resolved.startsWith(tempRoot + path.sep));
        fs.rmSync(resolved, { recursive: true, force: true });
    }
});

test('margem grande n?o escreve pixels em outro frame de c?lulas pequenas', () => {
 const { DianaBattle2D: { SpriteSheetTools } }=loadComposer();
 const data=new Uint8ClampedArray(8*4*4);data.set([20,40,60,255],0);
 const result=SpriteSheetTools.center({width:8,height:4,data},2,1,20);
 assert.equal(result.alignedCells[1].empty,true);
 assert.equal(result.data.filter((v,i)=>i%4===3&&v>0).length,1);
 assert.throws(()=>SpriteSheetTools.center({width:8,height:4,data},2,1,-1),/Margem/);
});

test('limpeza remove fragmentos de borda e preserva detalhes internos e original',()=>{
 const {DianaBattle2D:{SpriteSheetTools}}=loadComposer(),width=20,height=20,data=new Uint8ClampedArray(width*height*4);
 const put=(x,y)=>data.set([20,40,60,255],(y*width+x)*4);
 for(let y=5;y<12;y++)for(let x=5;x<12;x++)put(x,y);put(0,7);put(15,15);
 const result=SpriteSheetTools.cleanEdges({width,height,data},1,1);
 assert.equal(result.data[7*width*4+3],0);assert.equal(data[7*width*4+3],255);
 assert.equal(result.data[(15*width+15)*4+3],255);
 assert.deepEqual(Array.from(result.removedCells),[0]);
});
