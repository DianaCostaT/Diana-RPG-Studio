'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PNG}=require('../upstream/RPGReactor/editor/node_modules/pngjs');
const {compile}=require('../scripts/compile-native-rtp.cjs');
const {addNativeMedievalRtp}=require('../src/DianaJRPGSample.js');
const B=require('../upstream/RPGReactor/editor/src/battle/BattleData.js');
const pack=path.resolve('assets/rtp/medieval/pack');
test('RTP Medieval é determinístico, tem grades declaradas e alpha',()=>{
 const first=compile(),before=fs.readFileSync(path.join(pack,'manifest.json'));compile();assert.deepEqual(fs.readFileSync(path.join(pack,'manifest.json')),before);assert.equal(first.files.length,16);
 for(const entry of first.files){const bytes=fs.readFileSync(path.join(pack,entry.path)),png=PNG.sync.read(bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256);assert.deepEqual([png.width,png.height],[entry.width,entry.height]);let clear=0,opaque=0;for(let i=3;i<png.data.length;i+=4){if(png.data[i]===0)clear++;if(png.data[i]>=200)opaque++;}assert.ok(clear>0&&opaque>0,entry.path);}
 assert.deepEqual(first.grid.effects,[960,192]);assert.equal(first.license,'MIT');
});
test('contratos Medieval distinguem atores, inimigos, itens e efeitos selecionáveis',()=>{
 const data={'Actors.json':[null,{id:1,characterName:'$Liora'}], 'Enemies.json':[null,{id:1,battlerName:'Guardiao'}], 'Troops.json':[null], 'Skills.json':[null,null,null], 'Items.json':[null], 'BattlePresentation.json':{actors:{},enemies:{},skills:{},items:{}}};addNativeMedievalRtp(data);
 assert.notEqual(data['Actors.json'][1].characterName,data['Actors.json'][2].characterName);
 assert.equal(data['BattlePresentation.json'].actors[1],undefined,'RTP must preserve existing hero presentation');const liora=data['BattlePresentation.json'].actors[2].graphic;assert.equal(liora.name,'BrannMedieval');assert.deepEqual([liora.spriteAnimation.columns,liora.spriteAnimation.rows],[6,6]);assert.equal(liora.spriteAnimation.animations.attack.frames.length,6);
 for(const [motion,row] of [['idle',0],['attack',1],['damage',2],['guard',3],['victory',4],['dead',5]]){const frame=B.graphicFrame(liora,1152,1152,motion,0);assert.deepEqual([frame.x,frame.y,frame.width,frame.height],[0,row*192,192,192]);}
 assert.deepEqual(data['Enemies.json'].slice(2).map(e=>e.battlerName),['LoboCinza','MusgoVivo','BruxaCinza']);
 for(const id of [2,3,4]){const graphic=data['BattlePresentation.json'].enemies[id].graphic;assert.equal(graphic.poses,undefined);assert.equal(graphic.spriteAnimation.animations.damage.frames.length,6);assert.equal(B.graphicFrame(graphic,1152,1152,'attack',0).width,192);}
 for(const id of [3,4,5,6,7,8]){assert.equal(data['BattlePresentation.json'].skills[id].effect.folder,'animations');assert.match(data['Skills.json'][id].note,/DianaEffect/);}
 assert.equal(data['BattlePresentation.json'].items[1].effect.name,'EfeitoImpacto');
});
