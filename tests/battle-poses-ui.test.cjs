'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

test('Animações 2 organiza aliados, inimigos, lista de poses e animações como uma folha de batalha',()=>{
 const B=require('../upstream/RPGReactor/editor/src/battle/BattleData.js');
 B.motionGraphic ||= graphic=>graphic;
 class Element{
  constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.style={};this.attrs={};this.className='';this.value='';this.disabled=false;this.isConnected=true;}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  setAttribute(key,value){this.attrs[key]=String(value);}
  getAttribute(key){return this.attrs[key]??null;}
  get textContent(){return (this._text||'')+this.children.map(child=>child.textContent||'').join('');}
  set textContent(value){this._text=String(value);this.children=[];}
  getContext(){return {clearRect(){},fillRect(){},strokeRect(){},beginPath(){},ellipse(){},fill(){},drawImage(){},fillText(){},createLinearGradient(){return {addColorStop(){}};}};}
  getBoundingClientRect(){return {left:0,top:0,width:this.width||1000,height:this.height||740};}
  setPointerCapture(){}
 }
 const document={hidden:false,createElement:tag=>new Element(tag),addEventListener(){},removeEventListener(){}};
 const window={};
 const context={document,window,ReactorBattleData:B,require,RRAssetFiles:{AUDIO_EXTENSIONS:[],listNames:()=>[],urlFor:()=>''},
  requestAnimationFrame:()=>1,cancelAnimationFrame(){},Image:class{},Map,Set,Promise,JSON,Math,Number,String,Object,Array,Error};
 vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../src/DianaBattle2D.js'),'utf8'),context);
 const ui=context.DianaBattle2D, presentation={rectanglePoseEditor(){}};
 const actors=[null,{id:1,name:'Liora'}],enemies=[null,{id:1,name:'Guardião'}];
 const db={data:{actors,enemies,armors:[],troops:[null,{id:1,name:'Treino da Clareira',members:[{enemyId:1,x:260,y:300,hidden:false}]}],system:{optSideView:true,battleSystem:0,partyMembers:[1],terms:{commands:['Lutar','Fugir','Atacar','Defender','Item']}},battlePresentation:{version:1,screen2d:{actorHomes:{0:{x:430,y:400}}},actors:{1:{graphic:{mode:'static',name:'Hero',folder:'sv_actors',poses:{idle:{loop:true,frames:[{x:0,y:0,width:48,height:64,duration:8}]}}}}},enemies:{1:{graphic:{mode:'static',name:'Guard',folder:'enemies'}}}}},mutationGeneration:0};
 const parent={databaseManager:db,battlePresentationEditor:presentation,currentProject:{path:'C:\\Project'},updateStatus(){},openDatabase(){}};
 const host=new Element('div');host.getBoundingClientRect=()=>({top:0,bottom:800,left:0,right:1200});
 const view=new ui.Battle2D(parent,host);view.image=async()=>null;view.poses();
 const all=(node=host)=>[node,...node.children.flatMap(child=>all(child))];
 assert.ok(all().some(node=>node.className==='diana-pose-record-rail'));
 assert.ok(all().some(node=>node.className==='diana-pose-list'));
 assert.ok(all().some(node=>node.attrs['aria-label']==='Poses disponíveis'));
 assert.ok(all().some(node=>node.className==='diana-pose-row'&&node.dataset.poseName==='idle'&&node.textContent.includes('01')));
 assert.ok(all().some(node=>node.className==='diana-pose-selected-info'));
 assert.ok(all().some(node=>node.className==='diana-maker-button'&&node.textContent==='Editar quadros e recorte'));
 const enemyTab=all().find(node=>node.tag==='button'&&node.dataset.kind==='enemies');assert.ok(enemyTab);enemyTab.onclick();
 assert.ok(all().some(node=>node.className==='diana-pose-record'&&node.textContent.includes('Guardião')));
 const animations=all().find(node=>node.tag==='button'&&node.dataset.section==='animations');assert.ok(animations);animations.onclick();
 assert.ok(all().some(node=>node.className==='diana-pose-animation-panel'));
 assert.ok(all().some(node=>node.textContent==='Editar grade de animação…'));
 view.image=async graphic=>graphic.folder==='battlebacks1'?{width:1000,height:740}:null;view.screen();
 const sceneCanvas=all().find(node=>node.className==='diana-battle-composition');assert.ok(sceneCanvas);assert.equal(sceneCanvas.width,1000);assert.ok(sceneCanvas.attrs['aria-label'].includes('heróis'));
 sceneCanvas.onpointerdown({clientX:528,clientY:474,pointerId:1});sceneCanvas.onpointermove({clientX:734,clientY:533,pointerId:1});sceneCanvas.onpointerup();
 assert.equal(db.data.battlePresentation.screen2d.actorHomes[0].x,599);assert.equal(db.data.battlePresentation.screen2d.actorHomes[0].y,449);
 assert.equal(db.mutationGeneration,1);
 view.dispose();
});
