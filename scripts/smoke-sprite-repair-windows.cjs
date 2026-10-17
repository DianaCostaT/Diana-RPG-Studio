'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {WebDriverClient}=require('../upstream/RPGReactor/editor/tests/smoke/webdriver-client.cjs');
const root=path.resolve(__dirname,'..'),sdk=path.join(root,'tools/nwjs-sdk-v0.118.0-win-x64'),run=fs.mkdtempSync(path.join(root,'artifacts/sprite-repair-smoke-')),project=path.join(run,'Clareira corrigida');
let driver;const report={project,host:'NW.js',status:'running',ui:[],frames:[],movement:[]};
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function open(app){driver=new WebDriverClient(path.join(sdk,'chromedriver.exe'));await driver.start();await driver.createSession({browserName:'chrome','goog:chromeOptions':{binary:path.join(sdk,'nw.exe'),args:['nwapp='+app,'user-data-dir='+path.join(run,path.basename(app)+'-profile'),'no-first-run']}});await driver.setScriptTimeout(90000);}
async function shot(name){fs.writeFileSync(path.join(run,name+'.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));}
async function main(){try{
 await open(path.join(root,'build/diana/editor'));await driver.waitForScript('return !!window.reactor?.projectController && !!window.DianaSpriteRepairUI && getComputedStyle(document.getElementById("splash-screen")).display==="none";',[],{timeout:90000});
 const created=await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectManager.createNewProject(arguments[0],"Clareira corrigida").then(async ok=>{if(ok)await reactor.projectController.openProjectAtPath(arguments[0]);done(ok);},e=>done(String(e)));',[project]);assert.equal(created,true);
 for(const [folder,name,width,count] of [['characters','$Liora',1536,24],['characters','$Brann',1536,24],['sv_actors','BrannMedieval',627,36]]){
  await driver.execute('window.__repair=DianaSpriteRepairUI.open(reactor,{folder:arguments[0],name:arguments[1]});',[folder,name]);
  await driver.waitForScript('return document.querySelector(".diana-repair-modal canvas")?.dataset.sourceWidth;',[],{timeout:15000});
  await driver.execute('[...document.querySelectorAll(".diana-repair-modal button")].find(b=>b.textContent==="Usar original da Clareira").click();');
  await driver.waitForScript('return document.querySelector(".diana-repair-modal canvas")?.dataset.sourceWidth===String(arguments[0]);',[width],{timeout:20000});
  await driver.execute('[...document.querySelectorAll(".diana-repair-modal button")].find(b=>b.textContent==="Detectar e reconstruir quadros").click();');
  assert.equal(await driver.execute(`return document.querySelectorAll('.diana-repair-modal [aria-label^="Inspecionar quadro"]').length;`),count);
  const checked=await driver.execute(`const nodes=[...document.querySelectorAll('.diana-repair-modal [aria-label^="Inspecionar quadro"]')];const labels=nodes.map(b=>b.getAttribute('aria-label'));for(const label of labels)document.querySelector('[aria-label="'+label+'"]').click();return {last:document.querySelector('.diana-repair-modal strong').textContent,saveEnabled:![...document.querySelectorAll('.diana-repair-modal button')].find(b=>b.textContent==='Salvar cópia e usar nos personagens').disabled};`);
  assert.equal(checked.saveEnabled,true);await shot(name.replace(/[^a-zA-Z]/g,'')+'-frames');
  await driver.executeAsync('const done=arguments[arguments.length-1];[...document.querySelectorAll(".diana-repair-modal button")].find(b=>b.textContent==="Salvar cópia e usar nos personagens").onclick().then(()=>done(document.querySelector(".diana-repair-modal .rr-modal-body").textContent));');
  const saved=await driver.execute('return document.querySelector(".diana-repair-modal .rr-modal-body").textContent;');assert.match(saved,/Cópia criada/);report.ui.push({folder,name,count,checked});await driver.execute('__repair.close();');
 }
 assert.equal(await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectController.saveProject().then(done);'),true);
 await driver.close();await open(project);
 await driver.waitForScript('return SceneManager._scene?.constructor.name==="Scene_Title";',[],{timeout:90000});
 await driver.execute('window.__errors=[];addEventListener("error",e=>__errors.push(String(e.error||e.message)));DataManager.setupNewGame();SceneManager.goto(Scene_Map);');
 await driver.waitForScript('return SceneManager._scene?.constructor.name==="Scene_Map"&&SceneManager._scene._spriteset?._characterSprites?.some(s=>s._character===$gamePlayer&&s.bitmap?.isReady());',[],{timeout:30000});
 report.frames=await driver.execute(`const result=[];for(const ch of [$gamePlayer,...$gamePlayer.followers().data()]){if(!ch.characterName())continue;const s=SceneManager._scene._spriteset._characterSprites.find(s=>s._character===ch);for(const d of [2,4,6,8])for(let p=0;p<6;p++){ch.setDirection(d);ch.setPattern(p);s.updateFrame();result.push({name:ch.characterName(),direction:d,pattern:p,expectedColumn:ch.dianaWalkAnimation().directions[d][p]%6,x:s._frame.x,y:s._frame.y,w:s._frame.width,h:s._frame.height});}}return result;`);
 for(const f of report.frames){assert.equal(f.w,48);assert.equal(f.h,48);assert.equal(f.x,f.expectedColumn*48);assert.equal(f.y,({2:0,4:1,6:2,8:3})[f.direction]*48);}assert.equal(report.frames.length,48);
 await driver.execute('$gamePlayer.locate(36,36);$gamePlayer.setThrough(true);$gamePlayer.followers().synchronize(35,36,6);$gamePlayer.setMoveSpeed(4);');
 await driver.sessionRequest('POST','/actions',{actions:[{type:'key',id:'walk',actions:[{type:'keyDown',value:'\uE014'}]}]});
 for(let i=0;i<16;i++){await delay(100);report.movement.push(await driver.execute('return [$gamePlayer,...$gamePlayer.followers().data()].map(c=>({name:c.characterName(),pattern:c.pattern(),x:c.x,moving:c.isMoving(),walk:c.hasWalkAnime()}));'));}
 await driver.sessionRequest('POST','/actions',{actions:[{type:'key',id:'walk',actions:[{type:'keyUp',value:'\uE014'}]}]});
 for(let i=0;i<2;i++){const samples=report.movement.map(s=>s[i]);assert.ok(new Set(samples.map(s=>s.pattern)).size>1,'leader and follower animate during actual keyboard movement');assert.ok(new Set(samples.map(s=>s.x)).size>1,'leader and follower change position');}await shot('walking-right');
 await driver.execute('$gamePlayer._encounterCount=9999;$gamePlayer.setThrough(false);$gameMessage.clear();BattleManager.setup(1,true,true);SceneManager.goto(Scene_Battle);');
 await driver.waitForScript('return SceneManager._scene?.constructor.name==="Scene_Battle"&&!!SceneManager._scene._spriteset?._actorSprites?.[1];',[],{timeout:30000});await delay(1000);
 report.combat=await driver.execute(`const sprite=SceneManager._scene._spriteset._actorSprites.find(s=>s._actor?.actorId()===2),g=ReactorBattlePresentation.graphicFor(sprite._actor),out=[];for(const motion of ['idle','attack','damage','guard','victory','dead'])for(let index=0;index<6;index++){sprite._rrHeldPose={motion,frame:index};ReactorBattlePresentation.updateGraphicFrame(sprite,g);const f=(sprite._mainSprite||sprite)._frame;out.push({motion,index,x:f.x,y:f.y,w:f.width,h:f.height});}sprite._rrHeldPose=null;return out;`);
 for(const f of report.combat){assert.equal(f.w,192);assert.equal(f.h,192);assert.equal(f.x,f.index*192);assert.equal(f.y,['idle','attack','damage','guard','victory','dead'].indexOf(f.motion)*192);}await shot('battle-brann');
 report.errors=await driver.execute('return __errors;');assert.deepEqual(report.errors,[]);report.status='passed';console.log('PASS: sprite repair UI, 84 source frames, saved copies, 48 runtime walk crops, keyboard leader/follower animation and battle opened. '+run);
}catch(error){report.status='failed';report.error=String(error.stack||error);try{report.diagnostics=await driver.execute('return {scene:SceneManager._scene?.constructor.name,errors:window.__errors,phase:BattleManager._phase,changing:SceneManager.isSceneChanging(),party:$gameParty.members().map(a=>({name:a.name(),hp:a.hp}))};');await shot('failure');}catch{}throw error;}finally{fs.writeFileSync(path.join(root,'artifacts/sprite-repair-smoke.json'),JSON.stringify(report,null,2)+'\n');if(driver)await driver.close();}}
main().catch(e=>{console.error(e);process.exitCode=1;});
