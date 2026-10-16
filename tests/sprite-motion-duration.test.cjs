'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=process.env.DIANA_BATTLE_SOURCE?path.resolve(process.env.DIANA_BATTLE_SOURCE):path.resolve('upstream/RPGReactor');
const B=require(path.join(base,'runtime/reactor_battle_data.js'));
let source=fs.readFileSync(path.join(base,'runtime/reactor_battle_presentation.js'),'utf8');
if(!process.env.DIANA_BATTLE_SOURCE){const patch=fs.readFileSync('patches/zzzzzzzzz-sprite-motion-duration.patch','utf8');const before=patch.split('\n').find(l=>l.startsWith('-        if(motion)')).slice(1),after=patch.split('\n').find(l=>l.startsWith('+        if(motion)')).slice(1);assert.ok(source.includes(before));source=source.replace(before,after);}
const method=source.slice(source.indexOf('    P.updateGraphicFrame ='),source.indexOf('    P.installGraphics ='));
for(const kind of ['actors','enemies'])test(`${kind}: dano usa duração da grade completa e retorna a idle no tick correto`,()=>{
 const P={spriteYaw:()=>0,battlerState:()=> 'idle',updatePoseSound:()=>{}};vm.runInNewContext(method,{P,B});
 const g={type:'static',spriteAnimation:{version:1,columns:6,rows:2,animations:{idle:{frames:[0],speed:8,loop:true},damage:{frames:[6,7,8,9,10,11],speed:8,loop:false}}},motions:{}};
 for(const legacy of [false,true]){
  if(legacy)g.poses={damage:{frames:[{x:0,y:192,width:192,height:192,duration:36}],loop:false}};
  const frames=[],sprite={_rrGraphicFrame:47,_rrGraphicMotion:{name:'damage',start:0},bitmap:{width:1152,height:384,isReady:()=>true},setFrame:(...args)=>frames.push(args)};
  sprite[kind==='actors'?'_actor':'_enemy']={};P.updateGraphicFrame(sprite,g);assert.equal(sprite._rrGraphicMotion.name,'damage');assert.deepEqual(frames.at(-1),[960,192,192,192]);
  sprite._rrGraphicFrame=48;P.updateGraphicFrame(sprite,g);assert.equal(sprite._rrGraphicMotion,null);assert.deepEqual(frames.at(-1),[0,0,192,192]);
 }
});
