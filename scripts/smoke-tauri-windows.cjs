'use strict';
// Real WebView2 + Rust API smoke. This is not a pointer/keyboard interaction test.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),{spawn}=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function port(){const s=net.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p;}
async function open(executable,profile){
 const p=await port(),child=spawn(executable,[],{windowsHide:true,env:{...process.env,WEBVIEW2_USER_DATA_FOLDER:profile,WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS:`--remote-debugging-address=127.0.0.1 --remote-debugging-port=${p}`},stdio:['ignore','ignore','pipe']});
 let stderr='';child.stderr.on('data',b=>stderr+=b);
 let target;for(let i=0;i<120;i++){try{target=(await(await fetch(`http://127.0.0.1:${p}/json/list`)).json()).find(t=>t.type==='page'&&!t.url.startsWith('devtools:'));if(target)break;}catch{}if(child.exitCode!==null)throw Error('Host encerrou: '+stderr);await delay(250);}
 if(!target){child.kill();throw Error('WebView2 não expôs a página de teste. '+stderr);}
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 let id=0;const contexts=[],pending=new Map();ws.onmessage=event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.executionContextCreated')contexts.push(m.params.context);if(m.id&&pending.has(m.id)){const {resolve,reject,timer}=pending.get(m.id);clearTimeout(timer);pending.delete(m.id);m.error?reject(Error(JSON.stringify(m.error))):resolve(m.result);}};
 const call=(method,params,sessionId)=>new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);reject(Error('Timeout CDP: '+method));},120000);pending.set(n,{resolve,reject,timer});ws.send(JSON.stringify({id:n,method,params,...(sessionId?{sessionId}:{})}));});
 await call('Runtime.enable',{});
 let frameSession;
 const evaluate=async(expression,gameFrame=false)=>{const context=gameFrame?contexts.find(c=>c.origin.includes('diana-project.localhost')&&c.auxData?.isDefault):null;
  if(gameFrame&&!context&&!frameSession){const targets=await call('Target.getTargets',{});const frame=targets.targetInfos.find(t=>t.type==='iframe'&&t.url.includes('diana-project.localhost'));if(!frame)return false;frameSession=(await call('Target.attachToTarget',{targetId:frame.targetId,flatten:true})).sessionId;}
  const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true,...(context?{contextId:context.id}:{})},gameFrame&&!context?frameSession:undefined);if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
 return {evaluate,async close(){try{await evaluate('setTimeout(()=>window.close(),50);true');}catch{}ws.close();if(child.exitCode===null){await delay(500);if(child.exitCode===null)child.kill();}}};
}
async function wait(app,expression){for(let i=0;i<240;i++){if(await app.evaluate(expression))return;await delay(250);}throw Error('Timeout: '+expression+'; '+JSON.stringify(await app.evaluate(`({scene:window.SceneManager?._scene?.constructor?.name,body:document.body.innerText.slice(-2000)})`)));}
async function main(){
 if(process.platform!=='win32')throw Error('Smoke Tauri requer Windows/WebView2 e build debug local.');
 const args=process.argv.slice(2);if(args.length&&(args.length!==2||args[0]!=='--executable'))throw Error('Uso: smoke-tauri-windows.cjs [--executable caminho.exe]');
 const executable=args.length?path.resolve(args[1]):path.join(root,'src-tauri/target/debug/luae-rpg.exe');
 const sandbox=fs.mkdtempSync(path.join(os.tmpdir(),'luae-tauri-smoke-')),projects=path.join(sandbox,'projects'),exports=path.join(sandbox,'exports'),profile=path.join(sandbox,'profile');
 for(const dir of [projects,exports,path.join(sandbox,'artifacts')])fs.mkdirSync(dir);
 const report={at:new Date().toISOString(),kind:'tauri-real-api-and-game',executable,sandbox,status:'running',steps:[]};
 fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});const record=()=>fs.writeFileSync(path.join(root,'artifacts/tauri-smoke.json'),JSON.stringify(report,null,2),'utf8');record();
 let app;
 try{
  app=await open(executable,profile);await wait(app,'!!window.reactor?.projectController && getComputedStyle(document.getElementById("splash-screen")).display === "none"');
  assert.equal(await app.evaluate(`typeof PIXI !== 'undefined' && typeof FlatShadowLight2D !== 'undefined'`),true,'Pixi deve carregar antes das classes de renderização');
  const created=await app.evaluate(`(async()=>{const h=RPGReactorHost,c=reactor.projectController;RRDialog.alert=async message=>{window.__smokeAlert=message;};c.uiManager.showNewProjectDialog=async()=>({name:'Clareira teste',mode:'2d'});h.chooseProjectDirectory=async()=>${JSON.stringify(projects)};return await c.newProject();})()`);
  assert.equal(created,true,await app.evaluate('window.__smokeAlert'));report.steps.push('criar projeto por controller/Rust real');record();
  const project=path.join(projects,'Clareira teste');
  // Release embeds compressed assets; file existence alone would miss copying
  // Brotli bytes as a PNG. Decode the actual image written by the Rust host.
  const icon=fs.readdirSync(path.join(project,'img/system')).find(n=>n.toLowerCase()==='iconset.png');
  const decoded=require('./jrpg-raster.cjs').PNG.sync.read(fs.readFileSync(path.join(project,'img/system',icon)));
  assert.ok(decoded.width>0&&decoded.height>0);
  assert.equal(await app.evaluate(`(async()=>{reactor.databaseManager.data.system.gameTitle='Luae persistência';const tiles=reactor.projectController.tilemapManager;tiles.setTileAt(2,3,1,0);const result=await reactor.projectController.saveAll();await RPGReactorHost.flush();return result;})()`),true);
  assert.equal(JSON.parse(fs.readFileSync(path.join(project,'data/System.json'),'utf8')).gameTitle,'Luae persistência');
  await app.close();app=null;
  const disposable=path.resolve(sandbox,'artifacts');assert.equal(path.dirname(disposable),path.resolve(sandbox));fs.rmSync(disposable,{recursive:true,force:true});
  app=await open(executable,profile);await wait(app,'!!window.reactor?.projectController && getComputedStyle(document.getElementById("splash-screen")).display === "none"');
  await app.evaluate(`(async()=>{await RPGReactorHost.ensureRuntime();await RPGReactorHost.mountProject(${JSON.stringify(project)});await reactor.projectController.openProjectAtPath(RPGReactorHost.projectRoot);})()`);
  assert.equal(await app.evaluate('reactor.databaseManager.data.system.gameTitle'),'Luae persistência');assert.equal(await app.evaluate('reactor.projectController.tilemapManager.getTileAt(2,3,0)'),1);report.steps.push('editar mapa e dados, salvar, fechar, remover artifacts da sandbox, reabrir projeto');record();
  assert.equal(await app.evaluate('RPGReactorHost.openPlaytest()'),true);
  for(let i=0;i<240;i++){if(await app.evaluate('!!window.Scene_Title && SceneManager._scene instanceof Scene_Title && SceneManager._scene.isActive()',true))break;if(i===239)throw Error('Playtest sem título ativo');await delay(250);}
  await app.evaluate('SceneManager._scene.commandNewGame()',true);
  for(let i=0;i<240;i++){if(await app.evaluate('SceneManager._scene instanceof Scene_Map && SceneManager._scene.isActive() && window.$gameMap?.mapId()>0',true))break;if(i===239)throw Error('Playtest sem mapa ativo');await delay(250);}
  report.steps.push('playtest executa título e novo jogo até mapa ativo');
  await app.evaluate(`document.querySelector('#diana-tauri-playtest-modal button').click()`);
  assert.equal(await app.evaluate(`document.querySelector('#diana-tauri-playtest-modal').style.display`),'none');
  const out=await app.evaluate(`(async()=>{RRDialog.alert=async()=>{};RPGReactorHost.chooseProjectDirectory=async()=>${JSON.stringify(exports)};return await RPGReactorHost.exportProject();})()`);
  assert.ok(out);report.steps.push('fechar teste, retomar editor, exportar por Rust');await app.close();app=null;
  const relocated=path.join(sandbox,'relocated');fs.renameSync(out,relocated);
  app=await open(path.join(relocated,'LuaeGame.exe'),path.join(sandbox,'game-profile'));
  await wait(app,'window.SceneManager?._scene instanceof Scene_Title && SceneManager._scene.isActive()');
  await app.evaluate('SceneManager._scene.commandNewGame()');await wait(app,'SceneManager._scene instanceof Scene_Map && SceneManager._scene.isActive() && window.$gameMap?.mapId()>0');
  report.steps.push('standalone relocado iniciou runtime e mapa sem editor');report.status='passed';
 }catch(error){report.status='failed';report.error=error.stack;throw error;}
 finally{if(app)await app.close();record();console.log(JSON.stringify(report,null,2));}
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
