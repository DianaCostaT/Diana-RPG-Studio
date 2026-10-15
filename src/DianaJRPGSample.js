/* Opt-in illustrated sample. Reuses map, events and battle contracts of the editor. */
(function(root){
 'use strict';
 function walkable(x,y){return x>=17&&x<=19&&y>=9&&y<=31||x>=11&&x<=24&&y>=12&&y<=20||x>=0&&x<=12&&y>=14&&y<=15||x>=8&&x<=11&&y>=9&&y<=15||x>=16&&x<=19&&y>=5&&y<=11;}
 function populate(data,B){
  const system=data['System.json'];Object.assign(system,{gameTitle:'Vila da Clareira',tileSize:32,startMapId:1,startX:18,startY:24,optSideView:true});
  Object.assign(data['Actors.json'][1],{name:'Liora',nickname:'Viajante da Clareira',profile:'Uma viajante que escuta as histórias da floresta.',characterName:'$Liora',faceName:'ClareiraRostos',faceIndex:0});
  Object.assign(data['Enemies.json'][1],{name:'Guardião de Musgo',params:[180,0,8,10,8,8,8,8],exp:20});
  Object.assign(data['Troops.json'][1],{name:'Guardião da Clareira',members:[{enemyId:1,x:250,y:380,hidden:false}]});
  const map=data['Map001.json'];Object.assign(map,{width:32,height:32,displayName:'Vila da Clareira',parallaxName:'!VilaClareira',parallaxShow:true,parallaxLoopX:false,parallaxLoopY:false,battleback1Name:'BosqueClareira',battleback2Name:'',specifyBattleback:true});
  map.data=Array(32*32*6).fill(0);for(let y=0;y<32;y++)for(let x=0;x<32;x++)map.data[y*32+x]=walkable(x,y)?1:2;
  const npc=map.events[1];Object.assign(npc,{name:'Guardião da Clareira',x:18,y:25});const page=npc.pages[0];page.image.characterName='$Guardiao';page.image.direction=8;page.directionFix=true;
  page.list=[{code:101,indent:0,parameters:['ClareiraRostos',5,0,2]},{code:401,indent:0,parameters:['Bem-vinda, Liora.']},{code:401,indent:0,parameters:['A floresta guarda muitas histórias.']},{code:401,indent:0,parameters:['Vamos treinar suas novas poses?']},{code:301,indent:0,parameters:[0,1,true,true]},{code:0,indent:0,parameters:[]}];
  data['MapInfos.json'][1].name='Vila da Clareira';
  const tiles=data['Tilesets.json'][1];tiles.name='Clareira — colisão sobre parallax';tiles.tilesetNames=Array(9).fill('');tiles.tilesetNames[5]='ClareiraColisao';tiles.flags[1]=0;tiles.flags[2]=15;
  const settings=data['BattlePresentation.json'];settings.startMessages=false;settings.screen2d={actorHomes:{0:{x:580,y:400}}};
  const pose=row=>({loop:true,anchor:{x:.5,y:1},frames:Array.from({length:4},(_,i)=>({x:i*192,y:row*192,width:192,height:192,duration:10}))});
  const sequences=[null];
  for(const [kind,offset,id] of [['actors',0,1],['enemies',2,2]]){
   const idle=pose(offset),attack=pose(offset+1),damage=pose(kind==='actors'?4:5);attack.loop=false;attack.frames.forEach((f,i)=>f.duration=[8,6,6,12][i]);damage.loop=false;damage.frames.forEach(f=>f.duration=8);
   const motions=Object.fromEntries([...new Set([...Object.keys(B.spriteMotions),...B.battlerStates.map(([name])=>name)])].map(name=>[name,{pose:['attack','punch','swing','thrust','missile','skill','item','cast','spell'].includes(name)?'attack':'idle'}]));
   motions.damage={pose:'damage'};
   settings[kind][1]={mode:'sequence',sequenceId:id,graphic:{mode:'static',name:'ClareiraCombate',folder:'sv_actors',scale:1,poses:{idle,attack,damage},motions}};
   sequences.push({id,version:1,name:kind==='actors'?'Liora — corte da clareira':'Guardião — golpe de musgo',phases:B.phaseIds(),steps:[
    B.step('motion',{motion:'idle',duration:8,phase:'prepare'}),
    B.step('motion',{motion:'attack',duration:32,concurrent:true,phase:'execute'}),
    B.step('move',{anchor:'approach',x:-2.2,duration:14,face:'target',phase:'execute'}),
    B.step('impact',{role:'allTargets',phase:'execute'}),B.step('wait',{duration:18,phase:'execute'}),
    B.step('move',{anchor:'home',duration:20,phase:'return'}),B.step('motion',{motion:'idle',duration:0,phase:'finish'})]});
  }
  data['ActionSequences.json']=sequences;return data;
 }
 function installProject(manager,target){
  const fs=manager.fs,path=manager.path,pack=path.join(manager.getRuntimePath(),'..','editor','diana-assets','jrpg-test');
  const files=['System.json','Actors.json','Enemies.json','Troops.json','Map001.json','MapInfos.json','Tilesets.json','BattlePresentation.json'];const data={};
  for(const name of files)data[name]=JSON.parse(fs.readFileSync(path.join(target,'data',name),'utf8'));
  populate(data,root.ReactorBattleData);
  for(const [name,value] of Object.entries(data))manager._writeFileAtomic(fs,path.join(target,'data',name),JSON.stringify(value,null,2),'utf8');
  for(const folder of fs.readdirSync(path.join(pack,'img'))){const dest=path.join(target,'img',folder);fs.mkdirSync(dest,{recursive:true});for(const name of fs.readdirSync(path.join(pack,'img',folder)))fs.copyFileSync(path.join(pack,'img',folder,name),path.join(dest,name));}
  fs.copyFileSync(path.join(pack,'manifest.json'),path.join(target,'diana-asset-pack.json'));
  fs.copyFileSync(path.join(pack,'LICENSE'),path.join(target,'ASSET_LICENSE.txt'));
 }
 function install(){
  const dialog=UIManager.prototype.showNewProjectDialog;
  UIManager.prototype.showNewProjectDialog=function(options){const result=dialog.call(this,options),body=document.querySelector('#rr-new-project-dialog .rr-modal-body');if(!body)return result;
   const row=document.createElement('label');row.className='diana-sample-choice';const check=document.createElement('input');check.type='checkbox';check.checked=true;check.id='diana-jrpg-sample';const text=document.createElement('span');text.textContent='Usar Vila da Clareira — mapa ilustrado, personagens, rostos e combate animado';row.append(check,text);body.append(row);return result.then(choice=>choice?{...choice,dianaSample:check.checked}:null);
  };
 }
 root.DianaJRPGSample={populate,walkable,installProject};if(typeof module!=='undefined')module.exports=root.DianaJRPGSample;
 if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',install);
})(globalThis);
