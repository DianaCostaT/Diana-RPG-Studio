'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {search}=require('../src/DianaEventSearch.js');
const maps=[{mapId:3,mapName:'Clareira',map:{events:[null,{id:2,name:'Guardiã da Clareira',x:4,y:8,pages:[{conditions:{switch1Valid:true,switch1Id:12,switch2Valid:false,variableValid:true,variableId:5}}]}]}},
 {mapId:8,mapName:'Interior',map:{events:[null,{id:1,name:'Baú antigo',x:1,y:2,pages:[{conditions:{switch1Valid:false,switch2Valid:true,switch2Id:12,variableValid:false}}]}]}}];
test('busca de eventos cobre nome sem diferenciar maiúsculas, mapa e coordenadas',()=>{
 assert.deepEqual(search(maps,{query:'GUARDIÃ'}),[{mapId:3,mapName:'Clareira',eventId:2,eventName:'Guardiã da Clareira',x:4,y:8,conditions:[{type:'switch',id:12},{type:'variable',id:5}]}]);
});
test('busca por switch e variável encontra todas as páginas e não altera mapas',()=>{
 const before=JSON.stringify(maps);assert.deepEqual(search(maps,{type:'switch',query:'12'}).map(x=>x.eventId),[2,1]);
 assert.equal(search(maps,{type:'variable',query:'5'}).length,1);assert.equal(search(maps,{type:'switch',query:'1'}).length,0);assert.equal(JSON.stringify(maps),before);
});
test('busca vazia não lista o projeto inteiro',()=>assert.deepEqual(search(maps,{query:'  '}),[]));
