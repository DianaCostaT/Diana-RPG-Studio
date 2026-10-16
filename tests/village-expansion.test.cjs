'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {populate:starter}=require('../src/DianaStarterData.js'),sample=require('../src/DianaJRPGSample.js'),village=require('../src/DianaVillageExpansion.js');
const B=require('../upstream/RPGReactor/editor/src/battle/BattleData.js');
function fixture(){
 const data=starter({'System.json':{terms:{}},'MapInfos.json':[null,{id:1}],'Map001.json':{width:17,height:13,data:Array(17*13*6).fill(0),events:[null]},'Tilesets.json':[null,{tilesetNames:Array(9).fill(''),flags:Array(8192).fill(0)}]});
 sample.populate(data,B);return village.completeStarter(data,B);
}
function tile(map,x,y,z=0){return map.data[(z*map.height+y)*map.width+x];}
function passage(map,tiles,x,y,bit){
 if(x<0||y<0||x>=map.width||y>=map.height)return false;
 for(let z=3;z>=0;z--){const id=tile(map,x,y,z);if(!id)continue;const flag=tiles.flags[id];if(flag&16)continue;return !(flag&bit);}
 return false;
}
const directions=[[0,1,1,8],[-1,0,2,4],[1,0,4,2],[0,-1,8,1]];
function flood(map,tiles,start,occupied=new Set()){
 const seen=new Set([start.join(',')]),queue=[start];
 for(let index=0;index<queue.length;index++)for(const [dx,dy,bit,reverse] of directions){
  const [x,y]=queue[index],next=[x+dx,y+dy],key=next.join(',');
  if(!seen.has(key)&&!occupied.has(key)&&passage(map,tiles,x,y,bit)&&passage(map,tiles,next[0],next[1],reverse)){seen.add(key);queue.push(next);}
 }
 return seen;
}
function transferOf(event){return event.pages[0].list.find(item=>item.code===201)?.parameters;}
test('embute a vila original, desloca as referências de map1 e conserva seis camadas',()=>{
 const original=starter({'System.json':{terms:{}},'MapInfos.json':[null,{id:1}],'Map001.json':{width:17,height:13,data:Array(17*13*6).fill(0),events:[null]},'Tilesets.json':[null,{tilesetNames:Array(9).fill(''),flags:Array(8192).fill(0)}]});
 sample.populate(original,B);const before=original['Map001.json'],d=fixture(),map=d['Map001.json'],size=map.width*map.height;
 assert.deepEqual(map.dianaVillageOffset,{x:16,y:12});assert.equal(map.width,80);assert.equal(map.height,64);assert.equal(map.data.length,size*6);
 assert.deepEqual(map.dianaVillageFocus,{x:36,y:32});assert.equal(map.parallaxName,'!VilaClareiraExpandida');assert.equal(map.parallaxShow,true);
 assert.deepEqual(map.dianaClareiraPresentation.artRect,{x:20,y:16,width:32,height:32});assert.equal(d['Tilesets.json'][1].flags[254],0);assert.equal(d['Tilesets.json'][1].flags[255],15);
 assert.equal(d['Tilesets.json'][1].tilesetNames[8],'ClareiraArquitetura');
 assert.ok(require('node:fs').existsSync(require('node:path').join(__dirname,'../assets/village/pack/img/tilesets/ClareiraArquitetura.png')),'the expanded map references a packaged E page');
 for(let z=0;z<6;z++)for(const [x,y] of [[0,0],[47,0],[0,39],[47,39]])assert.equal(tile(map,x+16,y+12,z),before.data[z*48*40+y*48+x]);
 assert.equal(tile(map,40,46),254,'the starting path is collision-enabled but visually transparent');
 assert.deepEqual([d['System.json'].startX,d['System.json'].startY],[36,36]);
 const doors=map.events.filter(event=>event&&transferOf(event)?.[1]>=6&&transferOf(event)?.[1]<=9);assert.equal(doors.length,4);
 for(const door of doors){assert.equal(door.pages[0].trigger,1);assert.equal(door.pages[0].priorityType,1,'doors must respond to action from an adjacent tile');}
 for(const event of map.events.filter(event=>event&&event.id<=12))assert.ok(event.x>=16&&event.y>=12);
 for(const name of ['Map002.json','Map003.json','Map004.json','Map005.json'])for(const event of d[name].events.filter(Boolean))for(const page of event.pages)for(const item of page.list)if(item.code===201&&item.parameters[1]===1)assert.ok(item.parameters[2]>=16&&item.parameters[3]>=12);
});
test('distritos, portas, NPCs e retornos permanecem navegáveis por flags nativas',()=>{
 const d=fixture(),map=d['Map001.json'],tiles=d['Tilesets.json'][1],occupied=new Set(map.events.filter(Boolean).map(event=>[event.x,event.y].join(','))),reached=flood(map,tiles,[36,36],occupied);
 for(const event of map.events.filter(Boolean))assert.ok(directions.some(([dx,dy,bit,reverse])=>reached.has([event.x+dx,event.y+dy].join(','))&&passage(map,tiles,event.x,event.y,bit)&&passage(map,tiles,event.x+dx,event.y+dy,reverse)),event.name+' abordável');
 for(const id of [6,7,8,9]){const interior=d[mapName(id)],exit=transferOf(interior.events[1]);assert.equal(exit[1],1);assert.deepEqual(exit.slice(2,4),id===6?[10,10]:id===7?[50,10]:id===8?[70,28]:[52,55]);assert.equal(interior.data.length,20*16*6);assert.ok(flood(interior,tiles,[10,13]).has('10,13'));}
});
function mapName(id){return 'Map'+String(id).padStart(3,'0')+'.json';}
test('interiores oferecem cura, loja, leituras e baú único sem expor termos técnicos',()=>{
 const d=fixture(),maps=[6,7,8,9].map(id=>d[mapName(id)]);
 assert.equal(maps.length,4);
 assert.deepEqual(maps[0].events[2].pages[0].list.find(item=>item.code===314).parameters,[0,0]);
 assert.deepEqual(maps[1].events[2].pages[0].list.find(item=>item.code===302).parameters,[1,1,0,0,false]);
 assert.ok(maps[2].events[2].pages[0].list.some(item=>item.code===401));
 const chest=maps[3].events[2];assert.ok(chest.pages[0].list.some(item=>item.code===123));assert.equal(chest.pages[1].conditions.selfSwitchValid,true);
 for(const map of maps)for(const event of map.events.filter(Boolean))for(const page of event.pages)for(const item of page.list)if(item.code===401)assert.equal(item.parameters[0].includes('tile'),false);
});
