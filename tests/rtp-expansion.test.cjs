'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PNG}=require('../upstream/RPGReactor/editor/node_modules/pngjs');
const {compile}=require('../scripts/compile-vehicle-assets.cjs');
const expansion=require('../src/DianaRTPExpansion.js');
function data(){return {'System.json':{},'Map001.json':{width:12,height:30,data:Array(12*30*6).fill(0)},'Tilesets.json':[null,{flags:Array(8192).fill(0)}]};}
test('seguidores têm preferência persistida e controles ligados aos comandos nativos',()=>{
 const d=expansion.populate(data()),control=d['System.json'].dianaEditorControls.followers;
 assert.equal(d['System.json'].optFollowers,true);assert.equal(control.valuePath,'System.optFollowers');
 assert.deepEqual(control.nativeCommands.show,[{code:216,indent:0,parameters:[0]}]);
 assert.deepEqual(control.nativeCommands.hideAndGather,[{code:216,indent:0,parameters:[1]},{code:217,indent:0,parameters:[]}]);
 const hidden=expansion.populate({...data(),'System.json':{optFollowers:false}});assert.equal(hidden['System.json'].optFollowers,false);
});
test('veículos nativos usam sprites próprios e nascem em água ou solo transitável',()=>{
 const d=expansion.populate(data()),system=d['System.json'],map=d['Map001.json'],flags=d['Tilesets.json'][1].flags;
 for(const [id,name,x,y] of [['boat','$DianaBoat',2,20],['ship','$DianaShip',5,21],['airship','$DianaAirship',6,22]]){assert.equal(system[id].characterName,name);assert.equal(system[id].startX,x);assert.equal(system[id].startY,y);}
 for(const x of [2,3,4,5])assert.equal(map.data[20*map.width+x],1538);
 assert.equal(flags[1538]&0x0600,0,'barcos podem navegar na água');assert.equal(flags[1536]&0x0600,0x0600,'barcos não navegam em solo');assert.equal(flags[1536]&0x0800,0,'aeronave pode pousar em solo');
});
test('catálogo aponta recursos existentes e registros reais, sem cartões fictícios',()=>{
 const ids=new Set(expansion.catalog.map(entry=>entry.id));assert.equal(expansion.catalog.length,28);
 for(const id of ['hero-brann','npc-mira','enemy-lobo','map-vila','background-bosque','background-praca','effect-fogo','vehicle-airship'])assert.ok(ids.has(id));
 for(const entry of expansion.catalog){assert.ok(entry.asset);assert.ok(entry.database.table);assert.ok(Number.isInteger(entry.database.id)||typeof entry.database.id==='string');}
 const data={'Actors.json':[null,{}],'Enemies.json':[null,{}],'Troops.json':[null],'Skills.json':[null,null,null],'Items.json':[null],'Animations.json':[null],'BattlePresentation.json':{actors:{},enemies:{},skills:{},items:{}}};require('../src/DianaJRPGSample.js').addNativeMedievalRtp(data);
 for(const entry of expansion.catalog.filter(e=>e.kind==='effect'))assert.equal('img/animations/'+data['Animations.json'][entry.database.id].animation1Name+'.png',entry.asset);
});
test('biblioteca de recursos apresenta catálogo, abre a tabela certa e navega diretamente ao mapa',()=>{
 const previous=global.document,opened=[],maps=[],make=tag=>({tag,children:[],style:{},append(...nodes){this.children.push(...nodes);},setAttribute(){}});
 global.document={createElement:make};
 try{
  const host=make('div'),result=expansion.mountLibrary(host,{openDatabase:table=>opened.push(table),openMap:id=>maps.push(id)});
  assert.equal(result.grid.children.length,expansion.catalog.length);
  assert.match(host.children[0].textContent,/Exemplos editáveis/);
  const vehicleIndex=expansion.catalog.findIndex(item=>item.kind==='vehicle');result.grid.children[vehicleIndex].onclick();
  assert.deepEqual(opened,['system']);
  const mapIndex=expansion.catalog.findIndex(item=>item.id==='map-vila');result.grid.children[mapIndex].onclick();assert.deepEqual(maps,[1]);
 }finally{global.document=previous;}
});
test('pack de veículos é determinístico, contém sprites RGBA 3x4 e hashes corretos',()=>{
 const first=compile(),base=path.resolve('assets/vehicles/pack'),before=fs.readFileSync(path.join(base,'manifest.json'));compile();assert.deepEqual(fs.readFileSync(path.join(base,'manifest.json')),before);assert.equal(first.files.length,3);
 for(const entry of first.files){const bytes=fs.readFileSync(path.join(base,entry.path)),png=PNG.sync.read(bytes);assert.deepEqual([png.width,png.height],[144,192]);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256);let visible=0;for(let i=3;i<png.data.length;i+=4)visible+=png.data[i]>0;assert.ok(visible>0);}
});
