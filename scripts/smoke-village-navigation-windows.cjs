'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { WebDriverClient } = require('../upstream/RPGReactor/editor/tests/smoke/webdriver-client.cjs');

const root = path.resolve(__dirname, '..');
const sdk = path.join(root, 'tools/nwjs-sdk-v0.118.0-win-x64');
const editor = path.resolve(process.argv[2] || path.join(root, 'build/diana-clareira-preview/editor'));
const run = fs.mkdtempSync(path.join(root, 'artifacts/village-navigation-windows-'));
const project = path.join(run, 'Vila da Clareira');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const report = { status: 'running', editor, run, project, conversations: [], transfers: [] };
let driver;

const wait = (script, args = [], timeout = 90000) => driver.waitForScript(script, args, { timeout });
const screenshot = async name => fs.writeFileSync(path.join(run, name + '.png'), Buffer.from(await driver.sessionRequest('GET', '/screenshot'), 'base64'));
const launch = async target => {
  driver = new WebDriverClient(path.join(sdk, 'chromedriver.exe'));
  await driver.start();
  await driver.createSession({ browserName: 'chrome', 'goog:chromeOptions': {
    binary: fs.existsSync(path.resolve(target, '../../nw.exe')) ? path.resolve(target, '../../nw.exe') : path.join(sdk, 'nw.exe'),
    args: ['nwapp=' + target, 'user-data-dir=' + path.join(run, target === editor ? 'editor-profile' : 'game-profile'), 'no-first-run']
  } });
  await driver.setScriptTimeout(90000);
  await driver.execute('nw.Window.get().focus();');
  await driver.execute('window.__villageErrors=[];addEventListener("error",e=>window.__villageErrors.push(String(e.error?.stack||e.message)));addEventListener("unhandledrejection",e=>window.__villageErrors.push(String(e.reason?.stack||e.reason)));');
};
const click = async selector => {
  const point = await driver.execute('const e=document.querySelector(arguments[0]);if(!e)throw Error(arguments[0]);e.scrollIntoView({block:"center"});const r=e.getBoundingClientRect();return{x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};', [selector]);
  await driver.sessionRequest('POST', '/actions', { actions: [{ type: 'pointer', id: 'village-pointer', parameters: { pointerType: 'mouse' }, actions: [
    { type: 'pointerMove', origin: 'viewport', duration: 0, ...point }, { type: 'pointerDown', button: 0 }, { type: 'pointerUp', button: 0 }
  ] }] });
};
const key = async value => driver.sessionRequest('POST', '/actions', { actions: [{ type: 'key', id: 'village-keyboard', actions: [
  { type: 'keyDown', value }, { type: 'pause', duration: 130 }, { type: 'keyUp', value }
 ] }] });
const directions = [{ d: 2, key: '\uE015', dx: 0, dy: 1 }, { d: 4, key: '\uE012', dx: -1, dy: 0 }, { d: 6, key: '\uE014', dx: 1, dy: 0 }, { d: 8, key: '\uE013', dx: 0, dy: -1 }];

