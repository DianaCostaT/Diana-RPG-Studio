const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=process.env.DIANA_BATTLE_SOURCE?path.resolve(process.env.DIANA_BATTLE_SOURCE):path.resolve(__dirname,'../upstream/RPGReactor');
assert.ok(fs.existsSync(path.join(root,'editor/src/battle/BattleData.js')),'battle source exists');
const fixture=()=>({type:'static',poses:{idle:{loop:true,anchor:{x:.25,y:1},frames:[{x:3,y:5,width:17,height:29,duration:2},{x:40,y:7,width:23,height:31,duration:5,anchor:{x:0,y:.75}}]},salute:{loop:false,frames:[{x:60,y:0,width:20,height:35,duration:4},{x:80,y:2,width:18,height:33,duration:2}]}}});
for(const file of ['editor/src/battle/BattleData.js','runtime/reactor_battle_data.js',...(process.env.DIANA_BATTLE_SOURCE?[]:['template/Demo/js/reactor_battle_data.js'])]){
 const B=require(path.join(root,file));
 test(file+': arbitrary crops, boundaries, unequal durations, loops and anchors',()=>{
  const g=fixture(),frame=t=>B.graphicFrame(g,120,80,'idle',t);
  assert.deepEqual(frame(0),{x:3,y:5,width:17,height:29,anchor:{x:.25,y:1}});
  assert.equal(frame(1).x,3);assert.equal(frame(2).x,40);assert.equal(frame(6).x,40);assert.equal(frame(7).x,3);
  assert.deepEqual(frame(2).anchor,{x:0,y:.75});assert.equal(frame(-1).x,3);
  for(const loop of [false,'once']){g.poses.idle.loop=loop;assert.equal(frame(700).x,40);}
  assert.equal(B.graphicFrame(g,120,80,'salute',4).x,80);
  assert.equal(B.graphicFrame(g,120,80,'salute',999,90,0).x,60);
  assert.equal(B.graphicFrame(g,120,80,'salute',0,90,99).x,80);
  g.motions={attack:{pose:'salute'}};assert.equal(B.graphicFrame(g,120,80,'attack',4).x,80);
 });
 test(file+': validation and legacy fallback preserve static, SV, character and held sheets',()=>{
  assert.deepEqual(B.validateGraphicPoses(fixture().poses),[]);
  for(const bad of [null,[],{a:{frames:[]}},{a:{frames:[{x:-1,y:0,width:1,height:1,duration:1}]}},{a:{anchor:{x:2,y:0},frames:[{x:0,y:0,width:1,height:1,duration:1}]}},{a:{loop:'bad',frames:[{x:0,y:0,width:1,height:1,duration:0}]}}])assert.ok(B.validateGraphicPoses(bad).length);
  assert.deepEqual(B.graphicFrame({type:'static'},120,80),{x:0,y:0,width:120,height:80});
  const g=fixture();g.poses.idle.frames[0].width=999;assert.equal(B.graphicFrame(g,120,80).width,120);
  const sheet={type:'character',name:'$Original',frames:3,speed:12,motions:{walk:{speed:5,loop:true}}};
  assert.equal(B.graphicFrame(sheet,90,160,'walk',15,90).x,30);
  assert.equal(B.graphicFrame(sheet,90,160,'walk',999,90,2).x,60);
  assert.deepEqual(B.graphicFrame({type:'sv'},270,360,'idle',0),{x:0,y:60,width:30,height:60});
 });
}
for(const dir of ['runtime',...(process.env.DIANA_BATTLE_SOURCE?[]:['template/Demo/js'])]){
 const B=require(path.join(root,dir,'reactor_battle_data.js')),context={ReactorBattleData:B,DataManager:{isDatabaseLoaded:()=>true}};
 vm.runInNewContext(fs.readFileSync(path.join(root,dir,'reactor_battle_presentation.js'),'utf8'),context);
 for(const kind of ['actors','enemies'])test(dir+': '+kind+' use persisted graphic config and runtime timing, held frames, anchors and fallback',()=>{
  const settings={[kind]:{1:{graphic:{...fixture(),mode:'static',name:'Original'}}}},g=B.graphic(settings,kind,1,{});
  const P=context.ReactorBattlePresentation;let actual;const anchor={x:.5,y:1,set(x,y){this.x=x;this.y=y;}};
  const main={anchor,bitmap:{width:120,height:80,isReady:()=>true},setFrame(...v){actual=v;}};
  const sprite={['_'+(kind==='actors'?'actor':'enemy')]:{},_rrGraphicFrame:2,_reactorRoomPosition:{facing:90},...main};
  P.updateGraphicFrame(sprite,g);assert.deepEqual(actual,[40,7,23,31]);assert.equal(anchor.x,0);assert.equal(anchor.y,.75);
  sprite._rrHeldPose={motion:'idle',frame:0};P.updateGraphicFrame(sprite,g);assert.deepEqual(actual,[3,5,17,29]);
  sprite._rrHeldPose=null;sprite._rrGraphicMotion={name:'salute',start:0};sprite._rrGraphicFrame=4;P.updateGraphicFrame(sprite,g);assert.deepEqual(actual,[80,2,18,33]);
  sprite._rrGraphicFrame=6;P.updateGraphicFrame(sprite,g);assert.equal(sprite._rrGraphicMotion,null);assert.deepEqual(actual,[40,7,23,31]);
  g.poses.salute.loop='once';sprite._rrGraphicMotion={name:'salute',start:0};sprite._rrGraphicFrame=99;P.updateGraphicFrame(sprite,g);assert.equal(sprite._rrGraphicMotion.name,'salute');assert.deepEqual(actual,[80,2,18,33]);
  delete g.poses;P.updateGraphicFrame(sprite,g);assert.deepEqual(actual,[0,0,120,80]);assert.equal(anchor.x,.5);assert.equal(anchor.y,1);
 });
 test(dir+': shared room billboard applies and resets anchor geometry',()=>{
  const translations=[];class Plane{dispose(){} translate(...v){translations.push(v);}}
  const ctx={THREE:{PlaneGeometry:Plane}};vm.runInNewContext(fs.readFileSync(path.join(root,dir,'reactor_battle_room.js'),'utf8'),ctx);
  const room=new ctx.ReactorBattleRoomView({}, {}, {}, {}),object={visible:true,geometry:new Plane(),scale:{set(){}},quaternion:{copy(){}},rotateZ(){}};
  room.billboards.set('actor:0',{object,canvas:{width:17,height:29,getContext:()=>({clearRect(){},drawImage(){}})},texture:{}});room.camera={quaternion:{}};room.place=()=>{};
  room.billboard('actor:0',{}, {x:3,y:5,width:17,height:29,anchor:{x:.25,y:.75}}, {},1);
  assert.deepEqual(translations.pop(),[.25,-.25,0]);room.billboard('actor:0',{}, {x:3,y:5,width:17,height:29}, {},1);assert.deepEqual(translations.pop(),[0,0,0]);
 });
}

