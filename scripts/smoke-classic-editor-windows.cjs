'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {WebDriverClient}=require('../upstream/RPGReactor/editor/tests/smoke/webdriver-client.cjs');
async function main(){
 const root=path.resolve(__dirname,'..'),sdk=path.join(root,'tools/nwjs-sdk-v0.118.0-win-x64'),app=path.resolve(process.argv[2]||path.join(root,'build/diana-0.2.3/editor'));
 const binary=fs.existsSync(path.resolve(app,'../../nw.exe'))?path.resolve(app,'../../nw.exe'):path.join(sdk,'nw.exe'),run=fs.mkdtempSync(path.join(root,'artifacts/classic-ui-')),project=path.join(run,'Projeto NPC');let driver;
 const report={status:'running',run,project,app};
 const wait=s=>driver.waitForScript(s,[],{timeout:90000});
 const launch=async target=>{driver=new WebDriverClient(path.join(sdk,'chromedriver.exe'));await driver.start();await driver.createSession({browserName:'chrome','goog:chromeOptions':{binary,args:['nwapp='+target,'user-data-dir='+path.join(run,target===app?'editor-profile':'game-profile'),'no-first-run']}});await driver.setScriptTimeout(90000);};
 const shot=async name=>fs.writeFileSync(path.join(run,name+'.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
 const click=async selector=>{const p=await driver.execute('const e=document.querySelector(arguments[0]);if(!e)throw Error(arguments[0]);e.scrollIntoView({block:"center"});const r=e.getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};',[selector]);assert.equal(await driver.execute('return document.querySelector(arguments[0]).contains(document.elementFromPoint(arguments[1],arguments[2]));',[selector,p.x,p.y]),true);await driver.sessionRequest('POST','/actions',{actions:[{type:'pointer',id:'classic-pointer',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',duration:0,origin:'viewport',...p},{type:'pointerDown',button:0},{type:'pointerUp',button:0}]}]});};
 const key=async value=>driver.sessionRequest('POST','/actions',{actions:[{type:'key',id:'classic-player',actions:[{type:'keyDown',value},{type:'pause',duration:120},{type:'keyUp',value}]}]});
 try{
  await launch(app);await wait('return !!window.reactor?.projectManager && getComputedStyle(document.getElementById("splash-screen")).display==="none";');
  assert.equal(await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectManager.createNewProject(arguments[0],"Projeto NPC",{dianaSample:true}).then(done);',[project]),true);
  await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectController.openProjectAtPath(arguments[0]).then(()=>done(true));',[project]);
  assert.equal(await driver.execute('return getComputedStyle(document.querySelector("#toolbar [data-action=build-tool]")).display;'),'none');await click('#diana-advanced-tools');assert.notEqual(await driver.execute('return getComputedStyle(document.querySelector("#toolbar [data-action=build-tool]")).display;'),'none');await click('#diana-advanced-tools');
  await click('#diana-new-npc');await wait('return !!document.getElementById("diana-npc-create");');
  await driver.execute('for(const [id,value] of [["diana-npc-name","Viajante teste"],["diana-npc-x","18"],["diana-npc-y","25"],["diana-npc-text","Olá! Nosso novo evento está funcionando."],["diana-npc-face","ClareiraRostos"],["diana-npc-face-index","2"]]){const e=document.getElementById(id);e.value=value;e.dispatchEvent(new Event("input",{bubbles:true}));}');
  await click('#diana-npc-create');await wait('return document.getElementById("diana-npc-error")?.textContent.includes("Já existe");');assert.equal(await driver.execute('return reactor.eventManager.currentMap.events.filter(Boolean).length;'),1);
  await driver.execute('document.getElementById("diana-npc-x").value="19";document.getElementById("diana-npc-y").value="24";');await shot('npc-wizard');await click('#diana-npc-create');await wait('return !document.getElementById("diana-npc-dialog");');
  const npc=await driver.execute('return reactor.eventManager.currentMap.events.find(e=>e?.name==="Viajante teste");');assert.ok(npc);assert.equal(npc.pages[0].list[0].parameters[1],1);
  await click('#undo-btn');assert.equal(await driver.execute('return reactor.eventManager.currentMap.events.some(e=>e?.name==="Viajante teste");'),false);
  await click('#redo-btn');assert.equal(await driver.execute('return reactor.eventManager.currentMap.events.some(e=>e?.name==="Viajante teste");'),true);
  await click('#toolbar [data-action=save]');await wait('return !reactor.projectController.hasUnsavedChanges();');await shot('npc-map');
  // Count actual canvas image draws during an idle pose preview; data is unchanged.
  await click('[data-diana-action=poses]');await wait('return document.querySelectorAll(".diana-pose-card").length===8;');
  report.rendering=await driver.executeAsync('const done=arguments[arguments.length-1],before=JSON.stringify(reactor.databaseManager.data.battlePresentation),old=CanvasRenderingContext2D.prototype.drawImage;let draws=0,frames=0;CanvasRenderingContext2D.prototype.drawImage=function(...args){if(this.canvas.closest(".diana-pose-card"))draws++;return old.apply(this,args);};let start;function measure(now){if(start===undefined)start=now;frames++;if(now-start<1000){requestAnimationFrame(measure);return;}CanvasRenderingContext2D.prototype.drawImage=old;done({draws,frames,unoptimizedEquivalent:frames*8,unchanged:before===JSON.stringify(reactor.databaseManager.data.battlePresentation)});}requestAnimationFrame(measure);');
  assert.equal(report.rendering.unchanged,true);assert.ok(report.rendering.draws<report.rendering.unoptimizedEquivalent*.5);await shot('pose-preview');await click('#database-cancel-btn');
  await driver.close();driver=null;await launch(project);
  await wait('return window.SceneManager?._scene?.constructor.name==="Scene_Title" && SceneManager._scene._commandWindow?.isOpen() && !SceneManager._scene.isBusy();');await key('\uE007');
  await wait('return SceneManager._scene?.constructor.name==="Scene_Map" && $gamePlayer.canMove() && !SceneManager._scene.isBusy();');
  await key('\uE014');await wait('return !$gamePlayer.isMoving();');await key('\uE007');await wait('return $gameMessage.isBusy() && SceneManager._scene._messageWindow?.pause;');
  assert.equal(await driver.execute('return $gameMessage.faceName();'),'ClareiraRostos');assert.equal(await driver.execute('return $gameMessage.faceIndex();'),1);assert.ok((await driver.execute('return $gameMessage.allText();')).includes('novo evento'));await shot('npc-runtime');
  report.status='passed';console.log('PASS classic editor '+run+' rendering '+JSON.stringify(report.rendering));
 }catch(error){report.status='failed';report.failure=String(error.stack||error);if(driver)try{await shot('failure');report.ui=await driver.execute('return document.body.innerText;');}catch{}throw error;}
 finally{if(driver)await driver.close();fs.writeFileSync(path.join(root,'artifacts/classic-ui-smoke.json'),JSON.stringify(report,null,2));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
