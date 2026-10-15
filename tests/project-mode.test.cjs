'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {modeOf}=require('../src/DianaProjectMode.js');
const {poseNames}=require('../src/DianaBattle2D.js');
test('modo 2D explícito; projetos anteriores conservam acesso às ferramentas 3D',()=>{
 assert.equal(modeOf({diana:{mode:'2d'}}),'2d');assert.equal(modeOf({diana:{mode:'hybrid'}}),'hybrid');assert.equal(modeOf({}),'hybrid');
});
test('poses clássicas e personalizadas têm páginas ilimitadas sem alterar dados',()=>{
 const graphic={poses:Object.fromEntries(Array.from({length:70},(_,i)=>['personalizada'+i,{}]))},before=JSON.stringify(graphic);
 assert.equal(poseNames(graphic).length,82);assert.equal(JSON.stringify(graphic),before);assert.equal(poseNames({poses:{idle:{}}}).filter(n=>n==='idle').length,1);
});
test('runtime lê posições 2D, ajusta ao campo e rejeita dados inválidos',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const source=fs.readFileSync('build/diana/runtime/reactor_sprites.js','utf8');
 const body=source.match(/Sprite_Actor.prototype.setActorHome = function\(index\) \{([\s\S]*?)\n\};/)[1];
 const context={globalThis:{ReactorBattlePresentation:{settings:{screen2d:{actorHomes:{0:{x:510,y:280},1:{x:-10,y:250}}}}}},Sprite_Battler:{fieldPoint:(x,y)=>[x/2,y/2]}};
 const run=vm.runInNewContext('(function(index){'+body+'})',context),sprite={setHome(x,y){this.point=[x,y];}};
 run.call(sprite,0);assert.deepEqual(sprite.point,[255,140]);run.call(sprite,1);assert.deepEqual(sprite.point,[316,164]);
});