// Find a route from the live player location, then execute each tile with real keyboard input.
async function walkFacingEvent(eventId) {
  const result = await driver.execute(`
    const player=$gamePlayer,event=$gameMap.event(arguments[0]);if(!event)throw Error('missing event '+arguments[0]);
    const dirs=[{d:2,dx:0,dy:1},{d:4,dx:-1,dy:0},{d:6,dx:1,dy:0},{d:8,dx:0,dy:-1}];
    const start={x:player.x,y:player.y},q=[start],seen=new Map([[start.x+','+start.y,null]]);let goal=null;
    for(let i=0;i<q.length&&!goal;i++){
      const p=q[i];for(const dir of dirs){if(p.x+dir.dx===event.x&&p.y+dir.dy===event.y){goal={p,dir};break;}}
      if(goal)break;
      for(const dir of dirs){const x=p.x+dir.dx,y=p.y+dir.dy,k=x+','+y;
        if(seen.has(k)||x<0||y<0||x>=$gameMap.width()||y>=$gameMap.height())continue;
        if($gameMap.eventsXy(x,y).some(e=>!e.isThrough()&&e.isNormalPriority()))continue;
        if(!player.canPass(p.x,p.y,dir.d))continue;
        seen.set(k,{from:p.x+','+p.y,d:dir.d});q.push({x,y});
      }
    }
    if(!goal)throw Error('no path to event '+eventId+' from '+start.x+','+start.y);
    const path=[];let cursor=goal.p.x+','+goal.p.y;while(cursor!==start.x+','+start.y){const edge=seen.get(cursor);path.push(edge.d);cursor=edge.from;}path.reverse();
    return {event:[event.x,event.y],start:[start.x,start.y],path,face:goal.dir.d,approach:[goal.p.x,goal.p.y]};`, [eventId]);
  for (const dir of result.path) {
    const direction = directions.find(item => item.d === dir);
    const before = await driver.execute('return [$gamePlayer.x,$gamePlayer.y];');
    await key(direction.key);
    await wait('return !$gamePlayer.isMoving() && !$gameMessage.isBusy() && !$gameMap.isEventRunning();');
    const after = await driver.execute('return [$gamePlayer.x,$gamePlayer.y];');
    assert.deepEqual(after, [before[0] + direction.dx, before[1] + direction.dy], 'keyboard step should match walkable route');
  }
  await driver.execute('$gamePlayer.setDirection(arguments[0]);', [result.face]);
  assert.deepEqual(await driver.execute('return [$gamePlayer.x,$gamePlayer.y];'), result.approach);
  return result;
}
async function activate() {
  await driver.execute('nw.Window.get().focus();');
  await delay(120);
  await key('\uE007');
  await wait('return $gameMessage.isBusy() || SceneManager._scene.isBusy() || $gameMap.isEventRunning();', [], 15000);
  await delay(250);
}
async function clearMessage(waitForEventEnd = true) {
  if (!await driver.execute('return $gameMessage.isBusy();')) return;
  for (let attempt = 0; attempt < 3 && await driver.execute('return $gameMessage.isBusy();'); attempt++) {
    await wait('return !SceneManager._scene._messageWindow?._waitCount && !Input.isPressed("ok");', [], 15000);
    await key('\uE007');
    await delay(180);
  }
  await wait(waitForEventEnd ? 'return !$gameMessage.isBusy() && !$gameMap.isEventRunning();' : 'return !$gameMessage.isBusy();', [], 15000);
}
async function finishAutomatedTransfer(targetMapId) {
  await wait('return $gameMap.mapId()===arguments[0] && $gamePlayer.canMove();', [targetMapId], 20000);
  // Background NW.js windows can throttle both fades and rendering after a map
  // transfer. Wake the temporary test window before inspecting or interacting.
  await driver.execute('const w=nw.Window.get();w.restore();w.show();w.focus();const s=SceneManager._scene;if(s&&s._fadeDuration>0){s._fadeDuration=0;s._fadeSign=0;s._fadeOpacity=0;if(s._fadeSprite)s._fadeSprite.opacity=0;s._colorFilter?.setBlendColor([0,0,0,0]);}Input.clear();TouchInput.clear();');
  await wait('return SceneManager._scene?.isReady?.() && !SceneManager._scene?.isBusy?.() && SceneManager._scene?.isActive?.() && $gamePlayer.canMove();', [], 15000);
  await delay(1200);
  const foregroundHold = Number(process.env.DIANA_VILLAGE_SMOKE_FOREGROUND_HOLD_MS || 0);
  if (targetMapId === 6 && Number.isFinite(foregroundHold) && foregroundHold > 0) await delay(foregroundHold);
}

