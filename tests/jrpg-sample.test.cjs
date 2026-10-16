'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {populate:starter}=require('../src/DianaStarterData.js'),{populate}=require('../src/DianaJRPGSample.js');
const kit=require('../src/DianaTileKit.js'),{compile}=require('../scripts/compile-jrpg-assets.cjs');
const B=require('../upstream/RPGReactor/editor/src/battle/BattleData.js');
function data(){return starter({'System.json':{terms:{}},'MapInfos.json':[null,{id:1}],'Map001.json':{width:17,height:13,data:Array(17*13*6).fill(0),events:[null]},'Tilesets.json':[null,{tilesetNames:Array(9).fill(''),flags:Array(8192).fill(0)}]});}
test('cenário usa terrenos e objetos editáveis, sem imagem achatada',()=>{
 const d=populate(data(),B),m=d['Map001.json'],tiles=d['Tilesets.json'][1];assert.equal(m.data.length,48*40*6);assert.equal(m.parallaxName,'');assert.ok(m.data[30*m.width+20]>=1544&&m.data[30*m.width+20]<1560);assert.equal(d['System.json'].tileSize,32);assert.equal(tiles.tilesetNames[4],'ClareiraTerrenos');assert.equal(tiles.tilesetNames[5],'ClareiraObjetos');assert.equal(tiles.tilesetNames[6],'ClareiraInteriores');assert.equal(tiles.flags[1538],15);assert.equal(m.events[1].pages[0].list[0].parameters[1],5);assert.deepEqual(m.dianaFixture.nativeTiles,{terrainPage:'ClareiraTerrenos',objectPage:'ClareiraObjetos',interiorPage:'ClareiraInteriores',tileSize:32});
});
test('fixtures nativos cobrem rota de colisão e arena de animação',()=>{
 const d=populate(data(),B),tiles=d['Tilesets.json'][1],route=d['Map002.json'],arena=d['Map003.json'];
 for(const map of [route,arena]){assert.equal(map.data.length,32*32*6);assert.equal(map.parallaxName,'');assert.equal(map.dianaFixture.version,1);assert.equal(map.tilesetId,1);for(const id of map.data.slice(0,32*32))assert.ok(id>=1536&&id<1592);for(const id of map.data.slice(2*32*32,3*32*32))assert.ok(id>=0&&id<256);}
 assert.equal(route.dianaFixture.purpose,'navigation-collision-route');assert.equal(arena.dianaFixture.purpose,'animation-battle-demonstration');
 assert.ok(route.data[0*32+12]>=1560&&route.data[0*32+12]<1576);assert.equal(route.data[15*32+12],kit.terrain.wood);assert.equal(tiles.flags[kit.terrain.water],15);assert.equal(tiles.flags[kit.tileId(12,1)],15);
 assert.equal(route.events[1].pages[0].list.find(command=>command.code===201).parameters[1],1);
 assert.equal(arena.events[1].pages[0].list.find(command=>command.code===301).parameters[1],1);assert.equal(arena.events[2].pages[0].list.find(command=>command.code===201).parameters[1],1);
 assert.deepEqual(d['MapInfos.json'].slice(1).map(info=>info.name),['Vila da Clareira','Rota de navegação','Arena de animação e batalha','Hospedaria da Lanterna','Casa do Jardineiro']);
});
test('vila expandida possui praça, moradores, entradas e interiores em tiles nativos',()=>{
 const d=populate(data(),B),village=d['Map001.json'],tiles=d['Tilesets.json'][1],size=village.width*village.height;assert.equal(village.events[9].pages[0].image.characterName,'$Ivo');assert.deepEqual([village.events[9].x,village.events[9].y],[7,18],'the bridge fisherman stands on the crossing instead of in the river');
 assert.equal(village.dianaFixture.purpose,'village-sample');assert.equal(village.events.length,13);
 for(const id of [4,5])assert.equal(village.events[id].pages[0].list.find(command=>command.code===201).parameters[1],id);
 for(const id of [6,7,8,9,10])assert.ok(village.events[id].pages[0].list.some(command=>command.code===401));
 for(const [id,purpose] of [[4,'inn-interior'],[5,'cottage-interior']]){const map=d[`Map00${id}.json`];assert.equal(map.width,20);assert.equal(map.height,16);assert.equal(map.dianaFixture.purpose,purpose);assert.equal(map.parallaxName,'');assert.ok(map.data.slice(2*20*16,3*20*16).some(tile=>tile>=256&&tile<512));assert.equal(map.events[1].pages[0].list.find(command=>command.code===201).parameters[1],1);}
 assert.ok(village.data.slice(2*size,3*size).some(tile=>tile===kit.objectTileId(kit.objects.market,1,0)));assert.equal(tiles.flags[kit.objectTileId(kit.objects.table,3,3)],15);
});
test('compilador de assets mantém manifesto e páginas de tiles determinísticos',()=>{
 const base=path.resolve('assets/jrpg-test/pack'),before=fs.readFileSync(path.join(base,'manifest.json'));
 compile();const once=fs.readFileSync(path.join(base,'manifest.json'));compile();const twice=fs.readFileSync(path.join(base,'manifest.json'));
 assert.deepEqual(once,before);assert.deepEqual(twice,once);
 const chipset=JSON.parse(fs.readFileSync(path.join(base,'chipset.json'),'utf8'));assert.deepEqual(chipset.pages.A5,{name:'ClareiraTerrenos',tileIdStart:1536,columns:8});assert.deepEqual(chipset.pages.B,{name:'ClareiraObjetos',tileIdStart:0,columns:16});
 for(const [name,width,height] of [['ClareiraTerrenos',256,224],['ClareiraObjetos',512,512],['ClareiraInteriores',512,512]]){const bytes=fs.readFileSync(path.join(base,'img/tilesets',name+'.png'));assert.equal(bytes.readUInt32BE(16),width);assert.equal(bytes.readUInt32BE(20),height);}
 assert.deepEqual(chipset.pages.C,{name:'ClareiraInteriores',tileIdStart:256,columns:16});
});
test('aliados e inimigos usam quatro quadros e sequências equivalentes com impacto sincronizado',()=>{
 const d=populate(data(),B),s=d['BattlePresentation.json'];assert.ok(s.screen2d.actorHomes[1].x-s.screen2d.actorHomes[0].x>=200,'party battlers are spaced for clear silhouettes');for(const kind of ['actors','enemies']){const g=s[kind][1].graphic;assert.deepEqual(B.validateGraphicPoses(g.poses),[]);assert.equal(g.poses.attack.frames.length,kind==='actors'?4:6);assert.equal(B.graphicPoseDuration(g.poses.attack),kind==='actors'?32:48);}
 for(const [kind,row] of [['actors',4],['enemies',5]]){const g={...s[kind][1].graphic,type:'static'},grid=g.spriteAnimation.animations.damage;assert.equal(g.motions.damage.pose,'damage');assert.equal(g.poses.damage.loop,false);assert.equal(grid.frames.length,kind==='actors'?4:6);for(let i=0;i<grid.frames.length;i++){const f=B.graphicFrame(g,1152,1536,'damage',i*grid.speed);assert.equal(f.y,row*192);assert.equal(f.x,i*192);assert.notDeepEqual(f,B.graphicFrame(g,1152,1536,'idle',i*grid.speed));}assert.equal(B.graphicFrame({...g,spriteAnimation:undefined},1152,1536,'damage',0).y,row*192);}
 for(const id of [1,2]){const steps=d['ActionSequences.json'][id].steps;assert.equal(steps.filter(s=>s.type==='impact').length,1);assert.ok(steps.find(s=>s.type==='motion'&&s.motion==='attack').duration>=steps.find(s=>s.type==='move').duration);assert.ok(steps.find(s=>s.type==='wait').duration>=(id===1?48:32),'target damage animation completes before next action');}
 for(const kind of ['actors','enemies'])for(const motion of ['input','ready','entry','wait','moving','guard','dead','attack']){const g={...s[kind][1].graphic,type:'static'};assert.equal(B.graphicFrame(g,1152,1536,motion,0).width,192,kind+' '+motion+' must not render the atlas');}
});
test('arquivos importados correspondem ao manifesto e preservam alpha nas spritesheets',()=>{
 const base=path.resolve('assets/jrpg-test/pack'),manifest=JSON.parse(fs.readFileSync(path.join(base,'manifest.json'),'utf8'));assert.equal(manifest.files.length,17);
 const expanded=manifest.files.find(file=>file.path==='img/parallaxes/!VilaClareiraExpandida.png');assert.deepEqual([expanded.width,expanded.height],[2560,2048]);
 const {PNG}=require('../upstream/RPGReactor/editor/node_modules/pngjs');for(const entry of manifest.files){const bytes=fs.readFileSync(path.join(base,entry.path));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256);assert.equal(bytes.readUInt32BE(16),entry.width);if(entry.path.includes('characters/')||entry.path.includes('sv_actors/')){const image=PNG.sync.read(bytes);let clear=0,visible=0;for(let i=3;i<image.data.length;i+=4){if(image.data[i]===0)clear++;if(image.data[i]>0)visible++;}assert.ok(clear>0&&visible>0);}}
});
test('Guardião preserva 12 células com centro e base alinhados após a compilação',()=>{
 const {PNG}=require('../upstream/RPGReactor/editor/node_modules/pngjs'),image=PNG.sync.read(fs.readFileSync(path.join('assets/jrpg-test/pack/img/characters','$Guardiao.png')));
 assert.deepEqual([image.width,image.height],[144,192]);
 for(let row=0;row<4;row++)for(let col=0;col<3;col++){
  let minX=48,maxX=-1,maxY=-1;
  for(let y=row*48;y<(row+1)*48;y++)for(let x=col*48;x<(col+1)*48;x++)if(image.data[(y*image.width+x)*4+3]>0){const localX=x%48,localY=y%48;minX=Math.min(minX,localX);maxX=Math.max(maxX,localX);maxY=Math.max(maxY,localY);}
  assert.ok(maxX>=0,`frame ${row},${col} is not empty`);
  assert.ok(Math.abs((minX+maxX+1)/2-24)<=0.5,`frame ${row},${col} is horizontally centered`);
  assert.equal(maxY+1,47,`frame ${row},${col} shares the common ground line`);
 }
});
