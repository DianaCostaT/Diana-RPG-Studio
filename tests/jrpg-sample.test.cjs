'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {populate:starter}=require('../src/DianaStarterData.js'),{populate,walkable}=require('../src/DianaJRPGSample.js');
const B=require('../upstream/RPGReactor/editor/src/battle/BattleData.js');
function data(){return starter({'System.json':{terms:{}},'MapInfos.json':[null,{id:1}],'Map001.json':{width:17,height:13,data:Array(17*13*6).fill(0),events:[null]},'Tilesets.json':[null,{tilesetNames:Array(9).fill(''),flags:Array(8192).fill(0)}]});}
test('cenário ilustrado usa parallax nativo, colisões e posições transitáveis',()=>{
 const d=populate(data(),B),m=d['Map001.json'];assert.equal(m.data.length,32*32*6);assert.equal(m.parallaxName,'!VilaClareira');assert.equal(m.data[24*32+18],1);assert.equal(walkable(18,25),true);assert.equal(walkable(1,1),false);assert.equal(d['Tilesets.json'][1].flags[2],15);assert.equal(m.events[1].pages[0].list[0].parameters[1],5);
});
test('aliados e inimigos usam quatro quadros e sequências equivalentes com impacto sincronizado',()=>{
 const d=populate(data(),B),s=d['BattlePresentation.json'];for(const kind of ['actors','enemies']){const g=s[kind][1].graphic;assert.deepEqual(B.validateGraphicPoses(g.poses),[]);assert.equal(g.poses.idle.frames.length,4);assert.equal(g.poses.attack.frames.length,4);assert.equal(B.graphicPoseDuration(g.poses.attack),32);}
 const semantic=steps=>steps.map(({id,...step})=>step);
 for(const [kind,row] of [['actors',4],['enemies',5]]){const g={...s[kind][1].graphic,type:'static'};assert.equal(g.motions.damage.pose,'damage');assert.equal(g.poses.damage.loop,false);assert.equal(B.graphicPoseDuration(g.poses.damage),32);for(let i=0;i<4;i++){const f=B.graphicFrame(g,768,1152,'damage',i*8);assert.equal(f.y,row*192);assert.equal(f.x,i*192);assert.notDeepEqual(f,B.graphicFrame(g,768,1152,'idle',i*8));}}
 assert.deepEqual(semantic(d['ActionSequences.json'][1].steps),semantic(d['ActionSequences.json'][2].steps));assert.equal(d['ActionSequences.json'][1].steps.filter(s=>s.type==='impact').length,1);
 for(const kind of ['actors','enemies'])for(const motion of ['input','ready','entry','wait','moving','guard','dead','attack']){const g={...s[kind][1].graphic,type:'static'};assert.equal(B.graphicFrame(g,768,768,motion,0).width,192,kind+' '+motion+' must not render the atlas');}
});
test('arquivos importados correspondem ao manifesto e preservam alpha nas spritesheets',()=>{
 const base=path.resolve('assets/jrpg-test/pack'),manifest=JSON.parse(fs.readFileSync(path.join(base,'manifest.json'),'utf8'));assert.equal(manifest.files.length,7);
 const {PNG}=require('../upstream/RPGReactor/editor/node_modules/pngjs');for(const entry of manifest.files){const bytes=fs.readFileSync(path.join(base,entry.path));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256);assert.equal(bytes.readUInt32BE(16),entry.width);if(entry.path.includes('characters/')||entry.path.includes('sv_actors/')){const image=PNG.sync.read(bytes);let clear=0,opaque=0;for(let i=3;i<image.data.length;i+=4){if(image.data[i]===0)clear++;if(image.data[i]===255)opaque++;}assert.ok(clear>0&&opaque>0);}}
});
