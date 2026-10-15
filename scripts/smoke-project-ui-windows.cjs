'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {WebDriverClient}=require('../upstream/RPGReactor/editor/tests/smoke/webdriver-client.cjs');
async function main(){
 const root=path.resolve(__dirname,'..'),sdk=path.join(root,'tools/nwjs-sdk-v0.118.0-win-x64');
 const app=path.resolve(process.argv[2]||path.join(root,'build/diana/editor'));
 const run=fs.mkdtempSync(path.join(root,'artifacts/project-ui-')),name='Projeto com acentuação',project=path.join(run,name);
 const report={status:'running',run,project,app};let driver;
 const save=()=>fs.writeFileSync(path.join(root,'artifacts/project-ui-smoke.json'),JSON.stringify(report,null,2));save();
 const wait=(script,timeout=20000)=>driver.waitForScript(script,[],{timeout});
 const click=async selector=>{
  const point=await driver.execute('const n=document.querySelector(arguments[0]);if(!n)throw Error("Missing control: "+arguments[0]);n.scrollIntoView({block:"center"});const r=n.getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};',[selector]);
  assert.equal(await driver.execute('return document.querySelector(arguments[0]).contains(document.elementFromPoint(arguments[1],arguments[2]));',[selector,point.x,point.y]),true);
  await driver.sessionRequest('POST','/actions',{actions:[{type:'pointer',id:'project-mouse',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',origin:'viewport',duration:0,...point},{type:'pointerDown',button:0},{type:'pointerUp',button:0}]}]});
 };
 const type=async(selector,text)=>{await click(selector);await driver.sessionRequest('POST','/actions',{actions:[{type:'key',id:'project-keyboard',actions:[{type:'keyDown',value:'\uE009'},{type:'keyDown',value:'a'},{type:'keyUp',value:'a'},{type:'keyUp',value:'\uE009'},...Array.from(text).flatMap(value=>[{type:'keyDown',value},{type:'keyUp',value}]),{type:'keyDown',value:'\uE004'},{type:'keyUp',value:'\uE004'}]}]});};
 const shot=async name=>fs.writeFileSync(path.join(run,name+'.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
 const fill=async selector=>{await click(selector);await wait('return !!document.getElementById("diana-project-folder");');await type('#rr-new-project-name',name);await type('#diana-project-folder',run);};
 try{
  driver=new WebDriverClient(path.join(sdk,'chromedriver.exe'));await driver.start();
  const binary=process.argv[2]?path.resolve(app,'../../nw.exe'):path.join(sdk,'nw.exe');
  await driver.createSession({browserName:'chrome','goog:chromeOptions':{binary,args:['nwapp='+app,'user-data-dir='+path.join(run,'profile'),'no-first-run']}});await driver.setScriptTimeout(90000);
  await wait('return !!window.reactor?.projectController && getComputedStyle(document.getElementById("splash-screen")).display==="none";',90000);
  await fill('.welcome-button[data-action="new-project"]');
  await click('#diana-project-browse');
  await wait('return document.getElementById("diana-folder-choose")?.disabled===false;');await shot('folder-browser');await click('#diana-folder-choose');
  await wait('return document.getElementById("diana-project-browse")?.disabled===false;');
  assert.equal(await driver.execute('return document.getElementById("diana-project-folder").value;'),run);
  assert.equal(await driver.execute('return document.getElementById("diana-project-folder-hint").textContent.includes("Não foi possível");'),false);
  report.folderBrowser='selected folder without invoking NW.js native chooser';await shot('folder-selected');
  await click('#rr-new-project-create');
  await driver.waitForScript('return reactor.projectController.currentProject?.path===arguments[0] && reactor.tilesetPaletteViewer?.currentLayer==="B";',[project],{timeout:90000});
  await shot('created');assert.ok(fs.existsSync(path.join(project,'data/Map001.json')));
  const before=fs.readFileSync(path.join(project,'data/Map001.json'),'utf8');
  await fill('#toolbar [data-action="new-project"]');await click('#rr-new-project-create');
  await wait('return document.querySelector(".rr-dialog-message")?.textContent.includes("Não foi possível criar o projeto");');
  await shot('existing-folder-error');await click('#rr-themed-dialog .rr-button-primary');
  assert.equal(await driver.execute('return reactor.projectController.currentProject.path;'),project);
  assert.equal(fs.readFileSync(path.join(project,'data/Map001.json'),'utf8'),before);
  await click('#toolbar [data-action="new-project"]');await wait('return !!document.getElementById("rr-new-project-cancel");');await click('#rr-new-project-cancel');
  assert.equal(await driver.execute('return reactor.projectController.currentProject.path;'),project);
  assert.equal(await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectController.saveProject().then(done);'),true);
  await click('#toolbar [data-action="open-project"]');await wait('return !!document.getElementById("diana-folder-cancel");');await click('#diana-folder-cancel');
  assert.equal(await driver.execute('return reactor.projectController.currentProject.path;'),project);
  await click('#toolbar [data-action="open-project"]');await wait('return document.getElementById("diana-folder-choose")?.disabled===false;');await click('#diana-folder-choose');
  await wait('return !reactor.projectController._dianaProjectBusy && !document.getElementById("diana-folder-dialog");');
  assert.equal(await driver.execute('return reactor.projectController.currentProject.path;'),project);
  assert.equal(fs.readFileSync(path.join(project,'data/Map001.json'),'utf8'),before);
  await click('#toolbar [data-action="playtest"]');
  await wait('return !!reactor.playtestManager.playtestProcess?.pid;',30000);
  const childPid=await driver.execute('return reactor.playtestManager.playtestProcess.pid;');
  await new Promise(resolve=>setTimeout(resolve,12000));
  assert.equal(await driver.execute('return reactor.playtestManager.playtestProcess?.pid;'),childPid,'Playtest must stay running');
  process.kill(childPid,0);
  report.playtest={pid:childPid,aliveAfterSeconds:12};
  await shot('playtest-launched');
  await driver.execute('reactor.playtestManager.playtestProcess.kill();');
  await wait('return !reactor.playtestManager.playtestProcess;');
  assert.equal(await driver.execute('return reactor.projectController.currentProject.path;'),project);
  report.status='passed';report.scope='Creation from actual New Project UI, integrated folder selection, duplicate destination, cancellation, reopening and actual Playtest button; child runtime stays running for 12 seconds, editor responds after child closes.';
  console.log('PASS project UI '+run);
 }catch(error){report.status='failed';report.failure=String(error.stack||error);if(driver)try{await shot('failure');report.diagnostic=await driver.execute('return {text:document.body.innerText,project:reactor.projectController.currentProject?.path};');}catch{}throw error;}
 finally{if(driver)await driver.close();save();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
