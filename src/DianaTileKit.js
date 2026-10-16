/* Editable native tiles; shared by asset compilation and project authoring. */
(function(root){
 'use strict';
 const terrain={grass:1536,dirt:1537,water:1538,stone:1539,wood:1540,sand:1541,shade:1542,soil:1543};
 const objects={
  tree:{page:'B',x:0,y:1,width:3,height:4},house:{page:'B',x:4,y:1,width:4,height:4},well:{page:'B',x:8,y:1,width:2,height:2},
  bush:{page:'B',x:10,y:1,width:2,height:2},rock:{page:'B',x:12,y:1,width:2,height:2},flowers:{page:'B',x:14,y:1,width:1,height:1},
  lamp:{page:'B',x:15,y:1,width:1,height:2},fence:{page:'B',x:8,y:4,width:4,height:1},
  sign:{page:'C',x:0,y:0,width:1,height:1},market:{page:'C',x:1,y:0,width:3,height:2},innSign:{page:'C',x:4,y:0,width:1,height:1},
  counter:{page:'C',x:0,y:3,width:3,height:1},table:{page:'C',x:3,y:3,width:2,height:2},bed:{page:'C',x:5,y:3,width:2,height:3},
  shelf:{page:'C',x:7,y:3,width:2,height:2},
  shrine:{page:'D',x:0,y:0,width:6,height:7},bridge:{page:'D',x:8,y:0,width:4,height:3},
  pine:{page:'D',x:0,y:9,width:3,height:5},cliff:{page:'D',x:4,y:9,width:3,height:3},stump:{page:'D',x:8,y:9,width:2,height:2}
 };
 const tileId=(x,y)=>{
  if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>=16||y<0||y>=16)throw Error('Coordenada B inválida');
  return (x>=8?128:0)+y*8+x%8;
 };
 function objectTileId(object,x,y){return ({B:0,C:256,D:512}[object.page]||0)+tileId(x,y);}
 function configureFlags(tiles){
  for(let id=0;id<768;id++)tiles.flags[id]=16;
  for(const [name,o] of Object.entries(objects))for(let dy=0;dy<o.height;dy++)for(let dx=0;dx<o.width;dx++){
   // The canonical cottage's doorway occupies its second tile.
   tiles.flags[objectTileId(o,o.x+dx,o.y+dy)]=name==='flowers'||name==='sign'||name==='innSign'||name==='bridge'||name==='house'&&dx===1&&dy===3||name==='shrine'&&dy>=5&&dx>=2&&dx<=3?0:(name==='tree'||name==='pine')&&dy<o.height-1?16:15;
  }
  for(let id=1536;id<1576;id++)tiles.flags[id]=id===terrain.water||id===terrain.shade||id>=1560?15:0;
  for(let id=1576;id<1592;id++)tiles.flags[id]=0x0600;
 }
 function prepare(map,tiles,purpose,w=32,h=32){
  const size=w*h;
  Object.assign(map,{width:w,height:h,tilesetId:1,parallaxName:'',parallaxShow:false,note:'[DianaFixture:'+purpose+']',
   dianaFixture:{version:1,purpose,nativeTiles:{terrainPage:'ClareiraTerrenos',objectPage:'ClareiraObjetos',interiorPage:'ClareiraInteriores',tileSize:32}},data:Array(size*6).fill(0)});
  tiles.tilesetNames=Array(9).fill('');tiles.tilesetNames[4]='ClareiraTerrenos';tiles.tilesetNames[5]='ClareiraObjetos';tiles.tilesetNames[6]='ClareiraInteriores';tiles.tilesetNames[7]='ClareiraPaisagem';tiles.name='Clareira — vila, natureza e interiores editáveis';
  configureFlags(tiles);
  return {w,h,size,ground:Array(size).fill('grass')};
 }
 function setGround(state,x,y,type){if(x>=0&&y>=0&&x<state.w&&y<state.h)state.ground[y*state.w+x]=type;}
 function renderGround(map,state){
  const {w,h,ground}=state;
  for(let x=0;x<w;x++)for(let y=0;y<h;y++){
   const type=ground[y*w+x],mask=[[0,-1],[1,0],[0,1],[-1,0]].reduce((m,[dx,dy],i)=>ground[(y+dy)*w+x+dx]===type&&x+dx>=0&&x+dx<w?m|(1<<i):m,0);
   const variant=((x*17+y*31+(x*y)%13)>>>0)%8;
   map.data[y*w+x]=type==='dirt'?1544+mask:type==='water'?1560+mask:type==='grass'?1576+variant:type==='stone'?1584+variant:terrain[type];
  }
 }
 function stamp(map,tiles,state,name,x,y){
  const {w,h,size}=state,o=objects[name];
  if(!o||x<0||y<0||x+o.width>w||y+o.height>h)throw Error('Objeto fora do mapa: '+name);
  for(let dy=0;dy<o.height;dy++)for(let dx=0;dx<o.width;dx++){
   const id=objectTileId(o,o.x+dx,o.y+dy);map.data[2*size+(y+dy)*w+x+dx]=id;
  }
 }
 function populate(map,tiles){
  const state=prepare(map,tiles,'village-sample',48,40),{w,h}=state;
  for(let y=0;y<h;y++)for(let x=2;x<=5;x++)setGround(state,x,y,'water');
  for(let y=4;y<=36;y++)for(let x=19;x<=21;x++)setGround(state,x,y,'dirt');
  for(let y=17;y<=19;y++)for(let x=0;x<w;x++)setGround(state,x,y,x>=2&&x<=5?'wood':'dirt');
  // An irregular plaza leaves garden edges instead of a solid rectangular slab.
  for(let y=14;y<=27;y++)for(let x=13;x<=31;x++)if((y>=16&&y<=25)||(x>=17&&x<=27))setGround(state,x,y,'stone');
  // Doorsteps join the north road, the square and the new east garden loop.
  for(let y=10;y<=11;y++)for(let x=6;x<=29;x++)setGround(state,x,y,'dirt');
  for(let y=22;y<=24;y++)for(let x=22;x<=38;x++)setGround(state,x,y,'dirt');
  for(let y=32;y<=34;y++)for(let x=9;x<=42;x++)setGround(state,x,y,'dirt');
  for(let y=18;y<=34;y++)for(let x=40;x<=42;x++)setGround(state,x,y,'dirt');
  for(let y=23;y<=24;y++)for(let x=38;x<=42;x++)setGround(state,x,y,'dirt');
  for(let y=25;y<=29;y++)for(let x=35;x<=38;x++)setGround(state,x,y,'soil');
  renderGround(map,state);
  for(const [x,y] of [[9,6],[26,6],[31,10],[8,25]])stamp(map,tiles,state,'house',x,y);
  stamp(map,tiles,state,'well',23,16);stamp(map,tiles,state,'market',27,22);stamp(map,tiles,state,'innSign',25,9);
  stamp(map,tiles,state,'shrine',17,3);stamp(map,tiles,state,'bridge',2,17);
  for(const [x,y] of [[10,0],[31,1],[43,15],[4,34]])stamp(map,tiles,state,'pine',x,y);
  for(const [x,y] of [[6,12],[6,23],[39,6]])stamp(map,tiles,state,'cliff',x,y);
  for(const [x,y] of [[12,29],[30,29],[38,29]])stamp(map,tiles,state,'stump',x,y);
  for(const [x,y] of [[15,16],[24,18],[31,18],[17,24],[33,24],[43,31]])stamp(map,tiles,state,'lamp',x,y);
  for(const [x,y] of [[0,0],[6,0],[10,1],[15,0],[23,0],[29,1],[35,0],[37,5],[0,23],[5,28],[14,31],[25,30],[33,31],[37,27],[0,32]])stamp(map,tiles,state,'tree',x,y);
  for(const [x,y] of [[43,3],[44,10],[44,22],[44,35],[6,35],[29,35]])stamp(map,tiles,state,'tree',x,y);
  for(const [x,y] of [[14,12],[17,12],[24,12],[28,13],[14,29],[18,29],[25,28],[31,28],[35,27],[37,28]])stamp(map,tiles,state,'bush',x,y);
  for(const [x,y] of [[8,13],[10,14],[12,13],[16,21],[18,21],[25,20],[30,20],[34,21]])stamp(map,tiles,state,'flowers',x,y);
  for(const [x,y] of [[8,22],[36,25]])stamp(map,tiles,state,'rock',x,y);
  stamp(map,tiles,state,'fence',14,6);stamp(map,tiles,state,'fence',31,6);stamp(map,tiles,state,'fence',7,29);stamp(map,tiles,state,'sign',22,20);
  return map;
 }
 function populateNavigation(map,tiles){
  const state=prepare(map,tiles,'navigation-collision-route'),{w,h}=state;
  for(let y=0;y<h;y++)for(let x=12;x<=19;x++)setGround(state,x,y,'water');
  for(let y=15;y<=16;y++)for(let x=12;x<=19;x++)setGround(state,x,y,'wood');
  for(let x=0;x<w;x++)setGround(state,x,24,'dirt');
  renderGround(map,state);
  for(const [x,y] of [[0,0],[4,1],[8,0],[22,0],[26,1],[29,0],[1,27],[6,27],[22,27],[27,27]])stamp(map,tiles,state,'tree',x,y);
  for(const [x,y] of [[8,13],[21,18],[5,22],[25,22]])stamp(map,tiles,state,'rock',x,y);
  stamp(map,tiles,state,'fence',3,23);stamp(map,tiles,state,'fence',20,23);stamp(map,tiles,state,'lamp',10,14);stamp(map,tiles,state,'lamp',20,17);
  return map;
 }
 function populateBattle(map,tiles){
  const state=prepare(map,tiles,'animation-battle-demonstration'),{w,h}=state;
  for(let y=7;y<=24;y++)for(let x=6;x<=25;x++)setGround(state,x,y,'stone');
  for(let y=12;y<=13;y++)for(let x=6;x<=25;x++)setGround(state,x,y,'wood');
  renderGround(map,state);
  for(const [x,y] of [[0,0],[4,0],[28,0],[0,24],[28,24]])stamp(map,tiles,state,'tree',x,y);
  for(const [x,y] of [[8,9],[22,9],[8,21],[22,21]])stamp(map,tiles,state,'lamp',x,y);
  for(const [x,y] of [[12,10],[19,10],[12,20],[19,20]])stamp(map,tiles,state,'flowers',x,y);
  return map;
 }
 function populateInterior(map,tiles,purpose){
  const state=prepare(map,tiles,purpose,20,16),{w,h,size}=state;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)setGround(state,x,y,'wood');
  // Shade is a solid native wall texture; stone remains a walkable square.
  for(let x=0;x<w;x++){setGround(state,x,0,'shade');setGround(state,x,h-1,'shade');}
  for(let y=0;y<h;y++){setGround(state,0,y,'shade');setGround(state,w-1,y,'shade');}
  renderGround(map,state);
  return {state,size};
 }
 function populateInn(map,tiles){
  const {state}=populateInterior(map,tiles,'inn-interior');
  stamp(map,tiles,state,'counter',2,2);stamp(map,tiles,state,'table',9,4);stamp(map,tiles,state,'table',14,9);stamp(map,tiles,state,'bed',2,8);stamp(map,tiles,state,'shelf',16,2);
  return map;
 }
 function populateCottage(map,tiles){
  const {state}=populateInterior(map,tiles,'cottage-interior');
  stamp(map,tiles,state,'bed',2,2);stamp(map,tiles,state,'table',10,5);stamp(map,tiles,state,'shelf',15,2);stamp(map,tiles,state,'counter',7,11);
  return map;
 }
 const api={terrain,objects,tileId,objectTileId,configureFlags,populate,populateNavigation,populateBattle,populateInn,populateCottage};root.DianaTileKit=api;if(typeof module!=='undefined')module.exports=api;
 // Focus only Diana's expanded starter map on its marked starting area. Existing projects keep their saved viewport.
 const Manager=typeof TilemapManager!=='undefined'?TilemapManager:null;
 if(Manager&&!Manager.prototype._dianaVillageFocusInstalled){
  Manager.prototype._dianaVillageFocusInstalled=true;
  const loadMap=Manager.prototype.loadMap;
  Manager.prototype.loadMap=async function(){
   const loaded=await loadMap.apply(this,arguments),focus=this.currentMap?.dianaVillageFocus;
   if(!loaded||!focus||this._dianaVillageFocusedMap===this.currentMap.id)return loaded;
   const viewport=this.viewportSize?.(),scale=this.container?.scale?.x||1;
   if(viewport&&this.container&&typeof this.setViewportTransform==='function'){
    this.setViewportTransform(viewport.width/2-focus.x*this.TILE_SIZE*scale,viewport.height/2-focus.y*this.TILE_SIZE*scale,scale);
    this.updateScrollbars?.();this._dianaVillageFocusedMap=this.currentMap.id;
   }
   return loaded;
  };
 }
})(globalThis);
