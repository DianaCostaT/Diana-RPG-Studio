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
test('grid coordinates respect CSS scaling, custom cells append and bounds reject all authoring routes',async()=>{
 const h=await setup();h.number('Cell Width (pixels)',20);h.number('Cell Height (pixels)',25);
 let c=h.all().find(n=>n.tag==='canvas');h.pointer(c,45,60,'down');h.pointer(c,45,60,'up');assert.deepEqual(JSON.parse(JSON.stringify(h.saved.idle.frames.at(-1))),{x:40,y:50,width:20,height:25,duration:12});
 const count=h.saves;h.number('Width (pixels)',101);assert.equal(h.saves,count);assert.match(h.all().find(n=>n.attrs.role==='status').textContent,/inside/);
 h.number('Cell Width (pixels)',32);c=h.all().find(n=>n.tag==='canvas');h.pointer(c,99,99,'down');h.pointer(c,99,99,'up');assert.equal(h.saves,count);
 const json=h.all().find(n=>n.tag==='textarea');const invalid=initial();invalid.idle.frames[0].width=101;json.value=JSON.stringify(invalid);h.button('Apply JSON');assert.equal(h.saves,count);
 h.number('Cell Width (pixels)',0);assert.match(h.all().find(n=>n.attrs.role==='status').textContent,/positive integer/);h.editor.dispose();
});
test('free crop supports reverse drag, cancellation and zero-size/outside rejection',async()=>{
 const h=await setup();let mode=h.control('free-rectangle');mode.checked=true;mode.onchange();
 let c=h.all().find(n=>n.tag==='canvas');h.pointer(c,25,27,'down');h.pointer(c,5,7,'move');h.pointer(c,5,7,'up');assert.deepEqual(JSON.parse(JSON.stringify(h.saved.idle.frames.at(-1))),{x:5,y:7,width:20,height:20,duration:12});
 const count=h.saves;c=h.all().find(n=>n.tag==='canvas');h.pointer(c,5,7,'down');c.onpointercancel();h.pointer(c,25,27,'up');assert.equal(h.saves,count);
 h.pointer(c,5,7,'down');h.pointer(c,5,7,'up');assert.equal(h.saves,count);h.pointer(c,5,7,'down');h.pointer(c,101,27,'up');assert.equal(h.saves,count);h.editor.dispose();
});
test('60 Hz wall clock, pause, seek, reset and unequal frame durations never persist preview state',async()=>{
 const h=await setup(),before=JSON.stringify(h.saved);h.control('play').onclick();h.frame(1000);h.frame(1000+1000/60*2+.001);assert.equal(h.card.posePreview.tick,2);assert.equal(B.graphicFrame({type:'static',poses:h.saved},100,100,...h.preview.at(-1)).x,16);
 h.control('pause').onclick();assert.equal(h.queue.size,0);assert.equal(h.card.posePreview.playing,false);const t=h.control('timeline');t.value=4;t.oninput();assert.equal(h.card.posePreview.tick,4);h.control('reset').onclick();assert.equal(h.card.posePreview.tick,0);assert.equal(JSON.stringify(h.saved),before);assert.equal(h.saves,0);h.editor.dispose();
});
test('loop defaults repeat; false returns idle; once holds terminal crop',async()=>{
 const poses=initial();delete poses.idle.loop;const h=await setup(poses);h.control('play').onclick();h.frame(0);h.frame(1000);assert.equal(h.card.posePreview.playing,true);assert.equal(h.card.posePreview.tick,60);assert.equal(h.control('timeline').value,0);assert.equal(B.graphicFrame({type:'static',poses},100,100,...h.preview.at(-1)).x,0);
 h.select('wave');h.control('play').onclick();h.frame(0);h.frame(100);assert.equal(h.card.posePreview.playing,false);assert.deepEqual(h.preview.at(-1),['idle',3]);h.editor.dispose();
 poses.wave.loop='once';const once=await setup(poses);once.select('wave');once.control('play').onclick();once.frame(0);once.frame(100);assert.deepEqual(once.preview.at(-1),['wave',3]);assert.equal(once.queue.size,0);once.editor.dispose();
});
test('closed details, closed ancestor, hidden page, removed DOM and dispose cancel playback',async()=>{
 for(const reason of ['closed','ancestor','hidden','removed','dispose']){const h=await setup();h.control('play').onclick();h.frame(0);assert.equal(h.queue.size,1);
  if(reason==='closed'){h.card.open=false;h.card.ontoggle();}if(reason==='ancestor'){h.host.tag='details';h.host.open=false;h.observers[0].fn();}if(reason==='hidden'){h.document.hidden=true;h.listeners.get('visibilitychange')();}if(reason==='removed'){h.card.isConnected=false;h.observers[0].fn();}if(reason==='dispose')h.editor.dispose();assert.equal(h.queue.size,0,reason);assert.equal(h.card.posePreview.playing,false,reason);h.editor.dispose();assert.equal(h.listeners.size,0);}
});
test('stale asynchronous sheet loads cannot revive removed or disposed views',async()=>{
 for(const dispose of [false,true]){let resolve;const h=await setup(initial(),()=>new Promise(r=>resolve=r));if(dispose)h.editor.dispose();else {h.card.isConnected=false;h.observers[0].fn();}resolve({width:100,height:100});await Promise.resolve();await Promise.resolve();assert.equal(h.all().some(n=>n.tag==='canvas'),false);assert.equal(h.queue.size,0);assert.equal(h.saves,0);}
});
test('actors and enemies use same picker with cached asset promise and shared graphicFrame',()=>{
 assert.match(source,/if\(!\['actors','enemies'\]\.includes\(kind\)\)return;/);assert.match(source,/this\.rectanglePoseEditor\(optionsBody,g\.poses/);assert.match(source,/imageCache\.has\(url\)/);assert.match(source,/loadImage\(resolved\)\.then\(image/);
 for(const kind of ['actors','enemies']){const g=B.graphic({[kind]:{1:{graphic:{mode:'static',name:'Sheet',poses:initial()}}}},kind,1,{});assert.equal(B.graphicFrame(g,100,100,'idle',2).x,16);}
});
test('shared actor/enemy preview loads an image once, reads latest tick and ignores stale/disposed generations',async()=>{
 const cacheCode=source.slice(source.indexOf('const imageCache=new Map()'),source.indexOf('const cleanup=()=>{disposed=true;generation++'));
 const previewCode=source.slice(source.indexOf('const drawPreview=(resolved,token)=>'),source.indexOf('const drawOptions=(g,resolved)=>'));
 for(const kind of ['actors','enemies']){
  const images=[],draws=[];class Image{constructor(){images.push(this);this.width=100;this.height=100;}}
  const ctx=new Proxy({drawImage:(...args)=>draws.push(args)},{get:(t,k)=>t[k]||(()=>{})});const canvas=new Element('canvas');canvas.width=144;canvas.height=144;canvas.getContext=()=>ctx;
  const context={kind,Image,ReactorBattleData:B,RRAssetFiles:{urlFor:()=>'/sheet.png'},require,project:{path:'/project'},previewCanvas:canvas,nameTag:{},explicitPane:new Element('div'),console};
  const api=vm.runInNewContext(`const B=ReactorBattleData;let generation=1,previewTick=0,previewPose='idle',disposed=false;${cacheCode}${previewCode}\n({draw:drawPreview,tick:v=>previewTick=v,generation:v=>generation=v,dispose:()=>{disposed=true;for(const cancel of pendingImages)cancel();},pending:()=>pendingImages.size})`,context);
  const graphic={type:'static',name:'Sheet',folder:'enemies',poses:initial()};api.draw(graphic,1);api.tick(2);api.draw(graphic,1);assert.equal(images.length,1,kind);images[0].onload();await Promise.resolve();await Promise.resolve();assert.equal(draws.length,2);assert.equal(draws[0][1],16);assert.equal(draws[1][1],16);assert.equal(api.pending(),0);
  api.generation(2);api.draw(graphic,1);await Promise.resolve();assert.equal(draws.length,2);api.dispose();api.draw(graphic,2);await Promise.resolve();assert.equal(draws.length,2);
 }
});
