/* Editable native RTP expansion: catalog, followers, and native vehicles. */
(function(root){
 'use strict';
 const ASSET_ROOT='diana-vehicles';
 const vehicleSpecs=[
  ['boat','Bote do Rio','$DianaBoat',2,20],
  ['ship','Navio do Vale','$DianaShip',5,21],
  ['airship','Aeronave da Clareira','$DianaAirship',6,22]
 ];
 const catalog=[
  {id:'hero-liora',kind:'hero',label:'Liora',asset:'img/characters/$Liora.png',database:{table:'Actors',id:1}},
  {id:'hero-brann',kind:'hero',label:'Brann',asset:'img/characters/$Brann.png',database:{table:'Actors',id:2}},
  {id:'npc-mira',kind:'npc',label:'Mira',asset:'img/characters/$Mira.png',database:{table:'Map001.events',id:6}},
  {id:'npc-orin',kind:'npc',label:'Orin',asset:'img/characters/$Orin.png',database:{table:'Map001.events',id:7}},
  {id:'npc-nila',kind:'npc',label:'Nila',asset:'img/characters/$Nila.png',database:{table:'Map001.events',id:8}},
  {id:'npc-ivo',kind:'npc',label:'Ivo',asset:'img/characters/$Ivo.png',database:{table:'Map001.events',id:10}},
  {id:'npc-guardiao',kind:'npc',label:'Guardião da Clareira',asset:'img/characters/$Guardiao.png',database:{table:'Map001.events',id:1}},
  {id:'enemy-lobo',kind:'enemy',label:'Lobo Cinzento',asset:'img/enemies/LoboCinza.png',database:{table:'Enemies',id:2}},
  {id:'enemy-musgo',kind:'enemy',label:'Musgo Vivo',asset:'img/enemies/MusgoVivo.png',database:{table:'Enemies',id:3}},
  {id:'enemy-bruxa',kind:'enemy',label:'Bruxa Cinzenta',asset:'img/enemies/BruxaCinza.png',database:{table:'Enemies',id:4}},
  {id:'map-vila',kind:'map',label:'Vila da Clareira',asset:'img/tilesets/ClareiraTerrenos.png',database:{table:'MapInfos',id:1}},
  {id:'map-rota',kind:'map',label:'Rota de navegação',asset:'img/tilesets/ClareiraTerrenos.png',database:{table:'MapInfos',id:2}},
  {id:'map-arena',kind:'map',label:'Arena de animação e batalha',asset:'img/tilesets/ClareiraObjetos.png',database:{table:'MapInfos',id:3}},
  {id:'map-hospedaria',kind:'map',label:'Hospedaria da Lanterna',asset:'img/tilesets/ClareiraInteriores.png',database:{table:'MapInfos',id:4}},
  {id:'map-casa',kind:'map',label:'Casa do Jardineiro',asset:'img/tilesets/ClareiraInteriores.png',database:{table:'MapInfos',id:5}},
  {id:'background-bosque',kind:'background',label:'Bosque da Clareira',asset:'img/battlebacks1/BosqueClareira.png',database:{table:'Map001',id:1}},
  ...[[1,'Corte'],[2,'Impacto'],[3,'Fogo'],[4,'Agua'],[5,'Gelo'],[6,'Raio'],[7,'Arcano']].map(([id,name])=>({id:'effect-'+name.toLowerCase(),kind:'effect',label:'Efeito '+name,asset:'img/animations/Efeito'+name+'.png',database:{table:'Animations',id}})),
  ...vehicleSpecs.map(([id,label,file])=>({id:'vehicle-'+id,kind:'vehicle',label,asset:'img/characters/'+file+'.png',database:{table:'System',id}}))
 ];
 function command(code,parameters){return {code,indent:0,parameters};}
 function followerControls(){
  return {
   id:'followers',label:'Seguidores',description:'Exibir aliados atrás do herói ou recolhê-los no herói.',
   valuePath:'System.optFollowers',defaultValue:true,
   choices:[
    {value:true,label:'Visíveis e seguindo o herói',command:{type:'native-followers',action:'show'}},
    {value:false,label:'Recolhidos no herói',command:{type:'native-followers',action:'hide-and-gather'}}
   ],
   nativeCommands:{show:[command(216,[0])],hideAndGather:[command(216,[1]),command(217,[])]}
  };
 }
 function paintVehicleStarts(data){
  const map=data['Map001.json'],tiles=data['Tilesets.json']?.[1];if(!map||!Array.isArray(map.data))return;
  const width=map.width,ground=1536,water=1538,offset=map.dianaVillageOffset||{x:0,y:0},set=(x,y,tile)=>{x+=offset.x;y+=offset.y;if(x>=0&&x<width&&y>=0&&y<map.height)map.data[y*width+x]=tile;};
  for(let y=20;y<=21;y++)for(let x=2;x<=5;x++)set(x,y,water);
  set(6,22,ground);
  // Native passage bits are prohibitions: 0x200 boat, 0x400 ship, 0x800 landing.
  if(tiles?.flags)for(let id=0;id<tiles.flags.length;id++){
   const flag=tiles.flags[id]||0,isWater=id===water||id>=1560&&id<1576;
   tiles.flags[id]=isWater?(flag&~0x0600)|0x0800:flag|0x0600|(flag&15?0x0800:0);
  }
 }
 function populate(data){
  const system=data['System.json'];if(!system)return data;
  system.optFollowers=system.optFollowers!==false;
  const offset=data['Map001.json']?.dianaVillageOffset||{x:0,y:0};
  for(const [id,,characterName,startX,startY] of vehicleSpecs){
   const previous=system[id]||{};
   system[id]={...previous,characterName,characterIndex:0,startMapId:1,startX:startX+offset.x,startY:startY+offset.y,bgm:previous.bgm||{name:'',pan:0,pitch:100,volume:90}};
  }
  system.dianaEditorControls={...(system.dianaEditorControls||{}),followers:followerControls()};
  system.dianaRtpCatalog={version:1,assetRoot:ASSET_ROOT,entries:catalog};
  paintVehicleStarts(data);return data;
 }
 function completeStarter(data){return populate(data);}
 function mountEditor(host,{system,onChange,openDatabase,projectPath}={}){
  const make=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
  const box=make('fieldset');box.className='diana-screen-group';box.append(make('legend','Grupo no mapa'));
  const label=make('label','Seguidores: '),picker=make('select');picker.className='database-field-value';picker.setAttribute('aria-label','Seguidores no mapa');
  for(const [value,text] of [['show','Visíveis, seguindo o herói'],['gather','Todos recolhidos no herói']]){const option=make('option',text);option.value=value;picker.append(option);}
  picker.value=system.optFollowers===false?'gather':'show';picker.onchange=()=>{system.optFollowers=picker.value==='show';onChange?.();};label.append(picker);box.append(label);host.append(box);
  const library=make('details');library.className='diana-screen-group';library.append(make('summary','RTP — biblioteca de exemplos'));
  const grid=make('div');grid.className='diana-rtp-library';
  for(const entry of catalog){const card=make('button');card.type='button';card.title=entry.label;card.className='rr-btn-secondary';
   if(projectPath){const fs=require('fs'),path=require('path'),file=path.join(projectPath,entry.asset);if(fs.existsSync(file)){const img=make('img');img.src=RRAssetFiles.toUrl(file);img.alt='';img.width=96;img.height=64;img.style.objectFit='contain';img.style.imageRendering='pixelated';card.append(img);}}
   card.append(make('span',entry.label));const table={hero:'actors',npc:'actors',enemy:'enemies',map:'tilesets',background:'troops',effect:'animations',vehicle:'system'}[entry.kind];card.onclick=()=>openDatabase?.(table);grid.append(card);
  }library.append(grid);host.append(library);return {picker};
 }
 root.DianaRTPExpansion={catalog,followerControls,populate,completeStarter,mountEditor};
 if(typeof module!=='undefined')module.exports=root.DianaRTPExpansion;
})(globalThis);
