'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const kit=require('../src/DianaTileKit.js');
const directions=[[0,1,1,8],[-1,0,2,4],[1,0,4,2],[0,-1,8,1]];
function fixture(populate=kit.populate){
 const map={},tiles={flags:Array(8192).fill(0)};populate(map,tiles);return {map,tiles};
}
function tile(map,x,y,z=0){return map.data[(z*map.height+y)*map.width+x];}
// Native checkPassage order: upper layers first, skip star tiles, first
// non-star tile decides. Movement checks both ends, including reverse flags.
function passage({map,tiles},x,y,bit){
 if(x<0||y<0||x>=map.width||y>=map.height)return false;
 for(let z=3;z>=0;z--){const id=tile(map,x,y,z);if(id===0)continue;const flag=tiles.flags[id];if(flag&16)continue;return (flag&bit)===0;}
 return false;
}
function flood(f,start,occupied=new Set()){
 const key=(x,y)=>`${x},${y}`,seen=new Set([key(...start)]),queue=[start];
 for(let i=0;i<queue.length;i++){
  const [x,y]=queue[i];for(const [dx,dy,bit,reverse] of directions){
   const nx=x+dx,ny=y+dy,k=key(nx,ny);
   if(!seen.has(k)&&!occupied.has(k)&&passage(f,x,y,bit)&&passage(f,nx,ny,reverse)){seen.add(k);queue.push([nx,ny]);}
  }
 }
 return seen;
}
function walkable(f,x,y){return directions.every(([, ,bit])=>passage(f,x,y,bit));}
test('vila 48x40 preserva acessos e conecta praça, portas e novos caminhos',()=>{
 const f=fixture(),{map}=f;assert.equal(map.width,48);assert.equal(map.height,40);assert.equal(map.data.length,map.width*map.height*6);
 const reached=flood(f,[20,30]);
 for(let y=0;y<map.height;y++)for(let x=0;x<map.width;x++){
  const ground=tile(map,x,y);
  if(ground>=1544&&ground<1560&&walkable(f,x,y))assert.ok(reached.has(`${x},${y}`),`estrada conectada ${x},${y}`);
 }
 for(const [x,y] of [[20,33],[23,24],[27,9],[10,9],[18,25],[26,12],[30,24],[16,13],[7,20],[20,26],[18,24],[27,10],[10,10],[1,18],[6,18],[41,18],[41,33],[9,33]]){
  assert.ok(walkable(f,x,y),`piso livre em ${x},${y}`);assert.ok(reached.has(`${x},${y}`),`acesso desde início a ${x},${y}`);
 }
 // Both triggers sit on the illustrated doorway, bounded by solid facade.
 for(const [x,y] of [[10,9],[27,9]]){
  const house=kit.objects.house;
  assert.equal(tile(map,x,y,2),kit.objectTileId(house,house.x+1,house.y+3));
  assert.equal(walkable(f,x-1,y),false);assert.equal(walkable(f,x+1,y),false);
  assert.equal(walkable(f,x,y-1),false);assert.ok(reached.has(`${x},${y+1}`));
 }
});
test('NPCs continuam abordáveis quando seus eventos bloqueiam o próprio tile',()=>{
 const f=fixture(),npcs=[[18,25],[26,12],[30,24],[16,13],[7,20],[20,26]],occupied=new Set(npcs.map(p=>p.join(',')));
 const reached=flood(f,[20,30],occupied);
 for(const [x,y] of npcs)assert.ok(directions.some(([dx,dy,bit,reverse])=>reached.has(`${x+dx},${y+dy}`)&&passage(f,x,y,bit)&&passage(f,x+dx,y+dy,reverse)),`interação adjacente ${x},${y}`);
 for(const p of [[20,33],[23,24],[27,9],[10,9]])assert.ok(reached.has(p.join(',')),`transferência sem atravessar NPC ${p}`);
});
test('eventos e destinos reais do projeto usam pisos acessíveis nos cinco mapas',()=>{
 const {populate:starter}=require('../src/DianaStarterData.js'),{populate}=require('../src/DianaJRPGSample.js');
 const B=require('../upstream/RPGReactor/editor/src/battle/BattleData.js');
 const data=populate(starter({'System.json':{terms:{}},'MapInfos.json':[null,{id:1}],
  'Map001.json':{width:17,height:13,data:Array(17*13*6).fill(0),events:[null]},
  'Tilesets.json':[null,{tilesetNames:[],flags:Array(8192).fill(0)}]}),B);
 const tiles=data['Tilesets.json'][1],system=data['System.json'];
 const starts={1:[system.startX,system.startY],2:[3,20],3:[16,22],4:[10,13],5:[10,13]};
 for(const [id,start] of Object.entries(starts)){
  const map=data[`Map${id.padStart(3,'0')}.json`],f={map,tiles},reached=flood(f,start);
  for(const event of map.events.filter(Boolean)){
   assert.ok(walkable(f,event.x,event.y),`${id}: evento ${event.name} em piso livre`);
   assert.ok(reached.has(`${event.x},${event.y}`),`${id}: evento ${event.name} acessível`);
   for(const page of event.pages)for(const command of page.list)if(command.code===201){
    const [mode,target,x,y]=command.parameters;assert.equal(mode,0,'transferência direta');
    const dest={map:data[`Map${String(target).padStart(3,'0')}.json`],tiles};
    assert.ok(walkable(dest,x,y),`${event.name}: chegada livre ${target}:${x},${y}`);
    assert.ok(flood(dest,starts[target]).has(`${x},${y}`),`${event.name}: chegada conectada`);
   }
  }
 }
});
test('rio bloqueia travessia fora da ponte; copas não anulam troncos nem água',()=>{
 const f=fixture();
 for(let x=2;x<=5;x++)for(let y=0;y<f.map.height;y++)assert.equal(walkable(f,x,y),y>=17&&y<=19,`rio/ponte ${x},${y}`);
 const noBridge=fixture();for(let x=2;x<=5;x++)for(let y=17;y<=19;y++){noBridge.map.data[y*noBridge.map.width+x]=kit.terrain.water;noBridge.map.data[2*noBridge.map.width*noBridge.map.height+y*noBridge.map.width+x]=0;}
 assert.equal(flood(noBridge,[20,30]).has('1,18'),false);
 const tree=kit.objects.tree;assert.equal(f.tiles.flags[kit.objectTileId(tree,tree.x,tree.y)],16);
 assert.equal(walkable(f,6,3),false); // trunk of northern tree
 assert.equal(walkable(f,17,25),false); // relocated lamp
 assert.equal(walkable(f,8,22),false); // relocated fisherman's rock
});
for(const [name,populate,targets] of [
 ['hospedaria',kit.populateInn,[[16,5]]],['casa',kit.populateCottage,[[15,7]]]
])test(`${name}: saída e leitura alcançáveis, paredes e móveis sólidos`,()=>{
 const f=fixture(populate),{map}=f,reached=flood(f,[10,13]);
 for(const p of [[10,13],...targets])assert.ok(reached.has(p.join(',')),`acesso ${p}`);
 for(let x=0;x<map.width;x++)for(const y of [0,map.height-1]){assert.equal(walkable(f,x,y),false);assert.equal(reached.has(`${x},${y}`),false);}
 for(let y=0;y<map.height;y++)for(const x of [0,map.width-1]){assert.equal(walkable(f,x,y),false);assert.equal(reached.has(`${x},${y}`),false);}
 for(let y=1;y<map.height-1;y++)for(let x=1;x<map.width-1;x++)if(tile(map,x,y,2)!==0)assert.equal(walkable(f,x,y),false,`móvel sólido ${x},${y}`);
});
