/* Default editable village. Reuses native map, event and animation contracts. */
(function(root){
 'use strict';
 const walkRows=[[2,0],[4,6],[6,12],[8,18]];
 const walkAnimation=(frames,speed)=>({frames,directions:Object.fromEntries(walkRows.map(([direction,offset])=>[String(direction),frames.map(cell=>offset+cell)])),speed,loop:true});
 function populate(data,B){
  const system=data['System.json'];Object.assign(system,{gameTitle:'Vila da Clareira',tileSize:32,startMapId:1,startX:16,startY:20,optSideView:true,dianaSpriteAnimations:{version:1,characters:{'$Liora':{columns:6,rows:4,anchor:{x:.5,y:1},animations:{walk:walkAnimation([2,1,0,5,4,3],8)}}}}});
  for(const name of ['Mira','Orin','Nila','Ivo'])system.dianaSpriteAnimations.characters['$'+name]={columns:6,rows:4,anchor:{x:.5,y:1},animations:{walk:walkAnimation([0,1,2,3,4,5],8)}};
  Object.assign(data['Actors.json'][1],{name:'Liora',nickname:'Viajante da Clareira',profile:'Uma viajante que escuta as histórias da floresta.',characterName:'$Liora',faceName:'ClareiraRostos',faceIndex:0});
  Object.assign(data['Enemies.json'][1],{name:'Guardião de Musgo',params:[180,0,8,10,8,8,8,8],exp:20});
  Object.assign(data['Troops.json'][1],{name:'Guardião da Clareira',members:[{enemyId:1,x:250,y:380,hidden:false}]});
  const map=data['Map001.json'];Object.assign(map,{id:1,displayName:'Vila da Clareira',parallaxName:'',parallaxShow:false,parallaxLoopX:false,parallaxLoopY:false,battleback1Name:'PracaClareira',battleback2Name:'',specifyBattleback:true});
  const npc=map.events[1];Object.assign(npc,{name:'Guardião da Clareira',x:18,y:25});const page=npc.pages[0];page.image.characterName='$Guardiao';page.image.direction=8;page.directionFix=true;
  page.list=[{code:101,indent:0,parameters:['ClareiraRostos',5,0,2]},{code:401,indent:0,parameters:['Bem-vinda, Liora.']},{code:401,indent:0,parameters:['A floresta guarda muitas histórias.']},{code:401,indent:0,parameters:['Vamos treinar suas novas poses?']},{code:301,indent:0,parameters:[0,1,true,true]},{code:0,indent:0,parameters:[]}];
  data['MapInfos.json'][1]={...data['MapInfos.json'][1],id:1,name:'Vila da Clareira',order:1};
  const tiles=data['Tilesets.json'][1];
  const kit=root.DianaTileKit||(typeof require==='function'?require('./DianaTileKit.js'):null);kit.populate(map,tiles);
  const clonePage=()=>JSON.parse(JSON.stringify(npc.pages[0]));
  const event=(id,name,x,y,list,characterName='$Guardiao')=>({id,name,note:'[DianaFixtureEvent:1]',x,y,pages:[Object.assign(clonePage(),{image:{tileId:0,characterName,characterIndex:0,direction:2,pattern:1},directionFix:false,stepAnime:false,list})]});
  const transfer=(_text,mapId,x,y)=>[{code:201,indent:0,parameters:[0,mapId,x,y,2,0]},{code:0,indent:0,parameters:[]}];
  const speak=(face,index,...lines)=>[{code:101,indent:0,parameters:[face,index,0,2]},...lines.map(text=>({code:401,indent:0,parameters:[text]})),{code:0,indent:0,parameters:[]}];
  map.events[2]=event(2,'Rota de colisão',20,33,transfer('A rota de navegação testa água, ponte e obstáculos nativos.',2,3,20));
  map.events[3]=event(3,'Arena de poses',23,24,transfer('A arena demonstra as poses de batalha de Liora e do Guardião.',3,16,22));
  map.events[4]=event(4,'Porta da hospedaria',27,9,transfer('A Hospedaria da Lanterna tem quartos e histórias de viagem.',4,10,13));
  map.events[5]=event(5,'Porta da casa do jardineiro',10,9,transfer('A casa do jardineiro cuida das flores da praça.',5,10,13));
  map.events[6]=event(6,'Mira, a hoteleira',26,12,speak('',0,'A Hospedaria da Lanterna está aberta.','Descanse um pouco antes de seguir viagem.'),'$Mira');
  map.events[7]=event(7,'Orin, mercador',30,24,speak('',0,'Chegaram sementes e mapas para quem explora a floresta.','A estrada do norte leva ao antigo bosque.'),'$Orin');
  map.events[8]=event(8,'Nila, jardineira',16,13,speak('',0,'As flores marcam caminhos seguros pela vila.'),'$Nila');
  map.events[9]=event(9,'Pescador da ponte',7,18,speak('ClareiraRostos',5,'A correnteza está forte hoje.','A ponte de madeira é a única travessia segura.'),'$Ivo');
  map.events[10]=event(10,'Ivo, aprendiz',20,26,speak('',0,'Quando estiver pronta, podemos treinar na arena.'),'$Ivo');
  map.events[11]=event(11,'Celina, viajante',35,15,speak('',0,'Vim do vale além das colinas.','Ouvi dizer que o bosque brilha ao entardecer.'),'$Mira');
  map.events[12]=event(12,'Teo, mensageiro',12,23,speak('',0,'Uma carta para a hospedaria!','A ponte encurta bastante o caminho.'),'$Ivo');
  const makeFixture=(id,displayName,populator)=>{const fixture=JSON.parse(JSON.stringify(map));fixture.id=id;fixture.events=[null];fixture.displayName=displayName;populator(fixture,tiles);return fixture;};
  const navigation=makeFixture(2,'Rota de navegação',kit.populateNavigation);
  navigation.events[1]=event(1,'Retorno à vila',3,20,transfer('A ponte é o único caminho sobre a água bloqueada.',1,18,24),'$Liora');
  const arena=makeFixture(3,'Arena de animação e batalha',kit.populateBattle);
  arena.battleback1Name='BosqueClareira';arena.specifyBattleback=true;
  arena.events[1]=event(1,'Guardião — demonstração',16,17,[{code:101,indent:0,parameters:['ClareiraRostos',5,0,2]},{code:401,indent:0,parameters:['Poses de espera, ataque, dano e vitória usam o mesmo contrato.']},{code:301,indent:0,parameters:[0,1,true,true]},{code:0,indent:0,parameters:[]}]);
  arena.events[2]=event(2,'Retorno à vila',16,22,transfer('Voltar para a Vila da Clareira.',1,20,30),'$Liora');
  const inn=makeFixture(4,'Hospedaria da Lanterna',kit.populateInn);
  inn.events[1]=event(1,'Saída da hospedaria',10,13,transfer('Voltar para a praça da Vila da Clareira.',1,27,10),'$Liora');
  inn.events[2]=event(2,'Livro de hóspedes',16,5,speak('ClareiraRostos',1,'Livro de hóspedes:','"Que cada visitante deixe a vila mais viva do que encontrou."'),'$Liora');
  const cottage=makeFixture(5,'Casa do Jardineiro',kit.populateCottage);
  cottage.events[1]=event(1,'Saída da casa',10,13,transfer('Voltar para o jardim da vila.',1,10,10),'$Liora');
  cottage.events[2]=event(2,'Caderno de sementes',15,7,speak('ClareiraRostos',4,'As espécies da clareira florescem melhor perto do lago.'),'$Liora');
  data['Map002.json']=navigation;data['Map003.json']=arena;data['Map004.json']=inn;data['Map005.json']=cottage;
  data['MapInfos.json'][2]={...data['MapInfos.json'][1],id:2,name:'Rota de navegação',order:2,parentId:0};
  data['MapInfos.json'][3]={...data['MapInfos.json'][1],id:3,name:'Arena de animação e batalha',order:3,parentId:0};
  data['MapInfos.json'][4]={...data['MapInfos.json'][1],id:4,name:'Hospedaria da Lanterna',order:4,parentId:0};
  data['MapInfos.json'][5]={...data['MapInfos.json'][1],id:5,name:'Casa do Jardineiro',order:5,parentId:0};
  for(const m of [map,navigation,arena,inn,cottage])for(const e of m.events.filter(Boolean))if(e.pages[0].list.some(c=>c.code===201)){Object.assign(e.pages[0],{image:{tileId:0,characterName:'',characterIndex:0,direction:2,pattern:1},priorityType:0,trigger:1,stepAnime:false});}
  const settings=data['BattlePresentation.json'];settings.startMessages=false;settings.screen2d={actorHomes:{0:{x:430,y:400},1:{x:650,y:420}}};
  const pose=row=>({loop:true,anchor:{x:.5,y:1},frames:Array.from({length:4},(_,i)=>({x:i*192,y:row*192,width:192,height:192,duration:10}))});
  const sequences=[null];
  for(const [kind,offset,id] of [['actors',0,1],['enemies',2,2]]){
   const idle=pose(offset),attack=pose(offset+1),damage=pose(kind==='actors'?4:5),victory=pose(kind==='actors'?6:7);
   const six=(p,row,durations)=>{p.frames=Array.from({length:6},(_,i)=>({x:i*192,y:row*192,width:192,height:192,duration:durations[i]}));};
   if(kind==='enemies'){six(idle,2,[8,8,8,8,8,8]);six(attack,3,[8,6,4,6,10,14]);six(damage,5,[8,8,8,8,8,8]);}
   attack.loop=false;if(kind==='actors')attack.frames.forEach((f,i)=>f.duration=[8,6,6,12][i]);damage.loop=false;if(kind==='actors')damage.frames.forEach(f=>f.duration=8);
   six(victory,kind==='actors'?6:7,[8,8,10,12,10,18]);victory.loop='once';
   const motions=Object.fromEntries([...new Set([...Object.keys(B.spriteMotions),...B.battlerStates.map(([name])=>name)])].map(name=>[name,{pose:['attack','punch','swing','thrust','missile','skill','item','cast','spell'].includes(name)?'attack':'idle'}]));
   motions.damage={pose:'damage'};
   motions.victory={pose:'victory'};
   settings[kind][1]={mode:'sequence',sequenceId:id,graphic:{mode:'static',name:'ClareiraCombate',folder:'sv_actors',scale:1,spriteAnimation:{version:1,columns:6,rows:8,anchor:{x:.5,y:1},animations:{idle:{frames:Array.from({length:kind==='actors'?4:6},(_,i)=>offset*6+i),speed:10,loop:true},attack:{frames:Array.from({length:kind==='actors'?4:6},(_,i)=>(offset+1)*6+i),speed:8,loop:false},damage:{frames:Array.from({length:kind==='actors'?4:6},(_,i)=>(kind==='actors'?4:5)*6+i),speed:8,loop:false},victory:{frames:[kind==='actors'?36:42,kind==='actors'?37:43,kind==='actors'?38:44,kind==='actors'?39:45,kind==='actors'?40:46,kind==='actors'?41:47],speed:10,loop:'once'}}},poses:{idle,attack,damage,victory},motions}};
   sequences.push({id,version:1,name:kind==='actors'?'Liora — corte da clareira':'Guardião — golpe de musgo',phases:B.phaseIds(),steps:[
    B.step('motion',{motion:'idle',duration:8,phase:'prepare'}),
    B.step('motion',{motion:'attack',duration:kind==='actors'?32:48,concurrent:true,phase:'execute'}),
    B.step('move',{anchor:'approach',x:-2.2,duration:kind==='actors'?14:22,face:'target',phase:'execute'}),
    B.step('animation',{animationSource:'action',role:'allTargets',phase:'execute'}),
    B.step('impact',{role:'allTargets',phase:'execute'}),B.step('wait',{duration:kind==='actors'?48:32,phase:'execute'}),
    B.step('move',{anchor:'home',duration:20,phase:'return'}),B.step('motion',{motion:'idle',duration:0,phase:'finish'})]});
  }
  data['ActionSequences.json']=sequences;return data;
 }
 function addNativeMedievalRtp(data){
  const characters=data['System.json']?.dianaSpriteAnimations?.characters;
  if(characters)characters.$Brann={columns:6,rows:4,anchor:{x:.5,y:1},animations:{walk:walkAnimation([2,0,1,5,3,4],8)}};
  const add=(key,value)=>{if(Array.isArray(data[key]))data[key][value.id]=value;};
  add('Actors.json',{id:2,name:'Brann',nickname:'Escudeiro do Vale',classId:1,initialLevel:1,maxLevel:99,profile:'Um defensor paciente da Vila da Clareira.',characterName:'$Brann',characterIndex:0,faceName:'ClareiraRostos',faceIndex:6,battlerName:'BrannMedieval',equips:[0,0,0,0,0],traits:[],note:'[DianaRTP:Medieval]'});
  add('Enemies.json',{id:2,name:'Lobo Cinzento',battlerName:'LoboCinza',battlerHue:0,params:[95,0,16,9,8,8,16,8],exp:16,gold:7,dropItems:[],actions:[{skillId:1,conditionType:0,conditionParam1:0,conditionParam2:0,rating:5}],traits:[],note:'[DianaRTP:Medieval]'});
  add('Enemies.json',{id:3,name:'Musgo Vivo',battlerName:'MusgoVivo',battlerHue:0,params:[120,0,12,16,12,14,7,8],exp:20,gold:9,dropItems:[],actions:[{skillId:3,conditionType:0,conditionParam1:0,conditionParam2:0,rating:5}],traits:[],note:'[DianaRTP:Medieval]'});
  add('Enemies.json',{id:4,name:'Bruxa Cinzenta',battlerName:'BruxaCinza',battlerHue:0,params:[105,40,10,8,23,18,12,14],exp:30,gold:16,dropItems:[],actions:[{skillId:7,conditionType:0,conditionParam1:0,conditionParam2:0,rating:5}],traits:[],note:'[DianaRTP:Medieval]'});
  add('Enemies.json',{id:5,name:'Guardião da Raiz Antiga',battlerName:'GuardiaoRaiz',battlerHue:0,params:[260,35,22,24,16,20,10,12],exp:52,gold:28,dropItems:[{kind:1,dataId:1, denominator:3}],actions:[{skillId:3,conditionType:0,conditionParam1:0,conditionParam2:0,rating:5}],traits:[],note:'[DianaRTP:Medieval]'});
  add('Troops.json',{id:2,name:'Fauna da Clareira',members:[{enemyId:2,x:300,y:350,hidden:false}],pages:[],note:'[DianaRTP:Medieval]'});
  add('Troops.json',{id:5,name:'Vigia da Raiz',members:[{enemyId:5,x:520,y:340,hidden:false}],pages:[],note:'[DianaRTP:Medieval]'});
  for(const actor of [data['Actors.json'][2],...data['Enemies.json'].slice(2)])if(actor)actor.traits=[{code:22,dataId:0,value:1}];
  const skill=(id,name,animationId,formula,note)=>({id,name,iconIndex:id,description:'Técnica nativa Medieval.',stypeId:1,scope:1,occasion:1,mpCost:4,tpCost:0,tpGain:0,hitType:2,animationId,speed:0,successRate:100,repeats:1,requiredWtypeId1:0,requiredWtypeId2:0,messageType:1,message1:'',message2:'',effects:[],damage:{type:1,elementId:0,formula,variance:10,critical:false},note});
  add('Skills.json',skill(3,'Corte de Carvalho',1,'Math.max(1,a.atk*2-b.def)','[DianaEffect:EfeitoCorte]'));
  add('Skills.json',skill(4,'Brasa Clara',3,'Math.max(1,a.mat*2-b.mdf)','[DianaEffect:EfeitoFogo]'));
  add('Skills.json',skill(5,'Onda Serena',4,'Math.max(1,a.mat*2-b.mdf)','[DianaEffect:EfeitoAgua]'));
  add('Skills.json',skill(6,'Estilhaço de Gelo',5,'Math.max(1,a.mat*2-b.mdf)','[DianaEffect:EfeitoGelo]'));
  add('Skills.json',skill(7,'Faísca do Círculo',6,'Math.max(1,a.mat*2-b.mdf)','[DianaEffect:EfeitoRaio]'));
  add('Skills.json',skill(8,'Selo Arcano',7,'Math.max(1,a.mat*2-b.mdf)','[DianaEffect:EfeitoArcano]'));
  add('Items.json',{id:1,name:'Poção da Clareira',iconIndex:1,description:'Restaura 50 PV.',consumable:true,itypeId:1,occasion:0,scope:7,repeats:1,successRate:100,tpGain:0,hitType:0,animationId:2,damage:{type:0,elementId:0,formula:'0',variance:0,critical:false},effects:[{code:11,dataId:0,value1:0,value2:50}],note:'[DianaEffect:EfeitoImpacto]'});
  // Native MV animation cells are consumed by editor and runtime.
  for(const [id,name] of [[1,'Corte'],[2,'Impacto'],[3,'Fogo'],[4,'Agua'],[5,'Gelo'],[6,'Raio'],[7,'Arcano']])add('Animations.json',{
   id,name:'Clareira — '+name,animation1Name:'Efeito'+name,animation1Hue:0,animation2Name:'',animation2Hue:0,position:1,
   frames:Array.from({length:5},(_,i)=>[[i,0,0,100,0,false,255,1]]),timings:[]
  });
  const adventurer=data['Classes.json']?.[1];if(adventurer){
   adventurer.traits.push({code:41,dataId:1,value:1});
   adventurer.learnings.push(...[3,4,5,6,7,8].map(skillId=>({level:1,skillId,note:''})));
  }
  const settings=data['BattlePresentation.json'];if(!settings)return;
  const nativeGraphic=(name,folder)=>{
   const animation=(row,speed,loop)=>({frames:Array.from({length:6},(_,column)=>row*6+column),speed,loop});
   const spriteAnimation={version:1,columns:6,rows:6,anchor:{x:.5,y:1},animations:{idle:animation(0,10,true),attack:animation(1,6,false),damage:animation(2,8,false),guard:animation(3,10,true),victory:animation(4,8,'once'),dead:animation(5,10,'once')}};
   const motions={};for(const motion of ['input','ready','entry','wait','moving','escape','victory'])motions[motion]={pose:motion==='victory'?'victory':'idle'};
   for(const motion of ['attack','punch','swing','thrust','missile','skill','item','cast','spell'])motions[motion]={pose:'attack'};
   Object.assign(motions,{damage:{pose:'damage'},guard:{pose:'guard'},dying:{pose:'dead'},dead:{pose:'dead'},abnormal:{pose:'damage'},sleep:{pose:'damage'}});
   return {mode:'static',name,folder,scale:1,spriteAnimation,motions};
  };
  // Preserve Liora's illustrated poses and sequence; RTP adds alternatives only.
  settings.actors[2]={graphic:nativeGraphic('BrannMedieval','sv_actors')};
  for(const [id,name] of [[2,'LoboCinza'],[3,'MusgoVivo'],[4,'BruxaCinza']])settings.enemies[id]={graphic:nativeGraphic(name,'enemies')};
  settings.enemies[5]={graphic:{mode:'static',name:'GuardiaoRaiz',folder:'enemies',scale:1,spriteAnimation:{version:1,columns:4,rows:4,anchor:{x:.5,y:1},animations:{idle:{frames:[0,1,2,3],speed:10,loop:true},attack:{frames:[4,5,6,7],speed:6,loop:false},damage:{frames:[8,9,10,11],speed:8,loop:false},guard:{frames:[12,13,14,15],speed:10,loop:true}}},motions:{input:{pose:'idle'},ready:{pose:'idle'},wait:{pose:'idle'},moving:{pose:'idle'},attack:{pose:'attack'},punch:{pose:'attack'},swing:{pose:'attack'},thrust:{pose:'attack'},missile:{pose:'attack'},skill:{pose:'attack'},item:{pose:'attack'},damage:{pose:'damage'},guard:{pose:'guard'},dead:{pose:'damage'},dying:{pose:'damage'}}}};
  settings.skills={...(settings.skills||{}),3:{effect:{name:'EfeitoCorte',folder:'animations',columns:5,rows:1}},4:{effect:{name:'EfeitoFogo',folder:'animations',columns:5,rows:1}},5:{effect:{name:'EfeitoAgua',folder:'animations',columns:5,rows:1}},6:{effect:{name:'EfeitoGelo',folder:'animations',columns:5,rows:1}},7:{effect:{name:'EfeitoRaio',folder:'animations',columns:5,rows:1}},8:{effect:{name:'EfeitoArcano',folder:'animations',columns:5,rows:1}}};
  settings.items={...(settings.items||{}),1:{effect:{name:'EfeitoImpacto',folder:'animations',columns:5,rows:1}}};
 }
 function completeStarter(data,B){
  const settings=data['BattlePresentation.json'],system=data['System.json'];if(!settings||!system)return;
  Object.assign(system,{partyMembers:[1,2],title1Name:'BosqueClareira',title2Name:'',optDrawTitle:true});
  system.weaponTypes=['','Espada'];system.armorTypes=['','Equipamento da Clareira'];system.equipTypes=['','Arma','Escudo','Cabeça','Corpo','Acessório'];
  data['Weapons.json']=[null,{id:1,name:'Espada da Clareira',description:'Lâmina de treino, usada também para aparar golpes.',iconIndex:3,wtypeId:1,etypeId:1,price:80,params:[0,0,5,0,0,0,0,0],traits:[],animationId:1,note:''}];
  data['Armors.json']=[null,{id:1,name:'Escudo do Vale',description:'Protege o portador e muda sua pose de defesa.',iconIndex:4,atypeId:1,etypeId:2,price:60,params:[0,0,0,5,0,2,0,0],traits:[],note:''},{id:2,name:'Traje de viagem',description:'Roupa resistente para explorar a clareira.',iconIndex:5,atypeId:1,etypeId:4,price:40,params:[0,0,0,2,0,1,0,0],traits:[],note:''}];
  data['Actors.json'][1].equips=[1,0,0,2,0];data['Actors.json'][2].equips=[1,1,0,2,0];
  const traits=data['Classes.json']?.[1]?.traits;if(traits)traits.push({code:51,dataId:1,value:1},{code:52,dataId:1,value:1});
  const potion=data['Items.json'][1];potion.price=15;data['Items.json'][2]={...JSON.parse(JSON.stringify(potion)),id:2,name:'Éter da Clareira',iconIndex:6,price:25,description:'Restaura 20 PM.',effects:[{code:12,dataId:0,value1:0,value2:20}]};
  data['Items.json'][3]={...JSON.parse(JSON.stringify(potion)),id:3,name:'Tônico do Vale',iconIndex:7,price:30,description:'Restaura um quarto dos PV máximos.',effects:[{code:11,dataId:0,value1:.25,value2:0}]};
  for(const [id,name,enemies] of [[3,'Musgos do bosque',[3]],[4,'O círculo da bruxa',[4,2]]])data['Troops.json'][id]={id,name,members:enemies.map((enemyId,i)=>({enemyId,x:220+i*160,y:350+i*35,hidden:false})),pages:[],note:''};
  const defense=row=>{const block={frames:[0,1,2,3,4,5].map(i=>row*6+i),speed:10,loop:true};return {mode:'static',name:'DefesaClareira',folder:'sv_actors',spriteAnimation:{version:1,columns:6,rows:4,anchor:{x:.5,y:1},animations:{idle:{...block},guard:block}}};};
  for(const [id,row] of [[1,0],[2,2]])if(settings.actors[id]?.graphic){settings.actors[id].graphic.guardGraphics={weapon:defense(row),shield:defense(row+1)};settings.actors[id].graphic.motions.item={pose:'idle'};}
   settings.screen2d||={};settings.screen2d.actorHomes={...settings.screen2d.actorHomes,0:{x:430,y:400},1:{x:650,y:420}};
  // Defensive and item actions must not inherit an attack approach/turn sequence.
  if(B&&data['ActionSequences.json']){
   const sequences=data['ActionSequences.json'];const assign=(kind,id,name,motion)=>{const sequenceId=sequences.length;sequences.push({id:sequenceId,version:1,name,phases:B.phaseIds(),steps:[B.step('motion',{motion,duration:12,phase:'prepare'}),B.step('impact',{role:'allTargets',phase:'execute'}),B.step('wait',{duration:12,phase:'finish'})]});settings[kind][id]={...settings[kind][id],mode:'sequence',sequenceId};};
   if(settings.actors[2]?.graphic&&sequences[1]){const sequenceId=sequences.length;sequences.push({...JSON.parse(JSON.stringify(sequences[1])),id:sequenceId,name:'Brann — investida da clareira'});settings.actors[2]={...settings.actors[2],mode:'sequence',sequenceId};}
   assign('skills',2,'Defender — manter a frente e bloquear','guard');for(const id of [1,2,3])assign('items',id,'Usar '+data['Items.json'][id].name,'item');
  }
  const map=data['Map001.json'];if(map){
   const page=JSON.parse(JSON.stringify(map.events[1].pages[0]));Object.assign(page,{image:{tileId:0,characterName:'',characterIndex:0,direction:2,pattern:1},priorityType:0,through:true,trigger:3});
   const commands=[{code:125,indent:0,parameters:[0,0,100]},...[ [1,5],[2,3],[3,2] ].map(([id,count])=>({code:126,indent:0,parameters:[id,0,0,count]})),{code:128,indent:0,parameters:[1,0,0,1,false]},{code:123,indent:0,parameters:['A',0]},{code:0,indent:0,parameters:[]}];page.list=commands;
   const finished=JSON.parse(JSON.stringify(page));finished.conditions={...finished.conditions,selfSwitchValid:true,selfSwitchCh:'A'};finished.trigger=0;finished.list=[{code:0,indent:0,parameters:[]}];
   map.events[13]={id:13,name:'Suprimentos iniciais — uma única vez',note:'[DianaStarterSupplies:1]',x:20,y:30,pages:[page,finished]};
   const merchant=map.events[7]?.pages[0];if(merchant)merchant.list=[{code:101,indent:0,parameters:['',0,0,2]},{code:401,indent:0,parameters:['Poções, éter e equipamento para a viagem. O escudo muda sua defesa!']},{code:302,indent:0,parameters:[0,1,0,0,false]},{code:605,indent:0,parameters:[0,2,0,0]},{code:605,indent:0,parameters:[2,1,0,0]},{code:0,indent:0,parameters:[]}];
  }
  const arena=data['Map003.json'];if(arena){for(const [id,troopId,x,name] of [[3,2,10,'Treino com o lobo'],[4,3,21,'Musgos do bosque'],[5,4,25,'Desafio da bruxa']]){const e=JSON.parse(JSON.stringify(arena.events[1]));Object.assign(e,{id,name,x,y:17});e.pages[0].list=[{code:101,indent:0,parameters:['',0,0,2]},{code:401,indent:0,parameters:[name+' — Liora e Brann, preparem suas defesas e poções.']},{code:301,indent:0,parameters:[0,troopId,true,true]},{code:0,indent:0,parameters:[]}];arena.events[id]=e;}}
 }
 function installProject(manager,target){
  const fs=manager.fs,path=manager.path,pack=path.join(manager.getRuntimePath(),'..','editor','diana-assets','jrpg-test');
  const files=['System.json','Actors.json','Enemies.json','Troops.json','Map001.json','MapInfos.json','Tilesets.json','BattlePresentation.json','Skills.json','Items.json','Animations.json','Classes.json','Weapons.json','Armors.json'];const data={};
  for(const name of files)data[name]=JSON.parse(fs.readFileSync(path.join(target,'data',name),'utf8'));
  populate(data,root.ReactorBattleData);addNativeMedievalRtp(data);completeStarter(data,root.ReactorBattleData);
  root.DianaVillageExpansion?.completeStarter(data,root.ReactorBattleData);
  root.DianaRTPExpansion?.completeStarter(data,root.ReactorBattleData);
  root.DianaArtLibrary?.populate(data);
  if(root.DianaCombatModes)data['System.json'].dianaCombat||=root.DianaCombatModes.defaults();
  // Reuse the visual author's line/page contract so starter dialogue never clips.
  const author=root.DianaClassicEditor||(typeof require==='function'?require('./DianaClassicEditor.js'):null);
  for(const [name,map] of Object.entries(data))if(/^Map\d+\.json$/.test(name))for(const event of map.events.filter(Boolean))for(const page of event.pages){
   const list=[];for(let i=0;i<page.list.length;i++){
    const command=page.list[i];if(command.code!==101){list.push(command);continue;}
    const lines=[];while(page.list[i+1]?.code===401)lines.push(page.list[++i].parameters[0]);
    const [face,index,background,position]=command.parameters;
    for(const item of author.textCommands(lines.join('\n'),face,index).slice(0,-1)){item.indent=command.indent;if(item.code===101)item.parameters=[face,index,background,position];list.push(item);}
   }page.list=list;
  }
  for(const [name,value] of Object.entries(data))manager._writeFileAtomic(fs,path.join(target,'data',name),JSON.stringify(value,null,2),'utf8');
  for(const folder of fs.readdirSync(path.join(pack,'img'))){const dest=path.join(target,'img',folder);fs.mkdirSync(dest,{recursive:true});for(const name of fs.readdirSync(path.join(pack,'img',folder)))fs.copyFileSync(path.join(pack,'img',folder,name),path.join(dest,name));}
  const nativePack=path.join(manager.getRuntimePath(),'..','editor','diana-assets','rtp-medieval');
  for(const folder of fs.readdirSync(path.join(nativePack,'img'))){const dest=path.join(target,'img',folder);fs.mkdirSync(dest,{recursive:true});for(const name of fs.readdirSync(path.join(nativePack,'img',folder)))fs.copyFileSync(path.join(nativePack,'img',folder,name),path.join(dest,name));}
  fs.copyFileSync(path.join(nativePack,'manifest.json'),path.join(target,'diana-rtp-manifest.json'));
  fs.copyFileSync(path.join(nativePack,'LICENSE'),path.join(target,'RTP_LICENSE.txt'));
  const artPack=path.join(manager.getRuntimePath(),'..','editor','diana-assets','art-library-v2');
  if(fs.existsSync(artPack)){for(const folder of fs.readdirSync(path.join(artPack,'img'))){const dest=path.join(target,'img',folder);fs.mkdirSync(dest,{recursive:true});for(const name of fs.readdirSync(path.join(artPack,'img',folder)))fs.copyFileSync(path.join(artPack,'img',folder,name),path.join(dest,name));}fs.copyFileSync(path.join(artPack,'manifest.json'),path.join(target,'diana-art-library-v2-manifest.json'));fs.copyFileSync(path.join(artPack,'LICENSE'),path.join(target,'ART_LIBRARY_V2_LICENSE.txt'));fs.copyFileSync(path.join(artPack,'GENERATION.md'),path.join(target,'ART_LIBRARY_V2_GENERATION.md'));}
  const defensePack=path.join(manager.getRuntimePath(),'..','editor','diana-assets','defense');
  for(const folder of fs.readdirSync(path.join(defensePack,'img'))){const dest=path.join(target,'img',folder);fs.mkdirSync(dest,{recursive:true});for(const name of fs.readdirSync(path.join(defensePack,'img',folder)))fs.copyFileSync(path.join(defensePack,'img',folder,name),path.join(dest,name));}
  fs.copyFileSync(path.join(defensePack,'manifest.json'),path.join(target,'diana-defense-manifest.json'));
  if(root.DianaRTPExpansion){const vehicles=path.join(manager.getRuntimePath(),'..','editor','diana-assets','vehicles');for(const file of fs.readdirSync(path.join(vehicles,'img','characters')))fs.copyFileSync(path.join(vehicles,'img','characters',file),path.join(target,'img','characters',file));fs.copyFileSync(path.join(vehicles,'manifest.json'),path.join(target,'diana-vehicles-manifest.json'));}
  if(root.DianaVillageExpansion){const village=path.join(manager.getRuntimePath(),'..','editor','diana-assets','village');for(const file of fs.readdirSync(path.join(village,'img','tilesets')))fs.copyFileSync(path.join(village,'img','tilesets',file),path.join(target,'img','tilesets',file));fs.copyFileSync(path.join(village,'manifest.json'),path.join(target,'diana-village-manifest.json'));}
  fs.copyFileSync(path.join(pack,'manifest.json'),path.join(target,'diana-asset-pack.json'));
  fs.copyFileSync(path.join(pack,'LICENSE'),path.join(target,'ASSET_LICENSE.txt'));
 }
 root.DianaJRPGSample={populate,addNativeMedievalRtp,completeStarter,installProject};if(typeof module!=='undefined')module.exports=root.DianaJRPGSample;
})(globalThis);
