'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PNG}=require('../upstream/RPGReactor/editor/node_modules/pngjs');
const {compile}=require('../scripts/compile-native-rtp.cjs');
const {addNativeMedievalRtp}=require('../src/DianaJRPGSample.js');
const B=require('../upstream/RPGReactor/editor/src/battle/BattleData.js');
const pack=path.resolve('assets/rtp/medieval/pack');
test('RTP Medieval é determinístico, tem grades declaradas e alpha',()=>{
 const first=compile(),before=fs.readFileSync(path.join(pack,'manifest.json'));compile();assert.deepEqual(fs.readFileSync(path.join(pack,'manifest.json')),before);assert.equal(first.files.length,17);
 for(const entry of first.files){const bytes=fs.readFileSync(path.join(pack,entry.path)),png=PNG.sync.read(bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256);assert.deepEqual([png.width,png.height],[entry.width,entry.height]);let clear=0,opaque=0;for(let i=3;i<png.data.length;i+=4){if(png.data[i]===0)clear++;if(png.data[i]>=200)opaque++;}assert.ok(clear>0&&opaque>0,entry.path);}
 assert.deepEqual(first.grid.effects,[960,192]);assert.deepEqual(first.grid.rootGuardian,[768,768]);assert.equal(first.license,'MIT');
});
test('contratos Medieval distinguem atores, inimigos, itens e efeitos selecionáveis',()=>{
 const data={'Actors.json':[null,{id:1,characterName:'$Liora'}], 'Enemies.json':[null,{id:1,battlerName:'Guardiao'}], 'Troops.json':[null], 'Skills.json':[null,null,null], 'Items.json':[null], 'BattlePresentation.json':{actors:{},enemies:{},skills:{},items:{}}};addNativeMedievalRtp(data);
 assert.notEqual(data['Actors.json'][1].characterName,data['Actors.json'][2].characterName);
 assert.equal(data['Actors.json'][2].faceName,'ClareiraRostos');assert.equal(data['Actors.json'][2].faceIndex,6);
 assert.equal(data['BattlePresentation.json'].actors[1],undefined,'RTP must preserve existing hero presentation');const liora=data['BattlePresentation.json'].actors[2].graphic;assert.equal(liora.name,'BrannMedieval');assert.deepEqual([liora.spriteAnimation.columns,liora.spriteAnimation.rows],[6,6]);assert.equal(liora.spriteAnimation.animations.attack.frames.length,6);
 for(const [motion,row] of [['idle',0],['attack',1],['damage',2],['guard',3],['victory',4],['dead',5]]){const frame=B.graphicFrame(liora,1152,1152,motion,0);assert.deepEqual([frame.x,frame.y,frame.width,frame.height],[0,row*192,192,192]);}
 assert.deepEqual(data['Enemies.json'].slice(2).map(e=>e.battlerName),['LoboCinza','MusgoVivo','BruxaCinza','GuardiaoRaiz']);
 for(const id of [2,3,4]){const graphic=data['BattlePresentation.json'].enemies[id].graphic;assert.equal(graphic.poses,undefined);assert.equal(graphic.spriteAnimation.animations.damage.frames.length,6);assert.equal(B.graphicFrame(graphic,1152,1152,'attack',0).width,192);}
 const rootGuardian=data['BattlePresentation.json'].enemies[5].graphic;assert.deepEqual([rootGuardian.spriteAnimation.columns,rootGuardian.spriteAnimation.rows],[4,4]);for(const [motion,index] of [['idle',0],['attack',4],['damage',8],['guard',12]]){const frame=B.graphicFrame(rootGuardian,768,768,motion,0);assert.deepEqual([frame.x,frame.y],[index%4*192,Math.floor(index/4)*192]);}
 for(const id of [3,4,5,6,7,8]){assert.equal(data['BattlePresentation.json'].skills[id].effect.folder,'animations');assert.match(data['Skills.json'][id].note,/DianaEffect/);}
 assert.equal(data['BattlePresentation.json'].items[1].effect.name,'EfeitoImpacto');
});
test('Brann mantém escala, centro e linha do chão em todos os quadros de caminhada e ataque',()=>{
 const walk=PNG.sync.read(fs.readFileSync(path.join(pack,'img/characters','$Brann.png')));
 const battle=PNG.sync.read(fs.readFileSync(path.join(pack,'img/sv_actors/BrannMedieval.png')));
 for(const [image,columns,rows,cellWidth,cellHeight,baseline,minHeight,label] of [[walk,6,4,48,48,47,40,'walk'],[battle,6,6,192,192,185,115,'battle']]){
  assert.deepEqual([image.width,image.height],[columns*cellWidth,rows*cellHeight]);
  for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
   let minX=cellWidth,maxX=-1,maxY=-1,minY=cellHeight;
   for(let y=row*cellHeight;y<(row+1)*cellHeight;y++)for(let x=col*cellWidth;x<(col+1)*cellWidth;x++)if(image.data[(y*image.width+x)*4+3]>=96){const lx=x%cellWidth,ly=y%cellHeight;minX=Math.min(minX,lx);maxX=Math.max(maxX,lx);minY=Math.min(minY,ly);maxY=Math.max(maxY,ly);}
   assert.ok(maxX>=0,`${label} frame ${row},${col} is not empty`);
   assert.ok(Math.abs((minX+maxX+1)/2-cellWidth/2)<=1,`${label} frame ${row},${col} is horizontally centered`);
   assert.equal(maxY+1,baseline,`${label} frame ${row},${col} shares the common ground line`);
   assert.ok(maxY-minY+1>=(label==='battle'&&row===5?45:minHeight),`${label} frame ${row},${col} preserves the full pose (including lying down)`);
  }
 }
});
