'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {WebDriverClient}=require('../upstream/RPGReactor/editor/tests/smoke/webdriver-client.cjs');
async function main(){
 const root=path.resolve(__dirname,'..'),sdk=path.join(root,'tools/nwjs-sdk-v0.118.0-win-x64'),app=path.resolve(process.argv[2]||path.join(root,'build/diana/editor'));
 const candidate=path.resolve(app,'../../nw.exe'),binary=fs.existsSync(candidate)?candidate:path.join(sdk,'nw.exe');
 const run=fs.mkdtempSync(path.join(root,'artifacts/jrpg-assets-')),project=path.resolve(process.argv[3]||path.join(run,'Vila da Clareira'));let driver;
 const report={status:'running',run,project,app};const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const wait=(s,timeout=90000)=>driver.waitForScript(s,[],{timeout});
 const shot=async name=>fs.writeFileSync(path.join(run,name+'.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
 const launch=async target=>{driver=new WebDriverClient(path.join(sdk,'chromedriver.exe'));await driver.start();await driver.createSession({browserName:'chrome','goog:chromeOptions':{binary,args:['nwapp='+target,'user-data-dir='+path.join(run,target===app?'editor-profile':'game-profile'),'no-first-run']}});await driver.setScriptTimeout(90000);};
 const key=async value=>driver.sessionRequest('POST','/actions',{actions:[{type:'key',id:'sample-player',actions:[{type:'keyDown',value},{type:'pause',duration:120},{type:'keyUp',value}]}]});
 const click=async selector=>{const point=await driver.execute('const e=document.querySelector(arguments[0]);if(!e)throw Error(arguments[0]);e.scrollIntoView({block:"center"});const r=e.getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};',[selector]);assert.equal(await driver.execute('return document.querySelector(arguments[0]).contains(document.elementFromPoint(arguments[1],arguments[2]));',[selector,point.x,point.y]),true);await driver.sessionRequest('POST','/actions',{actions:[{type:'pointer',id:'sample-pointer',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',origin:'viewport',duration:0,...point},{type:'pointerDown',button:0},{type:'pointerUp',button:0}]}]});};
 try{
  assert.equal(fs.existsSync(project),false,'Sample destination must be new');
  await launch(app);await wait('return !!window.reactor?.projectManager && getComputedStyle(document.getElementById("splash-screen")).display==="none";');
  await click('.welcome-button[data-action=new-project]');
  await driver.execute('for(const [id,value] of [["rr-new-project-name",arguments[0]],["diana-project-folder",arguments[1]]]){const e=document.getElementById(id);e.value=value;e.dispatchEvent(new Event("input",{bubbles:true}));}',[path.basename(project),path.dirname(project)]);
  assert.equal(await driver.execute('return document.getElementById("diana-jrpg-sample");'),null,'Vila da Clareira is mandatory for new projects');
  assert.match(await driver.execute('return document.getElementById("rr-new-project-template-blank")?.closest("label")?.innerText||"";'),/ponto de partida obrigatório/i);
  await shot('starter-choice');await click('#rr-new-project-create');
  await driver.waitForScript('return reactor.projectController.currentProject?.path===arguments[0];',[project],{timeout:90000});await delay(600);await shot('map-editor');
  assert.equal(await driver.execute('return reactor.databaseManager.data.actors[1].characterName;'),'$Liora');
  assert.equal(await driver.execute('return reactor.databaseManager.data.actors[1].faceName;'),'ClareiraRostos');
  for(const name of ['$Diana','$Treinador'])assert.equal(fs.existsSync(path.join(project,'img/characters',name+'.png')),false,'Old placeholder not copied');
  assert.equal(fs.existsSync(path.join(project,'img/tilesets/DianaChao.png')),false);
  const pointer=await driver.execute(`
   const app=reactor,t=app.projectController.tilemapManager,m=app.mapEditor,p=app.tilesetPaletteViewer;
   app.eventManager.setEventMode(false);m.setEnabled(true);m.setTool('pencil');m.setLayerMode(2);
   p.currentLayer='D';p.selectedTiles=[{layer:'D',x:1,y:10}];
   const point=t.container.toGlobal(new PIXI.Point(6.5*t.TILE_WIDTH,4.5*t.TILE_HEIGHT)),r=t.app.canvas.getBoundingClientRect();
   return {x:Math.round(r.left+point.x*r.width/t.app.screen.width),y:Math.round(r.top+point.y*r.height/t.app.screen.height),before:t.getTileAt(6,4,2)};
  `);
  assert.equal(await driver.execute('return document.elementFromPoint(arguments[0],arguments[1])===reactor.projectController.tilemapManager.app.canvas;',[pointer.x,pointer.y]),true);
  await driver.sessionRequest('POST','/actions',{actions:[{type:'pointer',id:'editable-clareira',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',origin:'viewport',duration:0,x:pointer.x,y:pointer.y},{type:'pointerDown',button:0},{type:'pointerUp',button:0}]}]});
  report.tileEdit=await driver.execute('const m=reactor.mapEditor,t=reactor.projectController.tilemapManager,paint=t.getTileAt(6,4,2);m.undo();const undo=t.getTileAt(6,4,2);m.redo();const redo=t.getTileAt(6,4,2);m.undo();return {paint,undo,redo,restored:t.getTileAt(6,4,2)};');
  assert.equal(report.tileEdit.paint,593);assert.equal(report.tileEdit.redo,593);assert.equal(report.tileEdit.undo,pointer.before);assert.equal(report.tileEdit.restored,pointer.before);
  await shot('editable-canonical-tiles');
  await click('[data-diana-action=poses]');await wait('return document.querySelectorAll(".diana-pose-card").length===8;');await delay(300);await shot('poses-editor');await click('#database-cancel-btn');
  await driver.close();driver=null;
  await launch(project);await wait('return window.SceneManager?._scene?.constructor.name==="Scene_Title" && SceneManager._scene._commandWindow?.isOpen() && SceneManager._scene.isActive() && !SceneManager._scene.isBusy();');await key('\uE007');
  await wait('return SceneManager._scene?.constructor.name==="Scene_Map" && $gamePlayer.canMove() && !SceneManager._scene.isBusy();');
  await driver.execute('window.__sampleErrors=[];addEventListener("error",e=>__sampleErrors.push(String(e.error||e.message)));');
  await delay(500);await shot('map-game');
  assert.equal(await driver.execute('return $gamePlayer.characterName();'),'$Liora');
  // Set up near each doorway, then enter and leave using real keyboard input.
  report.transfers=[];
  const offset=await driver.execute('const e=$gameMap.event(1);return {x:e.x-18,y:e.y-25};');report.offset=offset;
  for(const [id,x,label] of [[4,27,'inn'],[5,10,'cottage']]){
   await driver.execute('$gamePlayer.locate(arguments[0],arguments[1]);$gamePlayer.setDirection(8);',[x+offset.x,10+offset.y]);await key('\uE013');
   await wait('return $gameMap.mapId()==='+id+' && $gamePlayer.canMove() && !SceneManager._scene.isBusy();');await shot(label+'-inside');
   assert.deepEqual(await driver.execute('return [$gamePlayer.x,$gamePlayer.y];'),[10,13]);
   await driver.execute('$gamePlayer.locate(10,12);$gamePlayer.setDirection(2);');await key('\uE015');
   await wait('return $gameMap.mapId()===1 && $gamePlayer.canMove() && !SceneManager._scene.isBusy();');
   assert.deepEqual(await driver.execute('return [$gamePlayer.x,$gamePlayer.y];'),[x+offset.x,10+offset.y]);report.transfers.push({map:id,keyboardEntry:true,keyboardExit:true});
  }
  await driver.execute('$gamePlayer.locate(arguments[0],arguments[1]);',[6+offset.x,15+offset.y]);
  const startX=await driver.execute('return $gamePlayer.x;');
  await key('\uE012');await wait('return !$gamePlayer.isMoving();');assert.equal(await driver.execute('return $gamePlayer.x;'),startX,'collision blocks the native village boundary');
  await driver.execute('$gamePlayer.locate(arguments[0],arguments[1]);$gamePlayer.setDirection(8);',[18+offset.x,26+offset.y]);await wait('return $gamePlayer.canMove() && !SceneManager._scene.isBusy();');await delay(200);
  await key('\uE007');
  await wait('return $gameMessage.isBusy() && SceneManager._scene._messageWindow?.pause;');assert.equal(await driver.execute('return $gameMessage.faceName();'),'ClareiraRostos');await shot('dialogue-face');
  await wait('return SceneManager._scene._messageWindow._waitCount===0;');await key('\uE007');
  await wait('return SceneManager._scene?.constructor.name==="Scene_Battle" && SceneManager._scene._spriteset?._actorSprites[0]?._mainSprite?.bitmap?.isReady();');await delay(500);await shot('battle-idle');
  assert.deepEqual(await driver.execute('const s=SceneManager._scene._spriteset;return [s._actorSprites[0]._mainSprite._frame.width,s._enemySprites[0]._frame.width];'),[192,192],'Both battlers must show one cropped cell');
  const initial=await driver.execute('return {enemy:$gameTroop.members()[0].hp,actor:$gameParty.leader().hp};');
  await driver.execute('window.__sampleFrames={actors:[],enemies:[]};for(const [C,kind] of [[Sprite_Actor,"actors"],[Sprite_Enemy,"enemies"]]){const original=C.prototype.updateFrame;C.prototype.updateFrame=function(...args){original.apply(this,args);const f=(this._mainSprite||this)._frame;if(f&&f.width===192){const key=f.x+","+f.y;if(!__sampleFrames[kind].includes(key))__sampleFrames[kind].push(key);}};}');
  // Deterministic action API isolates animation and damage from menu timing/RNG.
  await driver.execute('BattleManager._phase="turn";$gameParty.leader().forceAction(1,0);BattleManager.forceAction($gameParty.leader());');
  await wait('return $gameTroop.members()[0].hp<'+initial.enemy+';');await shot('hero-impact');
  await wait('return !BattleManager._reactorSequence && !BattleManager.isBusy();');
  const afterHero=await driver.execute('return $gameTroop.members()[0].hp;');assert.ok(afterHero>0);
  await driver.execute('BattleManager._phase="turn";$gameTroop.members()[0].forceAction(1,0);BattleManager.forceAction($gameTroop.members()[0]);');
  await wait('return $gameParty.leader().hp<'+initial.actor+';');await shot('guardian-impact');
  await wait('return !BattleManager._reactorSequence && !BattleManager.isBusy();');
  const state=await driver.execute(`return (()=>{const actor=ReactorBattlePresentation.settings.actors[1].graphic,enemy=ReactorBattlePresentation.settings.enemies[1].graphic;
   const attack=entry=>entry.spriteAnimation?.animations?.attack?.frames?.length??0,damage=entry=>entry.spriteAnimation?.animations?.damage?.frames?.length??0;
   const grid=entry=>({columns:entry.spriteAnimation?.columns,rows:entry.spriteAnimation?.rows});
   return {enemyHp:$gameTroop.members()[0].hp,actorHp:$gameParty.leader().hp,errors:__sampleErrors,rendered:__sampleFrames,
    actorAttackFrames:attack(actor),enemyAttackFrames:attack(enemy),actorDamageFrames:damage(actor),enemyDamageFrames:damage(enemy),
    actorGrid:grid(actor),enemyGrid:grid(enemy),actorLegacyPose:Boolean(actor.poses?.attack),enemyLegacyPose:Boolean(enemy.poses?.attack)};
  })();`);
  report.battle=state;
  assert.deepEqual(state.errors,[]);
  assert.deepEqual(state.actorGrid,{columns:6,rows:8});assert.deepEqual(state.enemyGrid,{columns:6,rows:8});
  assert.equal(state.actorLegacyPose,true);assert.equal(state.enemyLegacyPose,true);
  assert.equal(state.actorAttackFrames,4);assert.equal(state.enemyAttackFrames,6);
  assert.equal(state.actorDamageFrames,4);assert.equal(state.enemyDamageFrames,6);
  const renderedRows=kind=>new Set(state.rendered[kind].map(key=>Number(key.split(',')[1])));
  const renderedXs=(kind,row)=>new Set(state.rendered[kind].filter(key=>key.endsWith(','+row)).map(key=>Number(key.split(',')[0])));
  for(const kind of ['actors','enemies']){
   for(const row of kind==='actors'?[192,768]:[576,960])assert.ok(renderedRows(kind).has(row),kind+' renders row '+row+' (attack/damage)');
   for(const row of kind==='actors'?[192,768]:[576,960])for(let x=0;x<=(kind==='actors'?576:960);x+=192)assert.ok(renderedXs(kind,row).has(x),kind+' renders frame '+x+' on row '+row);
  }
  report.battle=state;report.status='passed';console.log('PASS JRPG assets '+run+' project '+project);
 }catch(error){report.status='failed';report.failure=String(error.stack||error);if(driver)try{await shot('failure');report.diagnostic=await driver.execute('return {body:document.body.innerText,scene:window.SceneManager?._scene?.constructor.name,phase:window.BattleManager?._phase,errors:window.__sampleErrors,map:window.$gameMap?.mapId(),player:window.$gamePlayer?{x:$gamePlayer.x,y:$gamePlayer.y,direction:$gamePlayer.direction(),canMove:$gamePlayer.canMove()}:null,focus:document.hasFocus(),message:window.$gameMessage?.allText()};');}catch{}throw error;}
 finally{if(driver)await driver.close();fs.writeFileSync(path.join(root,'artifacts/jrpg-assets-smoke.json'),JSON.stringify(report,null,2));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
