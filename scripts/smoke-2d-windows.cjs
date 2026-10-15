'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {WebDriverClient}=require('../upstream/RPGReactor/editor/tests/smoke/webdriver-client.cjs');
async function main(){
 const root=path.resolve(__dirname,'..'),sdk=path.join(root,'tools/nwjs-sdk-v0.118.0-win-x64'),app=path.resolve(process.argv[2]||path.join(root,'build/diana/editor'));
 const binary=process.argv[2]?path.resolve(app,'../../nw.exe'):path.join(sdk,'nw.exe');
 const run=fs.mkdtempSync(path.join(root,'artifacts/2d-ui-')),project=path.join(run,'Projeto 2D');let driver;
 const report={status:'running',run,app,project};
 const wait=(script,timeout=30000)=>driver.waitForScript(script,[],{timeout});
 const click=async selector=>{const p=await driver.execute('const e=document.querySelector(arguments[0]);if(!e)throw Error(arguments[0]);e.scrollIntoView({block:"center"});const r=e.getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};',[selector]);
  assert.equal(await driver.execute('return document.querySelector(arguments[0]).contains(document.elementFromPoint(arguments[1],arguments[2]));',[selector,p.x,p.y]),true,selector+' receives pointer');
  await driver.sessionRequest('POST','/actions',{actions:[{type:'pointer',id:'2d-pointer',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',duration:0,origin:'viewport',...p},{type:'pointerDown',button:0},{type:'pointerUp',button:0}]}]});};
 const shot=async name=>fs.writeFileSync(path.join(run,name+'.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
 const launch=async target=>{driver=new WebDriverClient(path.join(sdk,'chromedriver.exe'));await driver.start();await driver.createSession({browserName:'chrome','goog:chromeOptions':{binary,args:['nwapp='+target,'user-data-dir='+path.join(run,target===app?'editor-profile':'game-profile'),'no-first-run']}});await driver.setScriptTimeout(90000);};
 try{
  await launch(app);await wait('return !!window.reactor?.projectManager && getComputedStyle(document.getElementById("splash-screen")).display==="none";',90000);
  await click('.welcome-button[data-action=new-project]');assert.equal(await driver.execute('return document.getElementById("diana-project-mode").value;'),'2d');await shot('new-project-modes');await click('#rr-new-project-cancel');
  assert.equal(await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectManager.createNewProject(arguments[0],"Projeto 2D",{dianaMode:"2d"}).then(done);',[project]),true);
  await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectController.openProjectAtPath(arguments[0]).then(()=>done(true));',[project]);
  assert.equal(await driver.execute('return document.documentElement.dataset.dianaMode;'),'2d');
  assert.equal(await driver.execute('return getComputedStyle(document.querySelector(".map-3d-view")).display;'),'none');
  assert.equal(await driver.execute('return getComputedStyle(document.querySelector(".tileset-layer-tab[data-layer=O]")).display;'),'none');
  await shot('workspace-2d');
  await click('[data-diana-action=poses]');await wait('return document.querySelectorAll(".diana-pose-card").length===8;');await shot('animations2-allies');
  for(const kind of ['actors','enemies']){
   if(kind==='enemies')await driver.execute('const s=document.querySelector(".diana-classic-top select");s.value="enemies";s.dispatchEvent(new Event("change"));');
   await click('.diana-pose-card[data-pose=idle] button');await wait('return !!document.querySelector(".diana-pose-modal canvas.rr-pose-sheet-canvas");');
   await driver.execute('const row=[...document.querySelectorAll(".diana-pose-modal fieldset[data-frame-index] label")].find(e=>e.firstElementChild.getAttribute("data-i18n-text-source")==="Duration (frames)");const input=row.querySelector("input");input.value=17;input.dispatchEvent(new Event("change"));');
   await driver.execute('document.querySelector(".diana-pose-modal [data-pose-control=play]").click();');
   await wait('return document.querySelector(".diana-pose-modal .rr-rectangle-poses").posePreview.tick>3;');
   await shot('pose-'+kind);
   await click('.diana-pose-modal .rr-modal-footer button:last-child');
   assert.equal(await driver.execute('return reactor.databaseManager.data.battlePresentation[arguments[0]][1].graphic.poses.idle.frames[0].duration;',[kind]),17);
   await click('.diana-pose-card[data-pose=idle] button');await wait('return !!document.querySelector(".diana-pose-modal canvas.rr-pose-sheet-canvas");');
   await driver.execute('const row=[...document.querySelectorAll(".diana-pose-modal fieldset[data-frame-index] label")].find(e=>e.firstElementChild.getAttribute("data-i18n-text-source")==="Duration (frames)");const input=row.querySelector("input");input.value=25;input.dispatchEvent(new Event("change"));');
   await click('.diana-pose-modal .rr-modal-footer button:first-child');
   assert.equal(await driver.execute('return reactor.databaseManager.data.battlePresentation[arguments[0]][1].graphic.poses.idle.frames[0].duration;',[kind]),17,'Cancel discards the pose draft');
  }
  await click('#database-apply-btn');
  await wait('return !reactor.databaseEditorUI._databaseSaveInFlight;');
  await click('.database-nav-item[data-type=dianaBattleScreen]');await wait('return !!document.querySelector(".diana-position-row");');
  await driver.execute('const n=document.querySelector(".diana-position-row input");n.value=510;n.dispatchEvent(new Event("change"));');
  await shot('battle-screen');await click('#database-ok-btn');await wait('return !document.getElementById("database-viewer").classList.contains("active");');
  const saved=JSON.parse(fs.readFileSync(path.join(project,'data/BattlePresentation.json'),'utf8'));assert.equal(saved.screen2d.actorHomes[0].x,510);
  for(const kind of ['actors','enemies'])assert.equal(saved[kind][1].graphic.poses.idle.frames[0].duration,17);
  // Switch tools on this project, persist the choice, then return to 2D.
  await driver.execute('const s=document.getElementById("diana-mode-badge");s.value="hybrid";s.dispatchEvent(new Event("change"));');await wait('return document.documentElement.dataset.dianaMode==="hybrid";');
  assert.notEqual(await driver.execute('return getComputedStyle(document.querySelector(".map-3d-view")).display;'),'none');
  assert.equal(JSON.parse(fs.readFileSync(path.join(project,'project.rpgreactor'),'utf8')).diana.mode,'hybrid');
  await shot('workspace-hybrid');
  await driver.execute('const s=document.getElementById("diana-mode-badge");s.value="2d";s.dispatchEvent(new Event("change"));');
  await driver.close();driver=null;
  await launch(project);await wait('return window.SceneManager?._scene?.constructor.name==="Scene_Title" && SceneManager._scene._commandWindow?.isOpen();',90000);
  await driver.execute('DataManager.setupNewGame();BattleManager.setup(1,true,true);SceneManager.goto(Scene_Battle);');
  await wait('return SceneManager._scene?.constructor.name==="Scene_Battle" && SceneManager._scene._spriteset?._actorSprites?.[0]?._actor;');
  const runtime=await driver.execute('const a=SceneManager._scene._spriteset._actorSprites[0];return {home:[a._homeX,a._homeY],expected:Sprite_Battler.fieldPoint(510,280),poses:[ReactorBattlePresentation.settings.actors[1].graphic.poses.idle.frames[0].duration,ReactorBattlePresentation.settings.enemies[1].graphic.poses.idle.frames[0].duration]};');
  assert.deepEqual(runtime.home,runtime.expected);assert.deepEqual(runtime.poses,[17,17]);await shot('game-battle');report.runtime=runtime;report.status='passed';console.log('PASS 2D authoring '+run);
 }catch(error){report.status='failed';report.failure=String(error.stack||error);if(driver)try{await shot('failure');report.ui=await driver.execute('return document.body.innerText;');}catch{}throw error;}
 finally{if(driver)await driver.close();fs.writeFileSync(path.join(root,'artifacts/2d-ui-smoke.json'),JSON.stringify(report,null,2));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
