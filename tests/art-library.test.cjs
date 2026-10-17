'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PNG}=require('../scripts/jrpg-raster.cjs'),art=require('../src/DianaArtLibrary.js');
const sample=require('../src/DianaJRPGSample.js'),starter=require('../src/DianaStarterData.js'),village=require('../src/DianaVillageExpansion.js');
const B=require('../upstream/RPGReactor/editor/src/battle/BattleData.js');
const base=path.resolve(__dirname,'../assets/art-library-v2/pack');
function fixture(){const data=starter.populate({'System.json':{terms:{}},'Items.json':[null],'Animations.json':[null],'MapInfos.json':[null,{id:1}],'Map001.json':{width:17,height:13,data:Array(17*13*6).fill(0),events:[null]},'Tilesets.json':[null,{tilesetNames:Array(9).fill(''),flags:Array(8192).fill(0)}]});sample.populate(data,B);sample.addNativeMedievalRtp(data);sample.completeStarter(data,B);village.completeStarter(data,B);art.populate(data);return data;}
test('biblioteca V2: arquivos íntegros, alpha real e margens de cada pose sem corte',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(base,'manifest.json')));assert.equal(manifest.files.length,69);
 for(const entry of manifest.files){const bytes=fs.readFileSync(path.join(base,entry.path)),png=PNG.sync.read(bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256);assert.deepEqual([png.width,png.height],[entry.width,entry.height]);if(!entry.path.includes('parallaxes')&&!entry.path.includes('battlebacks'))assert.ok(png.data.some((n,i)=>i%4===3&&n===0));}
 const brann=PNG.sync.read(fs.readFileSync(path.join(base,'img/sv_actors/BrannClareiraV2.png')));
 for(let row=0;row<6;row++)for(let col=0;col<6;col++){let visible=0;for(let y=0;y<256;y++)for(let x=0;x<256;x++){const alpha=brann.data[((row*256+y)*1536+col*256+x)*4+3];if(alpha){visible++;assert.ok(x>=7&&x<249&&y>=7&&y<249,'silhueta preserva margem');}}assert.ok(visible>1000,'pose não vazia');}
 const audit=JSON.parse(fs.readFileSync(path.join(base,'brann-audit.json')));assert.ok(audit.scale<=1,'não ampliar uma fonte pequena');assert.ok(audit.warnings.every(w=>w.reason==='detached'&&w.discardedPixels<=2));
});
test('cenários V2: destinos e retorno acessíveis, paredes sólidas e Clareira preservada',()=>{
 const data=fixture();assert.equal(data['Map001.json'].parallaxName,'!VilaClareiraExpandida');
 for(const id of [10,11]){const map=data['Map'+String(id).padStart(3,'0')+'.json'],flags=data['Tilesets.json'][map.tilesetId].flags,start=[id===10?21:25,36],seen=new Set([start.join(',')]),queue=[start];
  const pass=(x,y)=>x>=0&&y>=0&&x<40&&y<40&&flags[map.data[y*40+x]]===0;
  for(let i=0;i<queue.length;i++)for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){const [x,y]=queue[i],next=[x+dx,y+dy],key=next.join(',');if(pass(...next)&&!seen.has(key)){seen.add(key);queue.push(next);}}
  assert.ok(seen.has([start[0],38].join(',')));assert.ok(seen.size>50);assert.equal(pass(0,0),false);assert.equal(map.data.length,40*40*6);
  const portal=data['Map003.json'].events.find(e=>e?.pages[0].list.some(c=>c.code===201&&c.parameters[1]===id));assert.ok(portal);assert.equal(map.events[1].pages[0].list[0].parameters[1],1);
 }
});
test('biblioteca V2 usa contratos de imagem e animação comuns a aliados e monstros',()=>{
 const data=fixture(),settings=data['BattlePresentation.json'],graphic=settings.actors[2].graphic;
 for(const pose of ['idle','attack','damage','guard','victory','dead'])for(let i=0;i<6;i++){const frame=B.graphicFrame(graphic,1536,1536,pose,i*10);assert.equal(frame.width,256);assert.equal(frame.height,256);assert.ok(frame.x>=0&&frame.x+frame.width<=1536);assert.ok(frame.y>=0&&frame.y+frame.height<=1536);}
 for(let id=6;id<=13;id++){const graphic=B.graphic(settings,'enemies',id,data['Enemies.json'][id]),size=[6,10].includes(id)?1536:256,frame=B.graphicFrame(graphic,size,size,'idle',0);assert.equal(frame.width,256);assert.equal(frame.height,256);assert.equal(data['Troops.json'][id].members[0].enemyId,id);assert.equal(data['Enemies.json'][id].battlerName,graphic.name);}
 for(const [kind,ids] of [['actors',[2,3,4]],['enemies',[6,10]]])for(const id of ids){const graphic=B.graphic(settings,kind,id,data[kind==='actors'?'Actors.json':'Enemies.json'][id]);for(const pose of ['idle','attack','damage','guard','victory','dead']){const frame=B.graphicFrame(graphic,1536,1536,pose,0);assert.equal(frame.width,256);assert.equal(frame.height,256);assert.equal(graphic.spriteAnimation.animations[pose].frames.length,6);}}
 for(const entry of art.catalog)assert.ok(fs.existsSync(path.join(base,entry.asset)),entry.asset);
});
test('mapas modulares preservam pintura nativa, copas em primeiro plano e acesso às companheiras',()=>{
 const data=fixture();
 for(const id of [12,13]){const map=data['Map'+String(id).padStart(3,'0')+'.json'],tiles=data['Tilesets.json'][map.tilesetId],size=map.width*map.height;
  assert.equal(map.parallaxName,'');assert.ok(map.data.slice(size,size*2).some(n=>n>0));assert.equal(tiles.flags[0],16);assert.ok(tiles.flags.some(n=>n===15));assert.ok(tiles.tilesetNames[5].includes('Objetos'));
  const pass=(x,y)=>{if(x<0||x>=map.width||y<0||y>=map.height)return false;for(let z=3;z>=0;z--){const flag=tiles.flags[map.data[z*size+y*map.width+x]];if(flag&16)continue;return !(flag&15);}return false;},queue=[[21,31]],seen=new Set(['21,31']);
  for(let i=0;i<queue.length;i++)for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){const next=[queue[i][0]+dx,queue[i][1]+dy],key=next.join(',');if(pass(...next)&&!seen.has(key)){seen.add(key);queue.push(next);}}
  assert.ok(seen.has('21,33'));assert.ok(seen.has('20,28'));assert.ok(seen.size>150);assert.equal(map.events[2].pages[0].list.find(c=>c.code===129).parameters[0],id===12?3:4);
 }
 for(const id of [3,4]){const actor=data['Actors.json'][id],config=data['System.json'].dianaSpriteAnimations.characters[actor.characterName];assert.deepEqual(config.animations.walk.directions[8],[18,19,20,21,22,23]);assert.equal(config.columns,6);assert.equal(config.rows,4);assert.ok(data['Weapons.json'][actor.equips[0]]);}
});
