const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/DianaWorkspace.js'),'utf8');
function setup(){
 class Palette{constructor(layer,textures){this.currentLayer=layer;this.tilesetTextures=textures;this.selected=[];}async loadTilesetForMap(){}selectLayer(layer){this.selected.push(layer);this.currentLayer=layer;}}
 vm.runInNewContext(source,{TilesetPaletteViewer:Palette,document:{addEventListener(_name,fn){fn();},getElementById(){return null;}}});
 return Palette;
}
test('paleta inicial escolhe folha disponível e preserva uma folha válida ou ferramenta especial',async()=>{
 const Palette=setup();
 for(const [initial,textures,expected] of [['A',{B:{}},'B'],['A',{A2:{},B:{}},'A'],['C',{B:{},C:{}},'C'],['R',{B:{}},'R'],['E',{},'E']]){
  const palette=new Palette(initial,textures);await palette.loadTilesetForMap({});assert.equal(palette.currentLayer,expected);
 }
});
test('carregamento antigo não muda seleção após uma requisição nova',async()=>{
 let release;
 class Palette{constructor(){this.currentLayer='A';this.tilesetTextures={B:{}};this.selected=[];}loadTilesetForMap(map){return map.old?new Promise(resolve=>release=resolve):Promise.resolve();}selectLayer(layer){this.selected.push(layer);this.currentLayer=layer;}}
 vm.runInNewContext(source,{TilesetPaletteViewer:Palette,document:{addEventListener(_name,fn){fn();},getElementById(){return null;}}});
 const palette=new Palette(),old=palette.loadTilesetForMap({old:true});
 await palette.loadTilesetForMap({});palette.currentLayer='C';release();await old;
 assert.equal(palette.currentLayer,'C');assert.deepEqual(palette.selected,['B']);
});
