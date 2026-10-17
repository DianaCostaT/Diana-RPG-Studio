/* Original medieval/cyberpunk resources; uses the existing Reactor contracts. */
(function(root){
 'use strict';
 const monsters=['GolemMusgo','LoboPrata','DragaoBosque','BruxaCogumelo','RoboSeguranca','MercenarioNeon','DroneNeon','SerpenteNeon'];
 const monsterNames=['Golem de Musgo','Lobo de Prata','Dragão do Bosque','Bruxa dos Cogumelos','Robô de Segurança','Mercenário Neon','Drone Vigia','Serpente Cibernética'];
 const people=['BrannRetrato','Arqueira','Sabia','Ferreira','EntregadoraNeon','HackerNeon','SamuraiNeon','AndroideNeon'];
 const personNames=['Brann — retrato','Arqueira do Bosque','Sábia da Clareira','Ferreira do Vale','Entregadora Neon','Hacker Neon','Samurai Neon','Androide de Serviço'];
 const equipment=['Espada','Arco','Martelo','Cajado','Escudo','Armadura','Botas','Capa','PocaoPV','PocaoPM','Erva','Pao','Chave','Grimorio','Anel','Moedas','Katana','PistolaPlasma','Rifle','Bastao','EscudoHolo','Jaqueta','LuvaCyber','Visor','Medkit','Bateria','Chip','Cyberdeck','ControleDrone','ChaveCircuito','Nanitos','Creditos'];
 const equipmentLabels=['Espada da Clareira','Arco de Carvalho','Martelo do Vale','Cajado Esmeralda','Escudo do Vale','Armadura','Botas de Viagem','Capa da Clareira','Poção Rubra','Poção Azul','Ervas de Cura','Pão do Vale','Chave Antiga','Grimório','Anel de Rubi','Bolsa de Moedas','Katana de Energia','Pistola de Plasma','Rifle Magnético','Bastão de Choque','Gerador de Escudo','Jaqueta Blindada','Manopla Cibernética','Visor Neural','Kit Médico','Célula de Energia','Chip de Dados','Cyberdeck','Controle de Drone','Chave de Circuito','Frasco de Nanitos','Ficha de Créditos'];
 function equipmentDatabase(index){const weapon=[0,1,2,3,16,17,18,19].indexOf(index),armor=[4,5,6,7,20,21,22,23].indexOf(index);return weapon>=0?{table:'Weapons',id:weapon+1}:armor>=0?{table:'Armors',id:armor+1}:{table:'Items',id:index<16?index-4:index-12};}
 const catalog=[
  ...[['MercadoClareira','Mercado da Clareira',10,'medieval'],['DistritoNeon','Distrito Neon',11,'cyberpunk']].map(([name,label,id,theme])=>({id:'v2-map-'+id,kind:'map',theme,label,asset:'img/parallaxes/!'+name+'V2.png',database:{table:'MapInfos',id}})),
  {id:'v2-brann',kind:'hero',theme:'medieval',label:'Brann — combate V2',asset:'img/sv_actors/BrannClareiraV2.png',database:{table:'Actors',id:2}},
  ...[['Arqueira','Arqueira da Clareira',3,'medieval'],['Entregadora','Mensageira Neon',4,'cyberpunk']].map(([name,label,id,theme])=>({id:'v2-hero-'+id,kind:'hero',theme,label,asset:'img/characters/$'+name+'V2.png',database:{table:'Actors',id}})),
  ...[['Medieval','Jardim modular',12,'medieval'],['Cyber','Quadra Neon modular',13,'cyberpunk']].map(([name,label,id,theme])=>({id:'v2-native-'+id,kind:'map',theme,label,asset:'img/tilesets/DianaV2'+name+'Objetos.png',database:{table:'MapInfos',id}})),
  {id:'v2-background-neon',kind:'background',theme:'cyberpunk',label:'Praça Neon — batalha',asset:'img/battlebacks1/DistritoNeonBatalhaV2.png',database:{table:'Troops',id:10}},
  ...monsters.map((name,i)=>({id:'v2-monster-'+i,kind:'enemy',theme:i<4?'medieval':'cyberpunk',label:monsterNames[i],asset:'img/enemies/'+name+'V2.png',database:{table:'Enemies',id:6+i}})),
  ...people.map((name,i)=>({id:'v2-person-'+i,kind:'illustration',theme:i<4?'medieval':'cyberpunk',label:personNames[i]+' (ilustração)',asset:'img/pictures/'+name+'V2.png',database:{table:'Actors',id:2}})),
  ...equipment.map((name,i)=>({id:'v2-equipment-'+i,kind:'equipment',theme:i<16?'medieval':'cyberpunk',label:equipmentLabels[i],asset:'img/pictures/DianaV2'+name+'.png',database:equipmentDatabase(i)})),
  ...['Corte','Fogo','Plasma','EscudoCyber'].map((name,i)=>({id:'v2-effect-'+i,kind:'effect',theme:i<2?'medieval':'cyberpunk',label:name+' V2',asset:'img/animations/'+name+'V2.png',database:{table:'Animations',id:8+i}}))
 ];
 function populate(data){
  const settings=data['BattlePresentation.json'];if(!settings)return;
  const brann=settings.actors?.[2]?.graphic;if(brann){brann.name='BrannClareiraV2';brann.showWeapon=false;delete brann.guardGraphics;}
  if(data['Actors.json']?.[2])data['Actors.json'][2].battlerName='BrannClareiraV2';
  const clone=value=>JSON.parse(JSON.stringify(value));
  for(const [id,name,file,faceIndex,weapon] of [[3,'Arqueira da Clareira','Arqueira',7,2],[4,'Mensageira Neon','Entregadora',3,6]]){
   data['Actors.json'][id]={...clone(data['Actors.json'][2]),id,name,nickname:'',profile:'Personagem original da biblioteca V2.',characterName:'$'+file+'V2',faceIndex,battlerName:file+'CombateV2',equips:[weapon,0,0,2,0],note:'[DianaArtLibrary:2]'};
   settings.actors[id]=clone(settings.actors[2]);settings.actors[id].graphic.name=file+'CombateV2';
   data['System.json'].dianaSpriteAnimations.characters['$'+file+'V2']={columns:6,rows:4,anchor:{x:.5,y:1},animations:{walk:{frames:[0,1,2,3,4,5],directions:{2:[0,1,2,3,4,5],4:[6,7,8,9,10,11],6:[12,13,14,15,16,17],8:[18,19,20,21,22,23]},speed:8,loop:true}}};
  }
  const weaponArt=[0,1,2,3,16,17,18,19],weaponLabels=['Espada da Clareira','Arco de Carvalho','Martelo do Vale','Cajado Esmeralda','Katana de Energia','Pistola de Plasma','Rifle Magnético','Bastão de Choque'];
  weaponArt.forEach((index,i)=>{const id=i+1,record=clone(data['Weapons.json'][1]);Object.assign(record,{id,name:weaponLabels[i],iconIndex:256+index,description:i<4?'Equipamento artesanal da Clareira.':'Equipamento do Distrito Neon.',animationId:i<4?8:10,note:'[DianaArtLibrary:2]'});data['Weapons.json'][id]=record;});
  data['Armors.json'][1].iconIndex=260;data['Armors.json'][2].iconIndex=261;
  [[6,'Botas de Viagem',5],[7,'Capa da Clareira',5],[20,'Gerador de Escudo',2],[21,'Jaqueta Blindada',4],[22,'Manopla Cibernética',5],[23,'Visor Neural',3]].forEach(([index,name,etypeId],i)=>{const id=i+3,record=clone(data['Armors.json'][1]);Object.assign(record,{id,name,etypeId,iconIndex:256+index,note:'[DianaArtLibrary:2]'});data['Armors.json'][id]=record;});
  data['Items.json'][1].iconIndex=264;data['Items.json'][2].iconIndex=265;data['Items.json'][3].iconIndex=266;
  const itemNames=['Poção Rubra','Poção Azul','Ervas de Cura','Pão do Vale','Chave Antiga','Grimório','Anel de Rubi','Bolsa de Moedas','Kit Médico','Célula de Energia','Chip de Dados','Cyberdeck','Controle de Drone','Chave de Circuito','Frasco de Nanitos','Ficha de Créditos'];
  [...Array.from({length:8},(_,i)=>8+i),...Array.from({length:8},(_,i)=>24+i)].forEach((index,i)=>{const id=i+4,record=clone(data['Items.json'][1]),heals=[8,9,10,11,24,25,30].includes(index),mp=[9,25].includes(index);Object.assign(record,{id,name:itemNames[i],iconIndex:256+index,itypeId:heals?1:2,consumable:heals,occasion:heals?0:3,description:heals?(mp?'Restaura 20 PM.':'Restaura 50 PV.'):'Recurso para eventos e histórias.',effects:heals?[{code:mp?12:11,dataId:0,value1:0,value2:mp?20:50}]:[],note:'[DianaArtLibrary:2]'});data['Items.json'][id]=record;});
  monsters.forEach((name,i)=>{const id=i+6,enemy=JSON.parse(JSON.stringify(data['Enemies.json'][2]));Object.assign(enemy,{id,name:monsterNames[i],battlerName:name+'V2',note:'[DianaArtLibrary:2]'});data['Enemies.json'][id]=enemy;
   settings.enemies[id]={graphic:{mode:'static',name:name+'V2',folder:'enemies',scale:1}};
   data['Troops.json'][id]={id,name:monsterNames[i],members:[{enemyId:id,x:280,y:380,hidden:false}],pages:[]};
  });
  for(const [id,name] of [[6,'GolemMusgoAnimV2'],[10,'RoboSegurancaAnimV2']]){data['Enemies.json'][id].battlerName=name;settings.enemies[id].graphic={...clone(settings.actors[2].graphic),name,folder:'enemies'};}
  ['Corte','Fogo','Plasma','EscudoCyber'].forEach((name,i)=>{const id=8+i;data['Animations.json'][id]={id,name:name+' V2',animation1Name:name+'V2',animation1Hue:0,animation2Name:'',animation2Hue:0,position:1,frames:Array.from({length:5},(_,f)=>[[f,0,0,100,0,false,255,1]]),timings:[]};});
  for(const [id,name] of [[3,'CorteV2'],[4,'FogoV2']])settings.skills[id]={...settings.skills[id],effect:{name,folder:'animations',columns:5,rows:1}};
  data['Animations.json'][1].animation1Name='CorteV2';data['Animations.json'][3].animation1Name='FogoV2';
  // These are scenic map options with native collision tiles and editable events.
  // The images remain scenic plates, not individually paintable architecture.
  const tilesetId=data['Tilesets.json'].length,flags=Array(8192).fill(15);flags[0]=16;flags[1536]=0;
  data['Tilesets.json'].push({id:tilesetId,name:'Cenários V2 — colisão invisível',mode:1,flags,tilesetNames:['','','','','DianaV2Collision','','','',''],note:'[DianaArtLibrary:2]'});
  for(const [id,name,asset] of [[10,'Mercado da Clareira','MercadoClareiraV2'],[11,'Distrito Neon','DistritoNeonV2']]){
   const map=JSON.parse(JSON.stringify(data['Map003.json'])),width=40,height=40,size=width*height;
   Object.assign(map,{id,displayName:name,tilesetId,width,height,data:Array(size*6).fill(0),events:[null],parallaxName:'!'+asset,parallaxShow:true,parallaxLoopX:false,parallaxLoopY:false,encounterList:[],dianaArtLibrary:{version:2,status:'colisão conservadora; inspeção no jogo pendente'}});
   // Invisible tiles use the established solid/walkable native tile flags.
   for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const walk=id===10?((x>=20&&x<=23&&y>=23&&y<=38)||(x>=15&&x<=28&&y>=14&&y<=25&&!(x>=18&&x<=24&&y>=16&&y<=22))):((x>=24&&x<=27&&y>=14&&y<=38)||(x>=23&&x<=29&&y>=14&&y<=24));
    map.data[y*width+x]=walk?1536:1537;
   }
   const page=JSON.parse(JSON.stringify(data['Map003.json'].events[2].pages[0]));page.list=[{code:201,indent:0,parameters:[0,1,36,36,2,0]},{code:0,indent:0,parameters:[]}];
   Object.assign(page,{trigger:1,priorityType:0,image:{tileId:0,characterName:'',characterIndex:0,direction:2,pattern:1}});
   const startX=id===10?21:25;
   map.events[1]={id:1,name:'Voltar à Clareira',x:startX,y:38,pages:[page]};
   if(id===11)map.battleback1Name='DistritoNeonBatalhaV2';
   const arena=data['Map003.json'],portal=JSON.parse(JSON.stringify(page)),eventId=arena.events.length;portal.trigger=0;portal.priorityType=1;portal.image.characterName='$Guardiao';portal.list=[{code:201,indent:0,parameters:[0,id,startX,36,8,0]},{code:0,indent:0,parameters:[]}];arena.events[eventId]={id:eventId,name:'Visitar '+name,x:id===10?12:20,y:22,pages:[portal]};
   data['Map'+String(id).padStart(3,'0')+'.json']=map;data['MapInfos.json'][id]={id,name,order:id,parentId:0,expanded:false,scrollX:0,scrollY:0};
  }
  nativeMaps(data);
  const system=data['System.json'];system.dianaRtpCatalog={...(system.dianaRtpCatalog||{}),version:2,entries:[...(system.dianaRtpCatalog?.entries||[]),...catalog]};
  return data;
 }
 function nativeMaps(data){
  const tileId=(x,y)=>(x>=8?128:0)+y*8+x%8;
  for(const [mapId,theme,name] of [[12,'Medieval','Jardim modular'],[13,'Cyber','Quadra Neon modular']]){
   const tilesetId=data['Tilesets.json'].length,flags=Array(8192).fill(16);flags[0]=16;
   for(let row=0;row<7;row++)for(let col=0;col<4;col++)flags[1536+row*8+col]=theme==='Medieval'&&col===3?15:0;
   for(let index=64;index<112;index++)flags[1536+index]=theme==='Medieval'&&index>=96?15:0;
   for(let index=0;index<12;index++)for(let dy=0;dy<5;dy++)for(let dx=0;dx<4;dx++)flags[tileId(index%4*4+dx,Math.floor(index/4)*5+dy)]=dy<3?16:15;
   // Houses have a walkable door; bridges and fences keep native passage semantics.
   for(const index of [0,1])flags[tileId(index*4+2,4)]=0;
   for(let dy=0;dy<5;dy++)for(let dx=0;dx<4;dx++)flags[tileId(dx,10+dy)]=0;
   data['Tilesets.json'].push({id:tilesetId,name:name+' — peças editáveis',mode:1,flags,tilesetNames:['','','','','DianaV2'+theme+'Terrenos','DianaV2'+theme+'Objetos','','',''],note:'[DianaArtLibrary:2]'});
   const map=JSON.parse(JSON.stringify(data['Map003.json'])),w=40,h=36,size=w*h;
   Object.assign(map,{id:mapId,displayName:name,tilesetId,width:w,height:h,data:Array(size*6).fill(0),events:[null],parallaxName:'',parallaxShow:false,encounterList:[],dianaArtLibrary:{version:2,authoring:'tiles-nativos'}});
   map.battleback1Name=theme==='Cyber'?'DistritoNeonBatalhaV2':'PracaClareira';map.specifyBattleback=true;
   const terrain=(x,y)=>x<2||x>=38||y<2||y>=34?3:x>=12&&x<=28&&y>=15&&y<=25?2:x>=19&&x<=23||y>=23&&y<=25?1:0;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){const type=terrain(x,y),variant=(x*7+y*11)%7;let index=variant*8+type;if(theme==='Medieval'&&type){let mask=0;[[0,-1],[1,0],[0,1],[-1,0]].forEach(([dx,dy],i)=>{if(terrain(x+dx,y+dy)===type)mask|=1<<i;});if(mask!==15)index=64+(type-1)*16+mask;}map.data[y*w+x]=1536+index;}
   const stamp=(index,x,y)=>{for(let dy=0;dy<5;dy++)for(let dx=0;dx<4;dx++)map.data[size+(y+dy)*w+x+dx]=tileId(index%4*4+dx,Math.floor(index/4)*5+dy);};
   for(const [index,x,y] of [[0,5,5],[1,29,5],[2,6,16],[3,30,16],[6,15,15],[7,25,16],[8,0,22],[9,8,10],[10,32,26],[11,11,20],[11,27,20]])stamp(index,x,y);
   for(const x of [3,10,25,33])for(const y of [2,10,28])if(!(x===10&&y===10))stamp((x+y)%2?4:5,x,y);
   const page=JSON.parse(JSON.stringify(data['Map010.json'].events[1].pages[0]));map.events[1]={id:1,name:'Voltar à Clareira',x:21,y:33,pages:[page]};
   const recruit=JSON.parse(JSON.stringify(page)),actorId=mapId===12?3:4;Object.assign(recruit,{trigger:0,priorityType:1,image:{tileId:0,characterName:mapId===12?'$ArqueiraV2':'$EntregadoraV2',characterIndex:0,direction:2,pattern:1},list:[{code:101,indent:0,parameters:['',0,0,2]},{code:401,indent:0,parameters:['Vamos explorar juntos? Vou acompanhar o grupo.']},{code:129,indent:0,parameters:[actorId,0,false]},{code:0,indent:0,parameters:[]}]});map.events[2]={id:2,name:'Companheira da biblioteca',x:20,y:27,pages:[recruit]};
   data['Map'+String(mapId).padStart(3,'0')+'.json']=map;data['MapInfos.json'][mapId]={id:mapId,name,order:mapId,parentId:0,expanded:false,scrollX:0,scrollY:0};
   const arena=data['Map003.json'],portal=JSON.parse(JSON.stringify(recruit)),id=arena.events.length;portal.image.characterName='$Guardiao';portal.list=[{code:201,indent:0,parameters:[0,mapId,21,31,8,0]},{code:0,indent:0,parameters:[]}];arena.events[id]={id,name:'Visitar '+name,x:mapId===12?8:24,y:22,pages:[portal]};
  }
 }
 root.DianaArtLibrary={catalog,populate,nativeMaps};if(typeof module!=='undefined')module.exports=root.DianaArtLibrary;
})(globalThis);
