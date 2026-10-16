'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {WebDriverClient}=require('../upstream/RPGReactor/editor/tests/smoke/webdriver-client.cjs');
async function main(){
 const root=path.resolve(__dirname,'..'),app=path.resolve(process.argv[2]||'build/diana-defense-review/editor'),sdk=path.join(root,'tools/nwjs-sdk-v0.118.0-win-x64');
 fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});const run=fs.mkdtempSync(path.join(root,'artifacts/defense-sound-')),project=path.join(run,'Defesa e vozes');let driver;
 const report={status:'running',run,project,app,limits:'Criação de fixture e ações de combate por API; seleção e gravação de som por controles WebDriver; contagem de disparos, sem comprovar som audível.'};
 const wait=script=>driver.waitForScript(script,[],{timeout:45000});
 const key=async value=>driver.sessionRequest('POST','/actions',{actions:[{type:'key',id:'defense-key',actions:[{type:'keyDown',value},{type:'pause',duration:100},{type:'keyUp',value}]}]});
 const click=async selector=>{const p=await driver.execute('const e=document.querySelector(arguments[0]);if(!e)throw Error(arguments[0]);e.scrollIntoView({block:"center"});const r=e.getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};',[selector]);await driver.sessionRequest('POST','/actions',{actions:[{type:'pointer',id:'defense-pointer',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',origin:'viewport',duration:0,...p},{type:'pointerDown',button:0},{type:'pointerUp',button:0}]}]});};
 const shot=async name=>fs.writeFileSync(path.join(run,name+'.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
 const launch=async target=>{driver=new WebDriverClient(path.join(sdk,'chromedriver.exe'));await driver.start();await driver.createSession({browserName:'chrome','goog:chromeOptions':{binary:path.join(sdk,'nw.exe'),args:['nwapp='+target,'user-data-dir='+path.join(run,target===app?'editor-profile':'game-profile'),'no-first-run']}});await driver.setScriptTimeout(90000);};
 try{
  await launch(app);await wait('return !!window.reactor?.projectManager && getComputedStyle(document.getElementById("splash-screen")).display==="none";');
  assert.equal(await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectManager.createNewProject(arguments[0],"Defesa e vozes",{dianaMode:"2d"}).then(done);',[project]),true);
  // A tiny original PCM tone validates the actual library/decoder path without third-party audio.
  const count=4410,wav=Buffer.alloc(44+count*2);wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(44100,24);wav.writeUInt32LE(88200,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(count*2,40);for(let i=0;i<count;i++)wav.writeInt16LE(Math.round(Math.sin(i*2*Math.PI*440/44100)*2500*(1-i/count)),44+i*2);
  fs.mkdirSync(path.join(project,'audio/se'),{recursive:true});fs.writeFileSync(path.join(project,'audio/se/VozDeTeste.wav'),wav);
  await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectController.openProjectAtPath(arguments[0]).then(()=>done(true));',[project]);
  await click('[data-diana-action=poses]');await wait('return !!document.querySelector("[data-pose=guard] select");');
  await wait('return !!document.querySelector("[data-pose=guard] .rr-shim-trigger");');
  for(const pose of ['idle','guard']){await click(`[data-pose=${pose}] .rr-shim-trigger`);await wait('return document.querySelectorAll(".rr-shim-popup [role=option]").length>1;');await click('.rr-shim-popup [data-option-index="1"]');}
  assert.equal(await driver.execute('return reactor.databaseManager.data.battlePresentation.actors[1].graphic.poseSounds.guard.name;'),'VozDeTeste');
  await shot('sons-por-pose');await click('#database-ok-btn');await wait('return !document.getElementById("database-viewer").classList.contains("active");');
  assert.equal(JSON.parse(fs.readFileSync(path.join(project,'data/BattlePresentation.json'),'utf8')).actors[1].graphic.poseSounds.guard.name,'VozDeTeste');
  await driver.close();driver=null;await launch(project);await wait('return window.SceneManager?._scene?.constructor.name==="Scene_Title" && SceneManager._scene._commandWindow?.isOpen();');await shot('titulo');await key('\uE007');
  await wait('return SceneManager._scene?.constructor.name==="Scene_Map" && $gamePlayer.canMove();');
  await wait('return $gameParty.numItems($dataItems[1])===5 && $gamePlayer.canMove();');
  assert.deepEqual(await driver.execute('return {party:$gameParty.members().map(a=>a.actorId()),potions:$gameParty.numItems($dataItems[1]),ether:$gameParty.numItems($dataItems[2])};'),{party:[1,2],potions:5,ether:3});
  await driver.execute('window.__poseSounds=[];const play=AudioManager.playSe;AudioManager.playSe=function(se){__poseSounds.push({name:se.name,frame:Graphics.frameCount});return play.call(this,se);};BattleManager.setup(1,true,true);SceneManager.push(Scene_Battle);');
  await wait('return SceneManager._scene?.constructor.name==="Scene_Battle" && SceneManager._scene._spriteset?._actorSprites[0]?._mainSprite?.bitmap?.isReady();');
  await wait('const s=SceneManager._scene._spriteset._actorSprites[0];return s.x===s._homeX && s.y===s._homeY;');
  await driver.execute('window.__home=[SceneManager._scene._spriteset._actorSprites[0].x,SceneManager._scene._spriteset._actorSprites[0].y];const actor=$gameParty.leader();actor.forceAction(2,0);BattleManager.forceAction(actor);BattleManager._phase="turn";');
  await wait('return $gameParty.leader().isGuard() && !BattleManager._reactorSequence;');
  await driver.execute('BattleManager._phase="input";');
  await shot('defesa-espada');
  report.sword=await driver.execute('const s=SceneManager._scene._spriteset._actorSprites[0];return {name:ReactorBattlePresentation.graphicFor($gameParty.leader()).name,frame:{x:s._mainSprite._frame.x,y:s._mainSprite._frame.y,width:s._mainSprite._frame.width},scale:s.scale.x,home:__home,position:[s.x,s.y],soundCount:__poseSounds.length};');
  assert.equal(report.sword.name,'DefesaClareira');assert.equal(report.sword.frame.y,0);assert.equal(report.sword.frame.width,192);assert.deepEqual(report.sword.position,report.sword.home);assert.ok(report.sword.scale>0);
  const before=await driver.execute('return {count:__poseSounds.length,frame:Graphics.frameCount};');await wait(`return Graphics.frameCount>${before.frame+100};`);assert.equal(await driver.execute('return __poseSounds.length;'),before.count,'holding guard never repeats voice');
  await driver.execute('$gameParty.leader().forceChangeEquip(1,$dataArmors[1]);');await wait('return SceneManager._scene._spriteset._actorSprites[0]._mainSprite._frame.y===192;');await shot('defesa-escudo');
  report.shield=await driver.execute('const s=SceneManager._scene._spriteset._actorSprites[0];return {y:s._mainSprite._frame.y,width:s._mainSprite._frame.width,scale:s.scale.x,soundCount:__poseSounds.length};');assert.equal(report.shield.soundCount,before.count);assert.ok(report.shield.scale>0);
  report.status='passed';console.log('PASS defesa e som único: '+run);
 }catch(error){report.status='failed';report.error=String(error.stack||error);if(driver)try{await shot('failure');report.diagnostic=await driver.execute('return {scene:window.SceneManager?._scene?.constructor.name,frame:window.Graphics?.frameCount,mapId:window.$gameMap?.mapId(),canMove:window.$gamePlayer?.canMove(),body:document.body.innerText};');}catch{}throw error;}
 finally{if(driver)await driver.close();fs.writeFileSync(path.join(root,'artifacts/defense-sound-smoke.json'),JSON.stringify(report,null,2));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
