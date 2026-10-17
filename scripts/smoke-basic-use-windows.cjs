'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {WebDriverClient}=require('../upstream/RPGReactor/editor/tests/smoke/webdriver-client.cjs');
async function main(){
 const root=path.resolve(__dirname,'..'),sdk=path.join(root,'tools/nwjs-sdk-v0.118.0-win-x64');
 const run=fs.mkdtempSync(path.join(root,'artifacts/basic-use-')),project=path.join(run,'Meu primeiro mapa');
 let driver;const report={status:'running',run,project};
 const open=async app=>{driver=new WebDriverClient(path.join(sdk,'chromedriver.exe'));await driver.start();await driver.createSession({browserName:'chrome','goog:chromeOptions':{binary:path.join(sdk,'nw.exe'),args:['nwapp='+app,'user-data-dir='+path.join(run,app===project?'game-profile':'editor-profile'),'no-first-run']}});await driver.setScriptTimeout(90000);await driver.execute('nw.Window.get().focus();');};
 const pointer=async(point,count=1)=>driver.sessionRequest('POST','/actions',{actions:[{type:'pointer',id:'beginner-mouse',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',origin:'viewport',duration:0,...point},...Array.from({length:count},()=>[{type:'pointerDown',button:0},{type:'pause',duration:80},{type:'pointerUp',button:0}]).flat()]}]});
 const click=async selector=>{const point=await driver.execute('const n=document.querySelector(arguments[0]);n.scrollIntoView({block:"center"});const r=n.getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};',[selector]);await pointer(point);};
 const key=async value=>driver.sessionRequest('POST','/actions',{actions:[{type:'key',id:'beginner-keyboard',actions:[{type:'keyDown',value},{type:'pause',duration:150},{type:'keyUp',value}]}]});
 const shot=async name=>fs.writeFileSync(path.join(run,name+'.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
 try{
  await open(path.join(root,'build/diana/editor'));await driver.waitForScript('return !!window.reactor?.projectManager && getComputedStyle(document.getElementById("splash-screen")).display==="none";',[],{timeout:90000});
  await click('.welcome-button[data-action="new-project"]');
  await driver.waitForScript('return document.getElementById("rr-new-project-dialog")?.textContent.includes("Projeto inicial Luae RPG");',[],{timeout:10000});
  assert.equal(await driver.execute('return document.getElementById("rr-new-project-template-demo")===null;'),true);
  await shot('novo-projeto');await click('#rr-new-project-cancel');
  assert.equal(await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectManager.createNewProject(arguments[0],"Meu primeiro mapa").then(done);',[project]),true);
  await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectController.openProjectAtPath(arguments[0]).then(done);',[project]);
  report.palette=await driver.execute('const p=reactor.tilesetPaletteViewer,c=document.getElementById("tileset-preview-canvas");return {layer:p.currentLayer,visible:getComputedStyle(c).display!=="none",width:c.width,height:c.height};');
  assert.equal(report.palette.layer,'B');assert.equal(report.palette.visible,true);assert.equal(report.palette.width,384);
  // Choose water in the real palette, then paint the cell beside the starting player.
  const tile=await driver.execute('const c=document.getElementById("tileset-preview-canvas"),r=c.getBoundingClientRect();return {x:Math.round(r.left+168*r.width/c.width),y:Math.round(r.top+24*r.height/c.height)};');await pointer(tile);
  await click('#toolbar .layer-mode[data-layer="0"]');
  const target=await driver.execute('const t=reactor.projectController.tilemapManager,p=t.container.toGlobal(new PIXI.Point(9.5*t.TILE_WIDTH,6.5*t.TILE_HEIGHT)),r=t.app.canvas.getBoundingClientRect();return {x:Math.round(r.left+p.x*r.width/t.app.screen.width),y:Math.round(r.top+p.y*r.height/t.app.screen.height)};');await pointer(target);
  assert.equal(await driver.execute('return reactor.projectController.tilemapManager.getTileAt(9,6,0);'),3);
  await click('#undo-btn');assert.equal(await driver.execute('return reactor.projectController.tilemapManager.getTileAt(9,6,0);'),2);
  await click('#redo-btn');assert.equal(await driver.execute('return reactor.projectController.tilemapManager.getTileAt(9,6,0);'),3);
  await click('#toolbar [data-action="save"]');
  await driver.waitForScript('const pm=reactor.projectManager,m=JSON.parse(pm.fs.readFileSync(pm.path.join(arguments[0],"data/Map001.json"),"utf8"));return m.data[6*m.width+9]===3;',[project],{timeout:15000});await shot('editor-utilizavel');
  await driver.close();driver=null;await open(project);
  await driver.waitForScript('return window.SceneManager?._scene?._commandWindow?.isOpen() && SceneManager._scene.isActive() && !SceneManager._scene.isBusy();',[],{timeout:90000});await key('\uE007');
  await driver.waitForScript('return SceneManager._scene?.constructor.name==="Scene_Map" && SceneManager._scene.isActive() && !SceneManager._scene.isBusy() && $gamePlayer.canMove();',[],{timeout:30000});
  await key('\uE014');report.collision=await driver.execute('return {x:$gamePlayer.x,y:$gamePlayer.y,blocked:!$gameMap.isPassable(9,6,6)};');assert.deepEqual(report.collision,{x:8,y:6,blocked:true});
  await key('\uE012');await driver.waitForScript('return !$gamePlayer.isMoving();');report.walk=await driver.execute('return {x:$gamePlayer.x,y:$gamePlayer.y};');assert.deepEqual(report.walk,{x:7,y:6});
  await shot('jogo-utilizavel');report.status='passed';console.log('PASS uso básico: '+run);
 }catch(error){report.status='failed';report.failure=String(error.stack||error);if(driver)try{await shot('failure');}catch{}throw error;}
 finally{if(driver)await driver.close();fs.writeFileSync(path.join(root,'artifacts/basic-use-smoke.json'),JSON.stringify(report,null,2));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
