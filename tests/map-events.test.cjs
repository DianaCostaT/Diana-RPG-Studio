'use strict';
// Contrato de dados compartilhado pelo editor e pelo runtime; não é teste de GUI.
const test=require('node:test'),assert=require('node:assert/strict');
const L=require('../upstream/RPGReactor/runtime/reactor_image_layers.js');
const E=require('../upstream/RPGReactor/editor/src/MapImageLayersEditor.js');
test('camadas criadas pelo editor sobrevivem JSON e preservam semântica no runtime',()=>{
 for(const choice of E.choices(false)){
  const stored=JSON.parse(JSON.stringify(E.make(choice.key,'Névoa azul')));
  assert.deepEqual(L.write(L.normalize(stored)),stored);
  assert.equal(L.drawn(L.normalize(stored),false),true);
 }
 const back=L.normalize({name:'Fundo',layer:'back',fit:'repeat',follow:.5,drift:[12,0]});
 const over=L.normalize({name:'Frente',layer:'over',fit:'repeat',drift:[-18,6]});
 assert.ok(L.depth(back,0)<L.depth(over,1));
 assert.notDeepEqual(L.origin(over,0,0,0,32,32,128,128),L.origin(over,1,0,0,32,32,128,128));
 assert.equal(L.origin(back,0,2,0,32,32,128,128).x,32);
});
test('switch e variável precisam satisfazer juntos a condição da camada',()=>{
 const layer=L.normalize({name:'Frente',layer:'over',switch:2,when:{variable:1,op:'>=',value:7}});
 assert.equal(L.shown(layer,false,7),false);
 assert.equal(L.shown(layer,true,6),false);
 assert.equal(L.shown(layer,true,7),true);
 assert.equal(L.shown(layer,true,8),true);
});
test('grade sólida respeita limites e células livres',()=>{
 const grid=new Uint8Array([0,1,1,0]);
 assert.equal(L.isSolidAt(grid,2,2,1,0),true);
 assert.equal(L.isSolidAt(grid,2,2,0,0),false);
 for(const [x,y] of [[-1,0],[2,0],[0,2]])assert.equal(L.isSolidAt(grid,2,2,x,y),false);
});
