'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {WebDriverClient}=require('../upstream/RPGReactor/editor/tests/smoke/webdriver-client.cjs');
async function main(){
 const root=path.resolve(__dirname,'..'),bundle=path.resolve(process.argv[2]||path.join(root,'dist/Diana-RPG-Studio-Windows'));
 const run=fs.mkdtempSync(path.join(root,'artifacts/ready-exe-')),project=path.join(run,'Jogo do executável');
 const report={bundle,run,status:'running'};let driver;
 try{
  assert.equal(fs.readFileSync(path.join(bundle,'Diana.exe')).subarray(0,2).toString(),'MZ');
  driver=new WebDriverClient(path.join(root,'tools/nwjs-sdk-v0.118.0-win-x64/chromedriver.exe'));await driver.start();
  await driver.createSession({browserName:'chrome','goog:chromeOptions':{binary:path.join(bundle,'nw.exe'),args:['nwapp='+path.join(bundle,'app/editor'),'user-data-dir='+path.join(run,'profile'),'no-first-run']}});await driver.setScriptTimeout(90000);
  await driver.waitForScript('return !!window.reactor?.projectManager && getComputedStyle(document.getElementById("splash-screen")).display==="none";',[],{timeout:90000});
  report.result=await driver.executeAsync(`const done=arguments[arguments.length-1];(async()=>{
   const pm=reactor.projectManager;if(!await pm.createNewProject(arguments[0],'Jogo do executável'))throw Error(pm.lastCreateError);
   await reactor.projectController.openProjectAtPath(arguments[0]);if(!await reactor.projectController.saveProject())throw Error('save failed');
   return {title:document.title,runtime:pm.getRuntimePath(),dependency:require.resolve('pngjs'),brand:document.querySelector('.diana-brand').innerText,actions:[...document.querySelectorAll('[data-diana-action]')].map(n=>({id:n.dataset.dianaAction,disabled:n.disabled}))};
  })().then(done,e=>done({failure:String(e.stack||e)}));`,[project]);
  assert.equal(report.result.failure,undefined);assert.ok(report.result.runtime.startsWith(bundle));assert.ok(report.result.dependency.startsWith(bundle));assert.ok(report.result.actions.every(a=>!a.disabled));
  await driver.execute('document.querySelector("[data-diana-action=events]").click();');assert.equal(await driver.execute('return reactor.eventManager.eventMode;'),true);
  await driver.execute('document.querySelector("[data-diana-action=maps]").click();');assert.equal(await driver.execute('return reactor.eventManager.eventMode;'),false);
  fs.writeFileSync(path.join(run,'editor-pronto.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
  report.status='passed';console.log('PASS pacote pronto: '+bundle);
 }catch(error){report.status='failed';report.failure=String(error.stack||error);throw error;}
 finally{if(driver)await driver.close();fs.writeFileSync(path.join(root,'artifacts/ready-exe-smoke.json'),JSON.stringify(report,null,2));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
