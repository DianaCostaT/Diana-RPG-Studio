'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {WebDriverClient}=require('../upstream/RPGReactor/editor/tests/smoke/webdriver-client.cjs');
async function main(){
 const root=path.resolve(__dirname,'..'),sdk=path.join(root,'tools/nwjs-sdk-v0.118.0-win-x64'),run=fs.mkdtempSync(path.join(root,'artifacts/pose-benchmark-'));
 const apps=[path.resolve(process.argv[2]||'dist/Diana-RPG-Studio-Windows-0.2.2/app/editor'),path.resolve(process.argv[3]||'build/diana-0.2.3/editor')],results=[];
 for(let i=0;i<apps.length;i++){
  const app=apps[i],candidate=path.resolve(app,'../../nw.exe'),binary=fs.existsSync(candidate)?candidate:path.join(sdk,'nw.exe'),project=path.join(run,'Projeto '+i);const driver=new WebDriverClient(path.join(sdk,'chromedriver.exe'));
  try{await driver.start();await driver.createSession({browserName:'chrome','goog:chromeOptions':{binary,args:['nwapp='+app,'user-data-dir='+path.join(run,'profile'+i),'no-first-run']}});await driver.setScriptTimeout(90000);
   await driver.waitForScript('return !!window.reactor?.projectManager && getComputedStyle(document.getElementById("splash-screen")).display==="none";',[],{timeout:90000});
   assert.equal(await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectManager.createNewProject(arguments[0],"Benchmark",{dianaSample:true}).then(done);',[project]),true);
   await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectController.openProjectAtPath(arguments[0]).then(()=>{reactor.openDatabase("dianaPoses");done(true);});',[project]);
   await new Promise(resolve=>setTimeout(resolve,800));
   const stats=await driver.executeAsync('const done=arguments[arguments.length-1],old=CanvasRenderingContext2D.prototype.drawImage;let draws=0,frames=0;const before=JSON.stringify(reactor.databaseManager.data);CanvasRenderingContext2D.prototype.drawImage=function(...args){if(this.canvas.closest(".diana-pose-card"))draws++;return old.apply(this,args);};let start;function tick(now){if(start===undefined)start=now;frames++;if(now-start<2000){requestAnimationFrame(tick);return;}CanvasRenderingContext2D.prototype.drawImage=old;done({draws,frames,elapsed:now-start,unchanged:before===JSON.stringify(reactor.databaseManager.data)});}requestAnimationFrame(tick);');
   assert.equal(stats.unchanged,true);results.push({app,...stats});
  }finally{await driver.close();}
 }
 const ratio=(results[1].draws/results[1].frames)/(results[0].draws/results[0].frames);assert.ok(ratio<.5);
 const report={status:'passed',run,results,reductionInDrawCalls:1-ratio,scope:'Actual Canvas drawImage calls for eight pose thumbnails over 2s each; not a whole-app CPU/GPU benchmark.'};fs.writeFileSync(path.join(root,'artifacts/pose-benchmark.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
