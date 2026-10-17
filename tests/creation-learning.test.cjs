'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const recipes=require('../src/DianaEventRecipes.js'),library=require('../src/DianaReferenceLibrary.js');
const data={items:[null,{id:1,name:'Erva'},{id:2,name:'Poção'}],system:{variables:['','Contagem de fabricação']}};
const options={itemId:1,productId:2,amount:3,variableId:1,gold:20,name:'Entrega',x:2,y:2};
function runtime(){
 const inventory={1:0,2:0},variables={},self={},messages=[];let gold=0;
 const context={console,$dataItems:data.items,$gameSystem:{},ImageManager:{loadFace(){}},$gameMap:{mapId:()=>1},$gameVariables:{value:id=>variables[id]||0,setValue:(id,v)=>variables[id]=v},$gameSelfSwitches:{value:key=>!!self[key],setValue:(key,v)=>self[key]=v},$gameParty:{numItems:item=>inventory[item.id]||0,gainItem:(item,v)=>inventory[item.id]=(inventory[item.id]||0)+v,gainGold:v=>gold+=v},$gameMessage:{isBusy:()=>false,setFaceImage(){},setBackground(){},setPositionType(){},setSpeakerName(){},add:message=>messages.push(message)}};
 vm.createContext(context);vm.runInContext('Math.randomInt = () => 0;',context);
 const root=process.env.DIANA_BATTLE_SOURCE||path.join(__dirname,'../build/diana');
 vm.runInContext(fs.readFileSync(path.join(root,'runtime/reactor_objects_interpreter.js'),'utf8'),context);
 const run=page=>{const interpreter=new context.Game_Interpreter();interpreter.setup(page.list,4);let steps=0;while(interpreter.currentCommand()){assert.ok(++steps<100,'evento termina');assert.notEqual(interpreter.executeCommand(),false);}return interpreter;};
 return {inventory,variables,self,messages,run,get gold(){return gold;}};
}
test('entrega e fabricação executam comandos do runtime real, incluindo estoque insuficiente e conclusão',()=>{
 const r=runtime(),delivery=recipes.compile('delivery',options,data);
 r.inventory[1]=2;r.run(delivery[0]);assert.equal(r.gold,0);assert.equal(r.inventory[1],2);assert.equal(r.self['1,4,A'],undefined);
 r.inventory[1]=5;r.run(delivery[0]);assert.equal(r.gold,20);assert.equal(r.inventory[1],2);assert.equal(r.self['1,4,A'],true);
 r.run(delivery[1]);assert.equal(r.gold,20,'página concluída não recompensa novamente');
 const craft=recipes.compile('craft',options,data);r.run(craft[0]);assert.equal(r.inventory[2],0);
 r.inventory[1]=6;r.run(craft[0]);r.run(craft[0]);assert.equal(r.inventory[1],0);assert.equal(r.inventory[2],2);assert.equal(r.variables[1],3);
});
test('coleta grava switch local e usa página esgotada sem duplicar itens',()=>{
 const r=runtime(),pages=recipes.compile('gather',options,data);r.run(pages[0]);assert.equal(r.inventory[1],3);assert.equal(r.self['1,4,A'],true);r.run(pages[1]);assert.equal(r.inventory[1],3);
 const restored=JSON.parse(JSON.stringify({inventory:r.inventory,self:r.self}));assert.equal(restored.self['1,4,A'],true,'estado usa os campos nativos persistidos');
});
test('modelos rejeitam parâmetros inválidos e nunca geram scripts arbitrários',()=>{
 for(const input of [{...options,amount:0},{...options,amount:1.5},{...options,itemId:999},{...options,variableId:0},{...options,gold:Infinity}])assert.throws(()=>recipes.compile('delivery',input,data));
 assert.throws(()=>recipes.compile('craft',{...options,productId:1},data));
 for(const recipe of recipes.recipes){const values={...options,first:'Sim',second:'Não',firstReply:'Bem-vindo!',secondReply:'Até logo!'};const pages=recipes.compile(recipe.id,values,data);assert.ok(pages.every(page=>page.list.at(-1).code===0));assert.ok(pages.every(page=>page.list.every(c=>![355,655,357].includes(c.code))));}
});
test('inserção usa transação de evento existente e recusa troca de mapa, ocupação e posição inválida',()=>{
 const map={width:10,height:10},manager={currentMap:map,getEventAt:()=>null,makeDefaultEventPage:p=>p,makeQuickEvent:(x,y,name,pages)=>({id:4,x,y,name,pages}),commitQuickEvent:e=>{manager.committed=e;return true;}};
 const app={eventManager:manager,databaseManager:{data},projectController:{tilemapManager:{currentMap:map}}};
 const event=recipes.insert(app,map,'delivery',options);assert.equal(event,manager.committed);assert.equal(event.pages.length,2);
 assert.throws(()=>recipes.insert(app,{},'delivery',options),/mapa mudou/);assert.throws(()=>recipes.insert(app,map,'gather',{...options,x:-1}),/Posição/);
 manager.getEventAt=()=>event;assert.throws(()=>recipes.insert(app,map,'gather',options),/existe/);
});
test('índice local preserva nomes sem URL, filtra por assunto e não permite links executáveis',()=>{
 const rows=library.parse(['{"title":"Animação da floresta","category":"Sprites","urls":["https://example.com/art","javascript:alert(1)"]}','{"title":"QuestSystem.js","category":"MV Plugins (Complete)","urls":[]}'].join('\n'));
 assert.equal(rows[0].urls.length,1);assert.equal(library.search(rows,{query:'animacao floresta',topic:'art'}).total,1);assert.equal(library.search(rows,{query:'quest',category:'Sprites'}).total,0);assert.equal(library.search(rows,{query:'quest'}).rows[0].urls.length,0);
 for(const value of ['javascript:alert(1)','file:///C:/secret','https://user:password@example.com','data:text/html,hello'])assert.equal(library.safeUrl(value),null);
 const catalog=library.parse(fs.readFileSync(path.join(__dirname,'../.diana-ai/references/rpgmaker-resources.ndjson'),'utf8'));assert.equal(catalog.length,13859);assert.equal(new Set(catalog.map(e=>e.category)).size,30);assert.ok(library.search(catalog,{query:'fishing',limit:10}).total>0);
});