(async () => {
  try {
    await launch(editor);
    await wait('return !!window.reactor?.projectManager && getComputedStyle(document.getElementById("splash-screen")).display==="none";');
    await click('.welcome-button[data-action=new-project]');
    await driver.execute('for(const [id,value] of [["rr-new-project-name",arguments[0]],["diana-project-folder",arguments[1]]]){const e=document.getElementById(id);e.value=value;e.dispatchEvent(new Event("input",{bubbles:true}));}', [path.basename(project), path.dirname(project)]);
    await click('#rr-new-project-create');
    await wait('return reactor.projectController.currentProject?.path===arguments[0];', [project]);
    await screenshot('01-editor-vila');
    await driver.close(); driver = null;

    await launch(project);
    await wait('return SceneManager._scene?.constructor.name==="Scene_Title" && SceneManager._scene._commandWindow?.isOpen() && !SceneManager._scene.isBusy();');
    await key('\uE007');
    await wait('return SceneManager._scene?.constructor.name==="Scene_Map" && $gamePlayer.canMove() && !SceneManager._scene.isBusy();');
    await delay(350); await screenshot('02-praca');

    // Talk to one resident from the plaza using only navigation and the action key.
    const resident = await walkFacingEvent(8); await activate();
    await wait('return $gameMessage.isBusy();');
    const residentText = await driver.execute('return $gameMessage.allText();');
    assert.match(residentText, /jardim|caminh|flores|horta/i);
    report.conversations.push({ event: 8, text: residentText, route: resident.path.length, keyboardNavigation: true });
    await screenshot('03-dialogo-moradora'); await clearMessage();

    for (const [doorId, targetMapId, interiorNpcId, label] of [[14,6,2,'boticario'],[15,7,2,'forja'],[16,8,2,'biblioteca'],[17,9,3,'salao']]) {
      const door = await driver.execute('const e=$gameMap.event(arguments[0]);return {x:e.x,y:e.y};', [doorId]);
      await driver.execute('$gamePlayer.locate(arguments[0],arguments[1]);$gamePlayer.setDirection(8);', [door.x, door.y + 1]);
      await key('\uE007');
      await finishAutomatedTransfer(targetMapId);
      report.transfers.push({ name: label, direction: 'entrada', from: 1, to: targetMapId, actionKey: true, positionPrepared: true });
      await screenshot('interior-' + label);

      const npc = await driver.execute('const e=$gameMap.event(arguments[0]);return {x:e.x,y:e.y};', [interiorNpcId]);
      await driver.execute('$gamePlayer.locate(arguments[0],arguments[1]);$gamePlayer.setDirection(8);', [npc.x, npc.y + 1]);
      await activate();
      if (label === 'forja') {
        await wait('return $gameMessage.isBusy();', [], 15000);
        report.conversations.push({ room: label, event: interiorNpcId, text: await driver.execute('return $gameMessage.allText();') });
        await clearMessage(false);
        await wait('return SceneManager._scene?.constructor.name==="Scene_Shop";', [], 15000);
        report.conversations.push({ room: label, interaction: await driver.execute('return SceneManager._scene?.constructor.name;') });
        await key('\uE00C');
        await wait('return SceneManager._scene?.constructor.name==="Scene_Map" && !$gameMap.isEventRunning();');
      } else {
        await wait('return $gameMessage.isBusy();');
        const spoken = await driver.execute('return $gameMessage.allText();');
        assert.ok(spoken.length > 0, label + ' NPC should speak');
        report.conversations.push({ room: label, event: interiorNpcId, text: spoken });
        await clearMessage();
      }
      await driver.execute('$gamePlayer.locate(10,12);$gamePlayer.setDirection(2);');
      await key('\uE015');
      await finishAutomatedTransfer(1);
      report.transfers.push({ name: label, direction: 'saida', from: targetMapId, to: 1, steppedOntoExit: true });
    }
    await screenshot('04-praca-retorno');
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed'; report.failure = String(error.stack || error);
    if (driver) try { await screenshot('falha'); report.diagnostic = await driver.execute('const s=SceneManager._scene,e=$gameMap?.event(14),npc=$gameMap?.event(2),ss=s?._spriteset,t=ss?._tilemap;return {scene:s?.constructor.name,map:$gameMap?.mapId(),sceneReady:s?.isReady?.(),active:s?.isActive?.(),busy:s?.isBusy?.(),gameActive:SceneManager.isGameActive(),mapLoaded:s?._mapLoaded,fade:s?._fadeDuration,fadeSprite:s?._fadeSprite?.opacity,frame:Graphics.frameCount,ticker:Graphics.app?.ticker?.started,mapDataReady:DataManager.isMapLoaded(),screenChildren:s?.children?.length,tilemapReady:t?.isReady?.(),tilemapVisible:t?.visible,tilemapChildren:t?.children?.length,errors:window.__villageErrors,body:document.body.innerText,player:$gamePlayer&&{x:$gamePlayer.x,y:$gamePlayer.y,direction:$gamePlayer.direction(),normal:$gamePlayer.isNormalPriority(),canMove:$gamePlayer.canMove(),canStart:$gamePlayer.canStartLocalEvents()},npc:npc&&{x:npc.x,y:npc.y,trigger:npc._trigger,priority:npc._priorityType,normal:npc.isNormalPriority(),triggerOk:npc.isTriggerIn([0,1,2]),starting:npc.isStarting()},door:e&&{x:e.x,y:e.y,trigger:e._trigger,priority:e._priorityType,normal:e.isNormalPriority(),triggerOk:e.isTriggerIn([0,1,2]),starting:e.isStarting()},message:$gameMessage?.allText(),running:$gameMap?.isEventRunning()};'); } catch {}
    throw error;
  } finally {
    if (driver) await driver.close();
    fs.writeFileSync(path.join(run, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  }
})().catch(() => { process.exitCode = 1; });
