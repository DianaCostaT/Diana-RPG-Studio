'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {PNG}=require('../upstream/RPGReactor/editor/node_modules/pngjs');
const B=require('../upstream/RPGReactor/editor/src/battle/BattleData.js');
const starter=require('../src/DianaStarterData.js'),sample=require('../src/DianaJRPGSample.js');
function base(){return starter.populate({'System.json':{terms:{}},'MapInfos.json':[null,{id:1}],
 'Map001.json':{width:17,height:13,data:Array(17*13*6).fill(0),events:[null]},
 'Tilesets.json':[null,{tilesetNames:[],flags:Array(8192).fill(0)}],'Items.json':[null],'Animations.json':[null],'Weapons.json':[null],'Armors.json':[null]});}
test('integração preserva heroína ilustrada e cada quadro configurado contém pixels',()=>{
 const data=sample.populate(base(),B),hero=JSON.stringify(data['BattlePresentation.json'].actors[1]);sample.addNativeMedievalRtp(data);
 assert.equal(JSON.stringify(data['BattlePresentation.json'].actors[1]),hero);
 const paths=new Set();for(const pack of ['assets/jrpg-test/pack','assets/rtp/medieval/pack'])for(const file of JSON.parse(fs.readFileSync(path.join(pack,'manifest.json'))).files){assert.ok(!paths.has(file.path),'packs não sobrescrevem '+file.path);paths.add(file.path);}
 for(const kind of ['actors','enemies'])for(const entry of Object.values(data['BattlePresentation.json'][kind])){
  const g=entry.graphic,pack=g.name==='ClareiraCombate'?'assets/jrpg-test/pack':'assets/rtp/medieval/pack',p=PNG.sync.read(fs.readFileSync(path.join(pack,'img',g.folder,g.name+'.png')));
  for(const [motion,a] of Object.entries(g.spriteAnimation.animations))for(let i=0;i<a.frames.length;i++){
   const f=B.graphicFrame(g,p.width,p.height,motion,i*a.speed);let visible=0;
   for(let y=f.y;y<f.y+f.height;y++)for(let x=f.x;x<f.x+f.width;x++)if(p.data[(y*p.width+x)*4+3]>96)visible++;
   assert.ok(visible>100,`${kind} ${g.name} ${motion} ${i}: quadro visível`);
  }
 }
});
test('poção cura 50 PV e técnicas possuem registros de animação nativos e aprendizado',()=>{
 const data=sample.populate(base(),B);sample.addNativeMedievalRtp(data);
 assert.deepEqual(data['Items.json'][1].effects,[{code:11,dataId:0,value1:0,value2:50}]);
 for(const skill of data['Skills.json'].slice(3)){assert.ok(data['Classes.json'][1].learnings.some(l=>l.skillId===skill.id));const a=data['Animations.json'][skill.animationId];assert.equal(a.frames.length,5);assert.ok(a.animation1Name.startsWith('Efeito'));}
 for(const enemy of data['Enemies.json'].slice(2)){assert.ok(enemy.actions.every(a=>data['Skills.json'][a.skillId]));assert.ok(enemy.traits.some(t=>t.code===22&&t.dataId===0&&t.value===1),'acerto físico válido');}
});
test('instalação grava banco completo e mantém PNG canônico de seis colunas',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'diana-jrpg-regression-'));const target=path.join(dir,'project'),data=base();
 fs.mkdirSync(path.join(target,'data'),{recursive:true});for(const [name,value] of Object.entries(data))fs.writeFileSync(path.join(target,'data',name),JSON.stringify(value));
 const previous=globalThis.ReactorBattleData,oldVillage=globalThis.DianaVillageExpansion,oldRtp=globalThis.DianaRTPExpansion;globalThis.ReactorBattleData=B;
 try{
  globalThis.DianaVillageExpansion=require('../src/DianaVillageExpansion.js');
  globalThis.DianaRTPExpansion=require('../src/DianaRTPExpansion.js');
  const editor=path.join(dir,'editor','diana-assets');
  fs.cpSync(path.resolve('assets/jrpg-test/pack'),path.join(editor,'jrpg-test'),{recursive:true});
  fs.cpSync(path.resolve('assets/rtp/medieval/pack'),path.join(editor,'rtp-medieval'),{recursive:true});
  fs.cpSync(path.resolve('assets/defense/pack'),path.join(editor,'defense'),{recursive:true});
  fs.cpSync(path.resolve('assets/vehicles/pack'),path.join(editor,'vehicles'),{recursive:true});
  fs.cpSync(path.resolve('assets/village/pack'),path.join(editor,'village'),{recursive:true});
  sample.installProject({fs,path,getRuntimePath:()=>path.join(dir,'runtime'),_writeFileAtomic:(_fs,file,text)=>_fs.writeFileSync(file,text)},target);
  for(const [name,id] of [['Skills.json',8],['Items.json',1],['Animations.json',7],['Actors.json',2]])assert.ok(JSON.parse(fs.readFileSync(path.join(target,'data',name)))[id],name+' persistido');
  const p=PNG.sync.read(fs.readFileSync(path.join(target,'img/characters/$Liora.png')));assert.deepEqual([p.width,p.height],[288,192]);
  for(const file of ['diana-asset-pack.json','diana-rtp-manifest.json','ASSET_LICENSE.txt','RTP_LICENSE.txt'])assert.ok(fs.existsSync(path.join(target,file)));
  const tiles=JSON.parse(fs.readFileSync(path.join(target,'data/Tilesets.json')));
  for(const set of tiles.filter(Boolean))for(const name of set.tilesetNames.filter(Boolean))assert.ok(fs.existsSync(path.join(target,'img/tilesets',name+'.png')),'tileset realmente instalado: '+name);
  for(const file of fs.readdirSync(path.join(target,'data')).filter(name=>/^Map\d+\.json$/.test(name)))for(const event of JSON.parse(fs.readFileSync(path.join(target,'data',file))).events.filter(Boolean))for(const page of event.pages)for(const item of page.list)if(item.code===401)assert.ok(Array.from(item.parameters[0]).length<=32,'fala cabe na janela: '+event.name);
 }finally{globalThis.ReactorBattleData=previous;globalThis.DianaVillageExpansion=oldVillage;globalThis.DianaRTPExpansion=oldRtp;fs.rmSync(dir,{recursive:true,force:true});}
});
