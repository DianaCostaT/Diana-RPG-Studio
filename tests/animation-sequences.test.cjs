const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=process.env.DIANA_BATTLE_SOURCE?path.resolve(process.env.DIANA_BATTLE_SOURCE):path.resolve(__dirname,'../upstream/RPGReactor');
const B=require(path.join(root,'editor/src/battle/BattleData.js'));
const source=fs.readFileSync(path.join(root,'editor/src/battle/BattlePresentationEditor.js'),'utf8');
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.style={};this.attrs={};this.isConnected=true;this.open=true;}
 get textContent(){return (this._text||'')+this.children.map(n=>n.textContent||'').join('');}set textContent(v){this._text=v;this.children=[];}
 append(...nodes){this.children.push(...nodes);for(const n of nodes)n.parentElement=this;}
 replaceChildren(...nodes){for(const n of this.children)n.isConnected=false;this.children=[];this.append(...nodes);}
 setAttribute(k,v){this.attrs[k]=v;}removeAttribute(k){delete this.attrs[k];}
 closest(){return this.tag==='details'?this:this.parentElement?.closest();}
 getBoundingClientRect(){return {left:0,top:0,width:this.width/2,height:this.height/2};}
 getContext(){return new Proxy({},{get:()=>()=>{}});}
}
const initial=()=>({idle:{loop:true,frames:[{x:0,y:0,width:16,height:16,duration:2},{x:16,y:0,width:16,height:16,duration:3}]},wave:{loop:false,frames:[{x:32,y:0,width:16,height:16,duration:3}]}});
async function setup(poses=initial(),loader=()=>Promise.resolve({width:100,height:100})){
 const queue=new Map(),listeners=new Map(),observers=[];let id=0,saves=0,saved=poses,preview=[];
 const document={hidden:false,body:{},createElement:t=>new Element(t),createTextNode:t=>{const n=new Element('#text');n.textContent=t;return n;},addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k)};
 class Observer{constructor(fn){this.fn=fn;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}
 const C=vm.runInNewContext(source+'\nBattlePresentationEditor',{ReactorBattleData:B,document,MutationObserver:Observer,requestAnimationFrame:fn=>{queue.set(++id,fn);return id;},cancelAnimationFrame:i=>queue.delete(i)});
 const editor=new C({databaseManager:{}});editor.text=v=>typeof v==='object'?v.source:v;
 const host=new Element('div'),card=editor.rectanglePoseEditor(host,poses,v=>{saves++;saved=v;},(...v)=>preview.push(v),loader);
 await Promise.resolve();await Promise.resolve();
 const all=(n=host)=>[n,...n.children.flatMap(c=>all(c))];
 const control=id=>all().find(n=>n.attrs['data-pose-control']===id);
 const button=label=>all().find(n=>n.tag==='button'&&n.textContent===label).onclick();
 const number=(label,v)=>{const n=all().find(n=>n.tag==='label'&&n.children[0]?.textContent===label).children[1];n.valueAsNumber=v;n.onchange();};
 const pointer=(canvas,x,y,type)=>canvas['onpointer'+type]({button:0,clientX:x/2,clientY:y/2,pointerId:1,preventDefault(){}});
 return {editor,card,host,all,control,button,number,pointer,document,listeners,observers,queue,get saved(){return saved;},get saves(){return saves;},get preview(){return preview;},frame(now){const tasks=[...queue.values()];queue.clear();for(const fn of tasks)fn(now);},select(name){const n=all().find(n=>n.tag==='label'&&n.children[0]?.textContent==='Pose').children[1];n.value=name;n.onchange();}};
}