test('visual pose form creates, renames, reorders, edits, previews and removes saved poses without JSON',()=>{
 const B=require(path.join(root,'editor/src/battle/BattleData.js'));
 class Element{
  constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.style={};this.attrs={};}
  get textContent(){return (this._text||'')+this.children.map(n=>n.textContent||'').join('');}
  set textContent(value){this._text=value;this.children=[];}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  setAttribute(k,v){this.attrs[k]=v;}
  removeAttribute(k){delete this.attrs[k];}
 }
 const C=vm.runInNewContext(fs.readFileSync(path.join(root,'editor/src/battle/BattlePresentationEditor.js'),'utf8')+'\nBattlePresentationEditor',{ReactorBattleData:B,document:{createElement:tag=>new Element(tag),createTextNode:text=>{const node=new Element('#text');node.textContent=text;return node;}}});
 const editor=new C({databaseManager:{}});editor.text=value=>typeof value==='object'?value.source:value;
 const host=new Element('div');let saved={},preview;
 editor.rectanglePoseEditor(host,{},value=>{saved=JSON.parse(JSON.stringify(value));},(...args)=>{preview=args;});
 const all=(node=host)=>[node,...node.children.flatMap(n=>all(n))];
 const button=label=>{const b=all().find(n=>n.tag==='button'&&n.textContent===label);assert.ok(b,label);assert.ok(!b.disabled,label+' enabled');b.onclick();};
 const input=label=>{const i=all().find(n=>n.attrs['aria-label']===label);assert.ok(i,label);return i;};
 const number=(label,value)=>{const row=all().find(n=>n.tag==='label'&&n.children[0]?.textContent===label);assert.ok(row,label);row.children[1].valueAsNumber=value;row.children[1].onchange();};
 input('New Pose Name').value='salute';button('Create Pose');assert.equal(saved.salute.frames.length,1);
 input('Pose Name').value='greet';button('Rename Pose');assert.ok(saved.greet);assert.equal(saved.salute,undefined);
 number('Width (pixels)',23);number('Duration (frames)',5);number('Anchor X',.25);assert.equal(saved.greet.frames[0].width,23);assert.equal(saved.greet.frames[0].duration,5);assert.equal(saved.greet.anchor.x,.25);
 button('Add Frame');assert.equal(saved.greet.frames.length,2);number('X (pixels)',7);button('Move Frame Down');assert.equal(saved.greet.frames[1].x,7);
 number('Duration (frames)',0);assert.equal(saved.greet.frames[0].duration,5);assert.match(all().find(n=>n.attrs.role==='status').textContent,/positive/);
 const playback=all().find(n=>n.tag==='label'&&n.children[0]?.textContent==='Playback').children[1];playback.value='hold';playback.onchange();assert.equal(saved.greet.loop,'once');button('Preview Pose');assert.deepEqual(preview,['greet',0]);button('Remove Frame');assert.equal(saved.greet.frames.length,1);button('Remove Pose');assert.deepEqual(saved,{});
});
