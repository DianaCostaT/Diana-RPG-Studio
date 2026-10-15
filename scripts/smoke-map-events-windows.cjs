'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),sdk=path.join(root,'tools/nwjs-sdk-v0.118.0-win-x64');
const {WebDriverClient}=require('../upstream/RPGReactor/editor/tests/smoke/webdriver-client.cjs');
async function main(){
 const artifacts=path.join(root,'artifacts'),run=fs.mkdtempSync(path.join(artifacts,'map-events-smoke-')),project=path.join(run,'Jogo com espaços e acentuação');
 const reportFile=path.join(artifacts,'map-events-smoke.json');
 const report=data=>fs.writeFileSync(reportFile,JSON.stringify({at:new Date().toISOString(),run,project,...data},null,2));
 report({status:'running'});let driver;
 const open=async target=>{driver=new WebDriverClient(path.join(sdk,'chromedriver.exe'));await driver.start();await driver.createSession({browserName:'chrome','goog:chromeOptions':{binary:path.join(sdk,'nw.exe'),args:['nwapp='+target,'user-data-dir='+path.join(run,target===project?'game-profile':'editor-profile'),'no-first-run']}});await driver.setScriptTimeout(90000);await driver.execute('nw.Window.get().focus();');};
 const asyncCall=(fn,args=[])=>driver.executeAsync('const done=arguments[arguments.length-1];('+fn.toString()+')(...Array.from(arguments).slice(0,-1)).then(done,e=>done({failure:String(e.stack||e)}));',args);
 const key=async value=>driver.sessionRequest('POST','/actions',{actions:[{type:'key',id:'game-keyboard',actions:[{type:'keyDown',value},{type:'pause',duration:120},{type:'keyUp',value}]}]});
 try{
  await open(path.join(root,'build/diana/editor'));
  await driver.waitForScript('return !!window.reactor?.projectController && getComputedStyle(document.getElementById("splash-screen")).display==="none";',[],{timeout:90000});
  const authored=await asyncCall(async function(project){
   const a=reactor,pc=a.projectController,pm=a.projectManager;
   if(!await pm.createNewProject(project,'Validação mapas',{blank:false}))throw Error(pm.lastCreateError);
   await pc.openProjectAtPath(project);
   const t=pc.tilemapManager,em=a.eventManager,db=a.databaseManager;
   const fs=pm.fs,path=pm.path,source=path.join(project,'..','Imagens originais com acentuação');fs.mkdirSync(source,{recursive:true});
   const imported=[];
   for(const [category,name,w,h,color] of [['tilesets','Chão verde',256,512,[30,120,60,255]],['characters','$Herói grande',144,240,[200,130,40,255]],['parallaxes','Névoa azul',128,128,[30,60,150,255]]]){
    const file=path.join(source,name+'.png');pm.writeSolidPng(file,w,h,color);
    const folder=ResourceManager.folderDefinitions(RRAssetFiles.AUDIO_EXTENSIONS).find(f=>f.id===category);
    const result=ResourceManager.importBytes({fs,path,assetFiles:RRAssetFiles,projectRoot:project,folder,sourceName:name+'.png',sourceBytes:fs.readFileSync(file),writeAtomic:pm._writeFileAtomic.bind(pm)});
    if(result.collision||!fs.existsSync(result.destination))throw Error('import: '+name);imported.push(result.logicalName);
   }
   db.data.system.tileSize=32;t.refreshTileMetrics();
   Object.assign(db.data.system,{startMapId:1,startX:3,startY:3});
   const tileset=db.data.tilesets[t.currentMap.tilesetId];tileset.flags[3]=15;t.setTileAt(4,3,3,0);tileset.tilesetNames[5]='Chão verde';await t.refreshTilesetImages(tileset);t.renderMap();
   const c=(code,parameters=[])=>({code,indent:0,parameters});
   t.currentMap.events=[null];
   const first=em.makeQuickEvent(3,3,'Porta de teste',[em.makeDefaultEventPage({priorityType:0,list:[c(101,['',0,0,2]),c(401,['Olá, ação confirmada!']),c(121,[1,1,0]),c(122,[1,1,0,0,7]),c(201,[0,2,4,4,2,0]),c(0)]})]);
   if(!em.commitQuickEvent(first))throw Error('event commit');
   const spriteEvent=em.makeQuickEvent(2,3,'Sprite 48x60',[em.makeDefaultEventPage({image:{characterName:'$Her\u00f3i grande'}})]);if(!em.commitQuickEvent(spriteEvent))throw Error('sprite commit');
   const layers=[{name:'Névoa azul',layer:'back',fit:'repeat',opacity:180,drift:[12,0],follow:.5},{name:'Névoa azul',layer:'over',fit:'repeat',opacity:64,drift:[-18,6]},{name:'Névoa azul',layer:'over',fit:'fill',switch:2,opacity:220}];
   t.currentMap.rrImageLayers=layers;
   const second=JSON.parse(JSON.stringify(t.currentMap));second.id=2;second.events=[null,{id:1,name:'Condição confirmada',note:'',x:4,y:4,pages:[em.makeDefaultEventPage({trigger:3,conditions:{switch1Valid:true,switch1Id:1,variableValid:true,variableId:1,variableValue:7},list:[c(101,['',0,0,2]),c(401,['Switch e variável: mapa dois!']),c(121,[1,1,1]),c(0)]})]}];
   fs.writeFileSync(path.join(project,'data/Map002.json'),JSON.stringify(second));
   const infos=JSON.parse(fs.readFileSync(path.join(project,'data/MapInfos.json'),'utf8'));infos[2]={...infos[1],id:2,name:'Destino com acentos',order:2};fs.writeFileSync(path.join(project,'data/MapInfos.json'),JSON.stringify(infos));
   if(!await pc.saveProject())throw Error('save');
   return {imported,layers,tileSize:t.TILE_WIDTH};
  },[project]);assert.equal(authored.failure,undefined);assert.equal(authored.tileSize,32);
  const stroke=async erase=>{
   const point=await driver.execute(`const a=reactor,t=a.projectController.tilemapManager,m=a.mapEditor,p=a.tilesetPaletteViewer;a.eventManager.setEventMode(false);m.setEnabled(true);m.setTool('pencil');m.setLayerMode(0);m.setEraserMode(arguments[0]);p.currentLayer='B';p.selectedTiles=[{layer:'B',x:3,y:0}];const v=t.container.toGlobal(new PIXI.Point(6.5*t.TILE_WIDTH,4.5*t.TILE_HEIGHT)),r=t.app.canvas.getBoundingClientRect();return {x:Math.round(r.left+v.x*r.width/t.app.screen.width),y:Math.round(r.top+v.y*r.height/t.app.screen.height)};`,[erase]);
   assert.equal(await driver.execute('return document.elementFromPoint(arguments[0],arguments[1])===reactor.projectController.tilemapManager.app.canvas;',[point.x,point.y]),true);
   await driver.sessionRequest('POST','/actions',{actions:[{type:'pointer',id:'map-mouse',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',duration:0,origin:'viewport',...point},{type:'pointerDown',button:0},{type:'pause',duration:100},{type:'pointerUp',button:0}]}]});
  };
  const tile=()=>driver.execute('return reactor.projectController.tilemapManager.getTileAt(6,4,0);');
  await stroke(false);assert.equal(await tile(),3);await stroke(true);assert.equal(await tile(),0);
  await driver.execute('reactor.mapEditor.undo();');assert.equal(await tile(),3);await driver.execute('reactor.mapEditor.redo();');assert.equal(await tile(),0);
  await driver.execute('reactor.mapEditor.undo();');assert.equal(await tile(),3);
  assert.equal(await asyncCall(async()=>reactor.projectController.saveProject()),true);
  assert.equal((await asyncCall(async p=>{await reactor.projectController.openProjectAtPath(p);return true;},[project])),true);
  assert.equal(await tile(),3,'paint survives project reopen');
  await stroke(true);assert.equal(await tile(),0);await driver.execute('reactor.mapEditor.undo();');assert.equal(await tile(),3);await driver.execute('reactor.mapEditor.redo();');assert.equal(await tile(),0);
  assert.equal(await asyncCall(async()=>reactor.projectController.saveProject()),true);
  const saved=JSON.parse(fs.readFileSync(path.join(project,'data/Map001.json'),'utf8'));assert.deepEqual(saved.rrImageLayers,authored.layers);assert.equal(saved.data[4*saved.width+6],0);
  fs.writeFileSync(path.join(run,'editor.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
  await driver.close();driver=null;await open(project);
  await driver.waitForScript('return !!window.DataManager && DataManager.isDatabaseLoaded() && SceneManager._scene?.constructor?.name==="Scene_Title";',[],{timeout:90000});
  await driver.execute('window.__keys=[];addEventListener("keydown",e=>__keys.push({key:e.key,code:e.keyCode,mapped:Input.keyMapper[e.keyCode]}));window.__mapErrors=[];addEventListener("error",e=>__mapErrors.push(String(e.error||e.message)));DataManager.setupNewGame();SceneManager.goto(Scene_Map);');
  await driver.waitForScript('return $gameMap.mapId()===1 && SceneManager._scene?.isActive() && !SceneManager._scene.isBusy() && $gamePlayer.canMove() && SceneManager._scene?._spriteset?._rrImageLayers?.layers?.every(l=>l.sprite);',[],{timeout:90000});
  const layers=await driver.execute('return SceneManager._scene._spriteset._rrImageLayers.layers.map(l=>({z:l.sprite.z,opacity:l.sprite.opacity,visible:l.sprite.visible,origin:l.sprite.origin?{x:l.sprite.origin.x,y:l.sprite.origin.y}:null,live:l.live}));');
  assert.ok(layers[0].z<layers[1].z);assert.equal(layers[0].opacity,180);assert.equal(layers[1].opacity,64);assert.equal(layers[2].live,false);
  const driftStart=await driver.execute('return SceneManager._scene._spriteset._rrImageLayers.layers[1].sprite.origin.x;');await driver.waitForScript('return SceneManager._scene._spriteset._rrImageLayers.layers[1].sprite.origin.x!==arguments[0];',[driftStart],{timeout:10000});const drift={start:driftStart,end:await driver.execute('return SceneManager._scene._spriteset._rrImageLayers.layers[1].sprite.origin.x;')};
  assert.equal(await driver.execute('return $gameMap.tileWidth();'),32);
  const sprite=await driver.execute('const s=SceneManager._scene._spriteset._characterSprites.find(s=>s._character===$gameMap.event(2));return {width:s.patternWidth(),height:s.patternHeight()};');assert.deepEqual(sprite,{width:48,height:60});
  await key('\uE014');const collision=await driver.execute('return {x:$gamePlayer.x,y:$gamePlayer.y,blocked:!$gameMap.isPassable(4,3,6)};');assert.deepEqual(collision,{x:3,y:3,blocked:true});
  await key('\uE007');await driver.waitForScript('return $gameMessage.allText().includes("Olá, ação confirmada!");',[],{timeout:10000});
  // Wait for the message to finish revealing before the confirming key.
  await driver.waitForScript('return SceneManager._scene._messageWindow.pause && SceneManager._scene._messageWindow._waitCount===0 && !Input.isPressed("ok");',[],{timeout:10000});  fs.writeFileSync(path.join(run,'dialogue.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
  await key('\uE007');
  await driver.waitForScript('return $gameMap.mapId()===2 && $gameMessage.allText().includes("Switch e variável: mapa dois!");',[],{timeout:15000});
  const runtime=await driver.execute('return {mapId:$gameMap.mapId(),x:$gamePlayer.x,y:$gamePlayer.y,switch:$gameSwitches.value(1),variable:$gameVariables.value(1),message:$gameMessage.allText(),errors:__mapErrors};');
  assert.equal(runtime.variable,7);assert.equal(runtime.switch,true);assert.equal(runtime.x,4);assert.equal(runtime.y,4);assert.deepEqual(runtime.errors,[]);
  await driver.waitForScript('return SceneManager._scene._messageWindow.pause && SceneManager._scene._messageWindow._waitCount===0;',[],{timeout:10000});
  fs.writeFileSync(path.join(run,'transfer.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
  report({status:'passed',authored,layers,drift,sprite,collision,runtime,controls:'WebDriver pointer paint/erase; ArrowRight collision; Enter dialogue and transfer; undo/redo and fixture authoring by API',limits:'No visual event authoring, no independent rectangular tile dimensions, no custom collision rectangle, runtime sprite frame 48x60 asserted, editor preview not asserted; hidden image layer uses switch condition; history recreated after reopen, not persisted.'});
  console.log('PASS map/events Windows: '+run);
 }catch(e){let diagnostic;try{diagnostic=await driver.execute('return {focus:document.hasFocus(),scene:window.SceneManager?._scene?.constructor?.name,active:window.SceneManager?._scene?._active,stopped:window.SceneManager?._stopped,frame:window.Graphics?.frameCount,keys:window.__keys,player:window.$gamePlayer&&{x:$gamePlayer.x,y:$gamePlayer.y,canMove:$gamePlayer.canMove()},events:window.$gameMap?.events().map(e=>({id:e.eventId(),x:e.x,y:e.y,trigger:e._trigger,priority:e._priorityType,list:e.list()})),message:window.$gameMessage?.allText(),errors:window.__mapErrors};');}catch{}report({status:'failed',error:String(e.stack||e),diagnostic});throw e;}finally{if(driver)await driver.close();}
}
if(require.main===module)main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
module.exports={main};
