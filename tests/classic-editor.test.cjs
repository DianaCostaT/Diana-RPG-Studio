'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {textCommands,insertDialogue,initialPosition}=require('../src/DianaClassicEditor.js');
test('diálogo divide linhas longas e páginas, mantendo texto e retrato',()=>{
 const text='Uma história da floresta que precisa de muitas linhas para caber sem cortar palavras.\n'+'a'.repeat(95),commands=textCommands(text,'Rostos',5);
 assert.ok(commands.filter(c=>c.code===101).length>1);for(const c of commands.filter(c=>c.code===401))assert.ok(Array.from(c.parameters[0]).length<=32);assert.deepEqual(commands[0].parameters,['Rostos',5,0,2]);assert.equal(commands.at(-1).code,0);
});
test('criação de NPC usa commit existente e recusa posição ocupada ou mapa alterado',()=>{
 const map={width:10,height:10},manager={currentMap:map,getEventAt:(x,y)=>x===2&&y===2,makeDefaultEventPage:o=>o,makeQuickEvent:(x,y,name,pages)=>({id:3,x,y,name,pages}),commitQuickEvent:event=>{manager.saved=event;return true;}};
 const input={name:'Guardião',x:1,y:1,text:'Olá!',character:'$Guardiao'};const e=insertDialogue(manager,map,input);assert.equal(e.pages[0].list[1].parameters[0],'Olá!');assert.equal(manager.saved,e);
 assert.throws(()=>insertDialogue(manager,map,{...input,x:2,y:2}),/existe/);assert.throws(()=>insertDialogue(manager,{},input),/mapa mudou/);assert.throws(()=>insertDialogue(manager,map,{...input,x:1.5}),/dentro/);
});
test('posição inicial evita eventos e o início do jogador',()=>{
 const map={width:4,height:4,events:[null,{x:1,y:2}]};const p=initialPosition({},map,{startX:1,startY:1});assert.notDeepEqual(p,{x:1,y:1});assert.notDeepEqual(p,{x:1,y:2});assert.equal(p.x>=0&&p.y>=0,true);
});
