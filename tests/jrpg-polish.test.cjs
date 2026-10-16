'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const kit=require('../src/DianaTileKit.js'),B=require('../upstream/RPGReactor/editor/src/battle/BattleData.js');
const {PNG,bounds,isolatedCells}=require('../scripts/jrpg-raster.cjs');
test('chipset mantém IDs de objetos independentes, colisão no tronco e oclusão na copa',()=>{
 const map={},tiles={flags:Array(8192).fill(0)};kit.populate(map,tiles);const size=map.width*map.height;
 assert.equal(tiles.flags[kit.tileId(0,1)],16);assert.equal(tiles.flags[kit.tileId(1,4)],15);
 assert.equal(map.data[2*size+6*map.width+9],kit.tileId(4,1));assert.equal(map.data[2*size+9*map.width+12],kit.tileId(7,4));
 const object=map.data[2*size+6*map.width+9];map.data[6*map.width+9]=kit.terrain.stone;assert.equal(map.data[2*size+6*map.width+9],object);
 const ids=new Set();for(let y=0;y<16;y++)for(let x=0;x<16;x++)ids.add(kit.tileId(x,y));assert.equal(ids.size,256);
});
test('vitória de ambos os lados usa seis quadros e mantém a pose final',()=>{
 const {populate}=require('../src/DianaJRPGSample.js'),{populate:starter}=require('../src/DianaStarterData.js');
 const d=populate(starter({'System.json':{terms:{}},'MapInfos.json':[null,{}],'Map001.json':{width:17,height:13,data:Array(1326).fill(0),events:[null]},'Tilesets.json':[null,{tilesetNames:[],flags:Array(8192).fill(0)}]}),B);
 for(const [kind,row] of [['actors',6],['enemies',7]]){const g={...d['BattlePresentation.json'][kind][1].graphic,type:'static'},p=g.poses.victory,grid=g.spriteAnimation.animations.victory;assert.equal(p.frames.length,6);assert.equal(p.loop,'once');for(let i=0;i<6;i++){const f=B.graphicFrame(g,1152,1536,'victory',i*grid.speed);assert.equal(f.x,i*192);assert.equal(f.y,row*192);}assert.equal(B.graphicFrame(g,1152,1536,'victory',10000).x,960);assert.equal(B.graphicFrame({...g,spriteAnimation:undefined},1152,1536,'victory',10000).x,960);}
 assert.equal(d['System.json'].dianaSpriteAnimations.version,1);assert.equal(d['Actors.json'][1].characterName,'$Liora');
});
test('cadência opt-in conserva duração do ciclo e não modifica projetos legados',()=>{
 const patch=fs.readFileSync('patches/zzzzzz-multiframe-cadence.patch','utf8');
 const code=patch.split('\n').filter(l=>l.startsWith('+')&&!l.startsWith('+++')).map(l=>l.slice(1)).join('\n');
 function Character(){}Character.prototype.animationWait=()=>15;Character.rrFramesOf=name=>name==='six'?6:name==='eight'?8:0;
 const system={rrMultiFrameCadence:true};vm.runInNewContext(code,{Game_CharacterBase:Character,$dataSystem:system});const c=new Character();
 for(const [name,count] of [['six',6],['eight',8]]){c._characterName=name;assert.equal(c.animationWait()*count,60);}
 c._characterName='regular';assert.equal(c.animationWait(),15);system.rrMultiFrameCadence=false;c._characterName='six';assert.equal(c.animationWait(),15);
});
test('importação identifica objetos isolados mesmo quando a arte não ocupa linhas iguais',()=>{
 const img=new PNG({width:20,height:40});const rect=(y,h)=>{for(let py=y;py<y+h;py++)for(let x=2;x<8;x++)img.data[(py*20+x)*4+3]=255;};rect(1,22);rect(36,3);
 const rows=isolatedCells(img,1,2);assert.equal(rows[0][0].height,22);assert.equal(rows[1][0].height,3);
});
test('quadros de caminhada têm pés alinhados, margens transparentes e seis recortes distintos',()=>{
 const img=PNG.sync.read(fs.readFileSync('assets/jrpg-test/pack/img/characters/$Liora[f6].png'));
 assert.equal(img.width,288);assert.equal(img.height,192);
 for(let row=0;row<4;row++){const signatures=new Set();for(let col=0;col<6;col++){const b=bounds(img,col*48,row*48,48,48);assert.equal(b.y+b.height-1,row*48+46);assert.ok(b.x>col*48&&b.x+b.width<(col+1)*48);const data=[];for(let y=0;y<48;y++)data.push(img.data.subarray(((row*48+y)*img.width+col*48)*4,((row*48+y)*img.width+col*48+48)*4));signatures.add(require('crypto').createHash('sha256').update(Buffer.concat(data)).digest('hex'));}assert.equal(signatures.size,6);}
});