for(const kind of ['actors','enemies'])test(kind+': referenced poses reject rename/remove and JSON, without mutating shared consumers',async()=>{
 const h=await setup();const sequence={id:1,name:'Shared',steps:[{id:'held',type:'pose',motion:'wave'},{id:'motion',type:'motion',motion:'idle'}]};
 h.editor.db.data={actionSequences:[null,sequence],battlePresentation:{[kind]:{1:{graphic:{motions:{attack:{pose:'wave'}}}}}}};
 const before=JSON.stringify(h.editor.db.data);h.select('wave');h.button('Remove Pose');assert.equal(h.saves,0);
 const rename=h.all().find(n=>n.attrs['aria-label']==='Pose Name');rename.value='renamed';h.button('Rename Pose');assert.equal(h.saves,0);
 const json=h.all().find(n=>n.tag==='textarea');json.value=JSON.stringify({idle:initial().idle});h.button('Apply JSON');assert.equal(h.saves,0);assert.equal(JSON.stringify(h.editor.db.data),before);
 assert.match(h.all().find(n=>n.attrs.role==='status').textContent,/Pose is referenced/);
 sequence.steps=[];h.editor.db.data.battlePresentation[kind][1].graphic.motions={};h.button('Remove Pose');assert.equal(h.saves,1);assert.equal(h.saved.wave,undefined);h.editor.dispose();
});
test('default and nested graphic mappings participate in reference protection',async()=>{const h=await setup();h.editor.db.data={battlePresentation:{defaults:{graphic:{motions:{attack:{pose:'wave'}}}},actors:{1:{unarmed:{graphic:{motions:{skill:{pose:'wave'}}}}}}}};assert.equal(h.editor.poseReferences(['wave']).length,2);h.editor.dispose();});
for(const file of ['editor/src/battle/BattleData.js','runtime/reactor_battle_data.js',...(process.env.DIANA_BATTLE_SOURCE?[]:['template/Demo/js/reactor_battle_data.js'])])for(const kind of ['actors','enemies'])test(file+' '+kind+': travel, jump, recoil, impact, sound and effects overlap and settle',()=>{
 const D=require(path.join(root,file)),direction=kind==='actors'?1:-1,home=direction===1?2:10,target=direction===1?10:2;
 const context={homes:{user:{x:home,y:4,z:0},target:{x:target,y:4,z:0},target0:{x:target,y:4,z:0}},target:{x:target,y:4,z:0},direction};
 const steps=[D.step('jump',{height:2,duration:20,concurrent:true}),D.step('move',{anchor:'home',x:4,easing:'linear',duration:20}),D.step('sound',{audio:{name:'hit',volume:90,pitch:100,pan:0},duration:0}),D.step('animation',{role:'allTargets',animationId:1,duration:10,concurrent:true}),D.step('flash',{red:255,green:0,blue:0,alpha:128,duration:10,concurrent:true}),D.step('impact',{role:'allTargets'}),D.step('move',{role:'target',anchor:'home',x:1,duration:10}),D.step('move',{anchor:'home',x:0,duration:10})];
 const sequence={version:1,purpose:'action',steps};assert.deepEqual(D.validateSequence(sequence),[]);
 const cues=D.timeline(sequence,context);assert.deepEqual(cues.slice(0,2).map(c=>c.start),[0,0]);assert.equal(cues[2].start,20);assert.equal(cues[5].start,20);assert.equal(D.duration(sequence,context),40);
 const middle=D.previewVisuals(sequence,10,context);assert.equal(middle.poses.user.x,home+2*direction);assert.equal(middle.poses.user.z,2);
 const hit=D.previewVisuals(sequence,25,context);assert.ok(hit.flash);assert.equal(hit.poses.user.z,0);assert.equal(D.previewVisuals(sequence,40,context).poses.user.x,home);
 const events=[],player=new D.Player(sequence,{context,cue:(step,at)=>events.push([step.type,at]),pose:()=>{}});for(let i=0;i<50;i++)player.update();assert.equal(player.done,true);assert.deepEqual(events.filter(e=>e[0]==='impact'),[['impact',20]]);assert.deepEqual(events.filter(e=>e[0]==='sound'),[['sound',20]]);
});
test('Concurrent checkbox uses the undoable edit path and restores sequential timing',()=>{
 const source=fs.readFileSync(path.join(root,'editor/src/database/DatabaseActionSequenceEditor.js'),'utf8');const code=source.slice(source.indexOf('{const concurrent=U.element'),source.indexOf('// Changing a step',source.indexOf('{const concurrent=U.element')));
 const step={duration:12},input={dataset:{}},changes=[];vm.runInNewContext(code,{step,U:{element:()=>input,field:()=>({title:''}),text:s=>s},change:(key,value)=>{changes.push([key,value]);step[key]=value;}});input.checked=true;input.onchange();assert.equal(B.stepAdvance(step),0);input.checked=false;input.onchange();assert.equal(B.stepAdvance(step),12);assert.equal(changes.length,2);assert.match(source,/const change=.*this.edit/);
});

test('sequence labels load in the existing Portuguese catalog without encoding loss',()=>{
 const catalog=vm.runInNewContext(fs.readFileSync(path.join(root,'editor/src/I18nReviewedTranslations.js'),'utf8')+'\nRR_REVIEWED_TRANSLATIONS.text');
 assert.equal(catalog.pt.Concurrent,'Simult\u00e2neo');
 assert.match(catalog.pt['Pose is referenced. Edit sequences and motion mappings before renaming or removing: {references}'],/refer\u00eancias/);
});
