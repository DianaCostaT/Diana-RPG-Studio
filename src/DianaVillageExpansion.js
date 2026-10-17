/* Authorial expansion for the editable Vila da Clareira. */
(function(root){
 'use strict';
 const OFFSET={x:16,y:12},ART_OFFSET={x:4,y:4},WIDTH=80,HEIGHT=64;
 const command=(code,parameters)=>({code,indent:0,parameters});
 const clone=value=>JSON.parse(JSON.stringify(value));
 const mapName=id=>'Map'+String(id).padStart(3,'0')+'.json';
 function eventPage(template,list,{characterName='',trigger=0,priorityType=1,through=false}={}){
  const page=clone(template);
  Object.assign(page,{
   conditions:{actorId:1,actorValid:false,itemId:1,itemValid:false,selfSwitchCh:'A',selfSwitchValid:false,switch1Id:1,switch1Valid:false,switch2Id:1,switch2Valid:false,variableId:1,variableValid:false},
   image:{tileId:0,characterName,characterIndex:0,direction:2,pattern:1},directionFix:false,moveFrequency:3,
   moveRoute:{list:[{code:0,parameters:[]}],repeat:true,skippable:false,wait:false},moveSpeed:3,moveType:0,
   priorityType,stepAnime:false,through,trigger,walkAnime:true,list
  });
  return page;
 }
 function text(face,index,lines){return [command(101,[face,index,0,2]),...lines.map(line=>command(401,[line])),command(0,[])];}
 function transfer(mapId,x,y){return [command(201,[0,mapId,x,y,2,0]),command(0,[])];}
 function addEvent(map,id,name,x,y,template,list,options){
  map.events[id]={id,name,note:'[DianaVillageExpansion:1]',x,y,pages:[eventPage(template,list,options)]};
 }
 function shiftMapOneReferences(data){
  for(const value of Object.values(data))if(value&&Array.isArray(value.events))for(const event of value.events.filter(Boolean)){
   for(const page of event.pages||[])for(const item of page.list||[])if(item.code===201&&item.parameters[0]===0&&item.parameters[1]===1){
    item.parameters[2]+=OFFSET.x+ART_OFFSET.x;item.parameters[3]+=OFFSET.y+ART_OFFSET.y;
   }
  }
 }
 function expandVillage(map,tiles,kit){
  const old={width:map.width,height:map.height,data:map.data.slice()};
  const oldSize=old.width*old.height,size=WIDTH*HEIGHT,data=Array(size*6).fill(0);
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++)data[y*WIDTH+x]=kit.terrain.grass;
  for(let z=0;z<6;z++)for(let y=0;y<old.height;y++)for(let x=0;x<old.width;x++){
   data[z*size+(y+OFFSET.y)*WIDTH+x+OFFSET.x]=old.data[z*oldSize+y*old.width+x];
  }
  Object.assign(map,{width:WIDTH,height:HEIGHT,data,dianaVillageOffset:{...OFFSET},dianaVillageDistricts:['Praça da Clareira','Jardins do Norte','Mercado do Vale','Alamedas do Rio','Mirante do Salão']});
  const inBase=(x,y)=>x>=OFFSET.x&&x<OFFSET.x+old.width&&y>=OFFSET.y&&y<OFFSET.y+old.height;
  const ground=(x,y,tile)=>{if(x>=0&&y>=0&&x<WIDTH&&y<HEIGHT&&!inBase(x,y))data[y*WIDTH+x]=tile;};
  const road=(x,y)=>ground(x,y,kit.terrain.dirt),water=(x,y)=>ground(x,y,kit.terrain.water),wood=(x,y)=>ground(x,y,kit.terrain.wood);
  for(let y=2;y<=61;y++)for(let x=5;x<=7;x++)water(x,y);
  for(let y=31;y<=33;y++)for(let x=5;x<=7;x++)wood(x,y);
  for(let x=4;x<=75;x++)road(x,10);
  for(let y=2;y<=60;y++)road(36,y);
  for(let y=10;y<=60;y++)road(64,y);
  for(let x=64;x<=75;x++)road(x,27);
  for(let x=8;x<=64;x++)road(x,55);
  for(let x=64;x<=75;x++)road(x,45);
  for(let y=55;y<=58;y++)road(52,y);
  for(let y=8;y<=10;y++){road(10,y);road(50,y);}
  for(let y=26;y<=27;y++)road(70,y);
  for(let y=10;y<=14;y++)for(let x=32;x<=40;x++)road(x,y);
  for(let y=52;y<=56;y++)for(let x=32;x<=40;x++)road(x,y);
  for(let y=35;y<=47;y++)for(let x=67;x<=76;x++)ground(x,y,kit.terrain.stone);
  for(let y=16;y<=21;y++)for(let x=68;x<=75;x++)ground(x,y,kit.terrain.soil);
  const stamp=(name,x,y)=>{
   const object=kit.objects[name];
   for(let dy=0;dy<object.height;dy++)for(let dx=0;dx<object.width;dx++)data[2*size+(y+dy)*WIDTH+x+dx]=kit.objectTileId(object,object.x+dx,object.y+dy);
  };
  for(const point of [[8,5],[48,5],[68,23],[50,54]])stamp('house',...point);
  stamp('market',68,36);stamp('well',72,40);stamp('counter',68,43);
  for(const point of [[12,14],[44,15],[57,16],[68,31],[73,52],[11,58],[25,57]])stamp('tree',...point);
  for(const point of [[15,8],[55,8],[67,20],[72,22],[69,34],[75,34],[47,52],[57,52]])stamp('bush',...point);
  for(const point of [[14,9],[16,9],[54,9],[56,9],[69,18],[71,18],[70,33],[74,33],[48,53],[56,53]])stamp('flowers',...point);
  for(const point of [[31,9],[41,9],[64,25],[64,44],[40,54],[64,55]])stamp('lamp',...point);
  for(const point of [[9,11],[49,11],[69,28],[51,53]])stamp('sign',...point);
  for(const point of [[16,17],[58,18],[66,51]])stamp('fence',...point);
  return old;
 }
 function restoreClassicClareira(map,tiles){
  const size=map.width*map.height,x0=OFFSET.x+ART_OFFSET.x,y0=OFFSET.y+ART_OFFSET.y;
  const walkable=(x,y)=>
   x>=17&&x<=19&&y>=8&&y<=31||
   x>=10&&x<=27&&y>=10&&y<=19||
   x>=0&&x<=12&&y>=14&&y<=16||
   x>=6&&x<=12&&y>=17&&y<=22||
   x>=8&&x<=11&&y>=8&&y<=15||
   x>=25&&x<=30&&y>=8&&y<=15||
   x>=14&&x<=22&&y>=4&&y<=11||
   x>=11&&x<=31&&y>=20&&y<=26||
   x>=11&&x<=25&&y>=27&&y<=31;
  // IDs 254 and 255 are transparent atlas cells reserved for passage data.
  tiles.flags[254]=0;tiles.flags[255]=15;
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){
   const index=(y0+y)*map.width+x0+x;
   map.data[index]=walkable(x,y)?254:255;
   for(let z=1;z<6;z++)map.data[z*size+index]=0;
  }
  Object.assign(map,{parallaxName:'!VilaClareiraExpandida',parallaxShow:true,parallaxLoopX:false,parallaxLoopY:false,
   dianaClareiraPresentation:{version:1,style:'primeira-vila-clareira',editableWorld:true,artRect:{x:x0,y:y0,width:32,height:32},collisionTiles:{walkable:254,blocked:255}}});
 }
 function createInterior(data,id,name,purpose,populator,template,events){
  const kit=root.DianaTileKit||(typeof require==='function'?require('./DianaTileKit.js'):null),tiles=data['Tilesets.json'][1],map={id,events:[null]};
  populator(map,tiles);map.id=id;map.displayName=name;map.dianaVillageInterior={version:1,purpose,editable:true};
  for(const factory of events(template)){
   const [eventId,name,x,y,list,options]=factory(template);
   addEvent(map,eventId,name,x,y,template,list,options);
  }
  data[mapName(id)]=map;
  data['MapInfos.json'][id]={...data['MapInfos.json'][1],id,name,order:id,parentId:0};
 }
 function completeStarter(data,B){
  const map=data['Map001.json'],system=data['System.json'],tiles=data['Tilesets.json']?.[1];
  const kit=root.DianaTileKit||(typeof require==='function'?require('./DianaTileKit.js'):null);
  if(!map||!system||!tiles||!kit||map.dianaVillageOffset)return data;
  const template=map.events.find(Boolean)?.pages?.[0];if(!template)return data;
  const old=expandVillage(map,tiles,kit);
  // Frame the full village center in the editor rather than the player's lower-path spawn.
  map.dianaVillageFocus={x:OFFSET.x+ART_OFFSET.x+16,y:OFFSET.y+ART_OFFSET.y+16};
  system.startX+=OFFSET.x+ART_OFFSET.x;system.startY+=OFFSET.y+ART_OFFSET.y;
  for(const event of map.events.filter(Boolean)){event.x+=OFFSET.x+ART_OFFSET.x;event.y+=OFFSET.y+ART_OFFSET.y;}
  shiftMapOneReferences(data);
  const nextId=Math.max(...map.events.map(event=>event?.id||0))+1;
  addEvent(map,nextId,'Porta do Boticário',9,8,template,transfer(6,10,13),{trigger:1,priorityType:1});
  addEvent(map,nextId+1,'Porta da Forja',49,8,template,transfer(7,10,13),{trigger:1,priorityType:1});
  addEvent(map,nextId+2,'Porta da Biblioteca',69,26,template,transfer(8,10,13),{trigger:1,priorityType:1});
  addEvent(map,nextId+3,'Porta do Salão do Mirante',51,57,template,transfer(9,10,13),{trigger:1,priorityType:1});
  addEvent(map,nextId+4,'Alda, boticária',12,10,template,text('',0,['As ervas do jardim acalmam o corpo e a mente.','Entre se precisar recuperar as forças.'] ),{characterName:'$Nila'});
  addEvent(map,nextId+5,'Dário, ferreiro',52,10,template,text('',0,['A forja trabalha devagar para que cada peça dure muitas jornadas.','Cuide bem do que carrega consigo.']),{characterName:'$Ivo'});
  addEvent(map,nextId+6,'Rui, livreiro',68,27,template,text('',0,['Os livros da vila guardam caminhos que os mapas não mostram.','Na biblioteca, toda pergunta merece tempo.']),{characterName:'$Mira'});
  addEvent(map,nextId+7,'Lena, feirante',70,45,template,text('',0,['O mercado reúne pão, sementes e histórias trazidas pela estrada.','A praça fica mais bonita quando todos podem passar.']),{characterName:'$Orin'});
  const returnTo=(x,y)=>transfer(1,x,y);
  createInterior(data,6,'Boticário das Folhas','boticario',kit.populateCottage,template,base=>[
   () => [1,'Saída do boticário',10,13,returnTo(10,10),{trigger:1,priorityType:0}],
   () => [2,'Alda, boticária',12,7,[...text('',0,['Respire fundo. Uma pausa também faz parte da viagem.']),command(314,[0,0]),command(0,[])],{characterName:'$Nila'}],
   () => [3,'Canteiro de camomila',15,7,text('',0,['Camomila, alecrim e hortelã crescem melhor onde há passagem de luz.']),{characterName:''}]
  ]);
  createInterior(data,7,'Forja do Vale','forja',kit.populateForge,template,base=>[
   () => [1,'Saída da forja',10,13,returnTo(50,10),{trigger:1,priorityType:0}],
   () => [2,'Dário, ferreiro',8,6,[...text('',0,['Espadas e escudos para proteger os caminhos da vila.']),command(302,[1,1,0,0,false]),command(605,[2,1,0,0]),command(605,[2,2,0,0]),command(0,[])],{characterName:'$Ivo'}],
   () => [3,'Bigorna antiga',16,5,text('',0,['A bigorna carrega marcas de muitas ferramentas feitas para a vila.']),{characterName:''}]
  ]);
  createInterior(data,8,'Biblioteca das Caminhadas','biblioteca',kit.populateLibrary,template,base=>[
   () => [1,'Saída da biblioteca',10,13,returnTo(70,28),{trigger:1,priorityType:0}],
   () => [2,'Rui, livreiro',12,7,text('',0,['Um bom livro não apressa quem o lê.','Escolha uma estante e descubra um pedaço da vila.']),{characterName:'$Mira'}],
   () => [3,'Estante de relatos',15,7,text('',0,['Relatos de viajantes lembram que toda estrada começa perto de casa.']),{characterName:''}]
  ]);
  createInterior(data,9,'Salão do Mirante','salao',kit.populateHall,template,base=>[
   () => [1,'Saída do salão',10,13,returnTo(52,55),{trigger:1,priorityType:0}],
   () => [2,'Baú de boas-vindas',16,5,[command(101,['',0,0,2]),command(401,['Um presente para a próxima caminhada.']),command(126,[1,0,0,2]),command(123,['A',0]),command(0,[])],{characterName:'',trigger:0}],
   () => [3,'Lena, anfitriã',8,6,text('',0,['Do mirante, a vila parece um jardim entre rios.','Sente-se um pouco; a vista não vai embora.']),{characterName:'$Orin'}]
  ]);
  const chest=data['Map009.json'].events[2],empty=clone(chest.pages[0]);
  empty.conditions.selfSwitchValid=true;empty.conditions.selfSwitchCh='A';empty.list=[command(0,[])];chest.pages.push(empty);
  map.dianaVillageExpansion={version:1,sourceSize:old.width+'x'+old.height,offset:{...OFFSET},interiors:[6,7,8,9]};
  // Distinct buildings are editable E tiles: roofs above the party, facades below.
  tiles.tilesetNames[8]='ClareiraArquitetura';
  for(let id=768;id<1024;id++)tiles.flags[id]=16;
  const buildings=[['Boticário das Folhas',6,9,8,8,5],['Forja do Vale',7,49,8,48,5],['Biblioteca das Caminhadas',8,69,26,68,23],['Salão do Mirante',9,51,57,50,54]];
  const size=map.width*map.height;
  buildings.forEach(([name,mapId,doorX,doorY,oldX,oldY],i)=>{
   for(let dy=0;dy<4;dy++)for(let dx=0;dx<4;dx++)map.data[2*size+(oldY+dy)*map.width+oldX+dx]=0;
   const left=doorX-3,top=doorY-5;
   for(let dy=0;dy<6;dy++)for(let dx=0;dx<6;dx++){
    const tile=768+kit.tileId(i%2*8+dx,Math.floor(i/2)*8+dy),layer=dy<4?3:2;
    map.data[layer*size+(top+dy)*map.width+left+dx]=tile;
    tiles.flags[tile]=dy<4?16:dx===3&&dy===5?0:15;
   }
   for(let y=doorY;y<=doorY+2;y++)map.data[y*map.width+doorX]=kit.terrain.dirt;
  });
  map.dianaVillageBuildings=buildings.map(([name,mapId,doorX,doorY])=>({name,mapId,doorX,doorY}));
  restoreClassicClareira(map,tiles);
  return data;
 }
 const api={completeStarter,OFFSET,ART_OFFSET,WIDTH,HEIGHT};
 root.DianaVillageExpansion=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
