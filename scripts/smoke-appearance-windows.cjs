'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {WebDriverClient}=require('../upstream/RPGReactor/editor/tests/smoke/webdriver-client.cjs');
async function main(){
 const root=path.resolve(__dirname,'..'),sdk=path.join(root,'tools/nwjs-sdk-v0.118.0-win-x64'),app=path.resolve(process.argv[2]||path.join(root,'build/diana/editor'));
 const binary=process.argv[2]?path.resolve(app,'../../nw.exe'):path.join(sdk,'nw.exe'),run=fs.mkdtempSync(path.join(root,'artifacts/appearance-')),profile=path.join(run,'profile'),project=path.join(run,'Meu jogo');let driver;
 const report={status:'running',run,app,themes:[]};
 const wait=s=>driver.waitForScript(s,[],{timeout:90000});
 const shot=async name=>fs.writeFileSync(path.join(run,name+'.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
 const click=async selector=>{const point=await driver.execute('const e=document.querySelector(arguments[0]);e.scrollIntoView({block:"center"});const r=e.getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};',[selector]);assert.equal(await driver.execute('return document.querySelector(arguments[0]).contains(document.elementFromPoint(arguments[1],arguments[2]));',[selector,point.x,point.y]),true);await driver.sessionRequest('POST','/actions',{actions:[{type:'pointer',id:'theme-mouse',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',origin:'viewport',duration:0,...point},{type:'pointerDown',button:0},{type:'pointerUp',button:0}]}]});};
 const launch=async()=>{driver=new WebDriverClient(path.join(sdk,'chromedriver.exe'));await driver.start();await driver.createSession({browserName:'chrome','goog:chromeOptions':{binary,args:['nwapp='+app,'user-data-dir='+profile,'no-first-run']}});await driver.setScriptTimeout(90000);await wait('return !!window.reactor?.optionsManager && getComputedStyle(document.getElementById("splash-screen")).display==="none";');};
 try{
  await launch();assert.equal(await driver.execute('return document.documentElement.dataset.dianaTheme;'),'dark');await shot('welcome-graphite');
  assert.equal(await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectManager.createNewProject(arguments[0],"Meu jogo").then(done);',[project]),true);
  await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectController.openProjectAtPath(arguments[0]).then(()=>done(true));',[project]);
  assert.equal(await driver.execute('return document.querySelectorAll("#toolbar .tool-button img").length;'),0);
  assert.ok(await driver.execute('return document.querySelectorAll("#toolbar .diana-icon").length;')>20);
  assert.equal(await driver.execute('return nw.App.manifest.window.icon;'),'images/diana.png');
  for(const id of ['light','bubblegum-light','ocean-light','royalty-dark','dark','cascadia-light']){
   await click('#diana-appearance');await wait('return !!document.getElementById("diana-appearance-dialog");');await click('#diana-appearance-dialog [data-diana-theme="'+id+'"]');
   assert.equal(await driver.execute('return document.documentElement.dataset.dianaTheme;'),id);
   assert.equal(await driver.execute('return JSON.parse(localStorage.getItem("rr-settings")).theme;'),id);
   await shot('picker-'+id);await click('#diana-appearance-dialog .rr-modal-footer button');await shot('workspace-'+id);
   await click('[data-diana-action=poses]');await wait('return document.querySelectorAll(".diana-pose-card").length===8;');await shot('poses-'+id);
   report.themes.push(await driver.execute('const field=document.querySelector(".diana-classic select"),style=getComputedStyle(field);return {theme:document.documentElement.dataset.dianaTheme,text:style.color,input:style.backgroundColor,body:getComputedStyle(document.body).backgroundColor};'));
   await click('#database-cancel-btn');
  }
  await driver.close();driver=null;await launch();assert.equal(await driver.execute('return document.documentElement.dataset.dianaTheme;'),'cascadia-light');
  await shot('restart-olive');report.persistedAfterRestart=true;report.status='passed';console.log('PASS appearance '+run);
 }catch(error){report.status='failed';report.failure=String(error.stack||error);if(driver)try{await shot('failure');report.ui=await driver.execute('return document.body.innerText;');}catch{}throw error;}
 finally{if(driver)await driver.close();fs.writeFileSync(path.join(root,'artifacts/appearance-smoke.json'),JSON.stringify(report,null,2));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
