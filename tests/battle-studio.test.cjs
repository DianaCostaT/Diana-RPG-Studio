'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {studioSteps}=require('../src/DianaBattle2D.js');
const B=require('../build/diana/editor/src/battle/BattleData.js');
const R=require('../build/diana/runtime/reactor_battle_data.js');
test('Battle Studio shortcuts save native steps and apply gameplay once',()=>{
 const entries=studioSteps();assert.equal(entries.length,15);
 for(const entry of entries)assert.ok(B.types.includes(entry.value));
 const attack=entries.find(e=>e.key==='studio:ATTACK'),damage=entries.find(e=>e.key==='studio:DAMAGE');
 assert.equal(attack.value,'motion');assert.equal(damage.value,'impact');
 assert.equal(studioSteps().filter(e=>e.value==='impact').length,1);
 attack.extra.motion='changed';assert.equal(studioSteps().find(e=>e.key==='studio:ATTACK').extra.motion,'attack');
});
test('prepared editor and runtime share simultaneous choreography for both combatant roles',()=>{
 for(const role of ['user','target']){
  const sequence={id:1,version:1,purpose:'routine',steps:[
   B.step('move',{role,duration:30,concurrent:true,moveMode:'position',anchor:'home',x:3,y:1,easing:'smooth'}),
   B.step('motion',{role,motion:'attack',duration:10}),B.step('wait',{role,duration:20}),
   B.step('move',{role,anchor:'home',duration:30,easing:'linear'})]};
  const context={homes:{user:{x:0,y:0,z:0},target:{x:8,y:0,z:0}},target:{x:8,y:0,z:0},direction:1};
  assert.deepEqual(B.validateSequence(sequence),[]);
  assert.deepEqual(B.timeline(sequence,context),R.timeline(sequence,context));
  for(const frame of [0,5,10,20,30,45,60])assert.deepEqual(B.evaluate(sequence,frame,context),R.evaluate(sequence,frame,context));
  const cues=B.timeline(sequence,context);assert.equal(cues[0].start,cues[1].start);assert.equal(B.duration(sequence,context),60);
 }
});
