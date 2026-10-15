'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {WebDriverClient} = require('../upstream/RPGReactor/editor/tests/smoke/webdriver-client.cjs');
const root = path.resolve(__dirname,'..'), artifacts=path.join(root,'artifacts');
const sdk=path.join(root,'tools','nwjs-sdk-v0.118.0-win-x64');
async function main({outcome='victory'}={}) {
    const run=fs.mkdtempSync(path.join(artifacts,'starter-smoke-')), project=path.join(run,'Meu primeiro jogo');
    let driver;
    const report=details=>fs.writeFileSync(path.join(artifacts,outcome==='victory'?'starter-smoke.json':'starter-'+outcome+'-smoke.json'),JSON.stringify({at:new Date().toISOString(),project,outcome,...details},null,2));
    const open=async app=>{
        driver=new WebDriverClient(path.join(sdk,'chromedriver.exe'));
        await driver.start();
        await driver.createSession({browserName:'chrome','goog:chromeOptions':{binary:path.join(sdk,'nw.exe'),args:['nwapp='+app,'user-data-dir='+path.join(run,path.basename(app)+'-profile'),'no-first-run']}});
        await driver.setScriptTimeout(90000);
        await driver.execute('nw.Window.get().focus();');
    };
    const key=async value=>driver.sessionRequest('POST','/actions',{actions:[{type:'key',id:'player',actions:[{type:'keyDown',value},{type:'pause',duration:100},{type:'keyUp',value}]}]});
    const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    const shot=async name=>fs.writeFileSync(path.join(run,name+'.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
    report({status:'running'});
    try {
        await open(path.join(root,'build','diana','editor'));
        await driver.waitForScript('return !!window.reactor?.projectManager && getComputedStyle(document.getElementById("splash-screen")).display === "none";',[],{timeout:90000});
        assert.equal(await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectManager.createNewProject(arguments[0],"Meu primeiro jogo").then(done,e=>done({failure:String(e)}));',[project]),true);
        await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectController.openProjectAtPath(arguments[0]).then(done,e=>done({failure:String(e)}));',[project]);
        await driver.execute('window.__originalClass=reactor.databaseManager.data.actors[1].classId;reactor.databaseManager.data.actors[1].classId=999;window.__validationResult="pending";reactor.playtest().then(result=>window.__validationResult=result);');
        await driver.waitForScript('return document.querySelector(".rr-dialog-message")?.textContent.includes("classe válida");',[],{timeout:10000});
        await shot('project-validation');
        await driver.execute('document.querySelector("#rr-themed-dialog .rr-button-primary").click();');
        await driver.waitForScript('return window.__validationResult===false;',[],{timeout:10000});
        await driver.execute('reactor.databaseManager.data.actors[1].classId=window.__originalClass;');
        await driver.close(); driver=null;
        if(outcome==='defeat') {
            const file=path.join(project,'data','Enemies.json'), records=JSON.parse(fs.readFileSync(file,'utf8'));
            records[1].params[2]=999; records[1].params[3]=999;
            fs.writeFileSync(file,JSON.stringify(records));
        }
        await open(project);
        await driver.waitForScript('return window.SceneManager?._scene?.constructor.name === "Scene_Title" && SceneManager._scene._commandWindow?.isOpen() && SceneManager._scene.isActive() && !SceneManager._scene.isBusy();',[],{timeout:90000});
        console.log('Título pronto; Enter');
        await key('\uE007');
        await driver.waitForScript('return SceneManager._scene?.constructor.name === "Scene_Map" && $gamePlayer?.canMove() && !SceneManager._scene.isBusy();',[],{timeout:30000});
        console.log('Mapa pronto');
        await driver.execute('window.__starterErrors=[];addEventListener("error",e=>__starterErrors.push(String(e.error||e.message)));');
        const initial=await driver.execute('return {x:$gamePlayer.x,y:$gamePlayer.y,hp:$gameParty.leader().hp,maxHp:$gameParty.leader().mhp,graphic:$gamePlayer.characterName()};');
        assert.deepEqual([initial.x,initial.y],[8,6]); assert.equal(initial.hp,initial.maxHp); assert.equal(initial.graphic,'$Diana');
        // Enter starts an ordinary action-button event in front of the player.
        await key('\uE007');
        await driver.waitForScript('return $gameMessage.isBusy() && SceneManager._scene._messageWindow?.pause && SceneManager._scene._messageWindow._waitCount===0;',[],{timeout:15000});
        await shot('dialogue'); await key('\uE007');
        await driver.waitForScript('return SceneManager._scene?.constructor.name === "Scene_Battle";',[],{timeout:30000});
        const commands=[];
        for(let i=0;i<100;i++) {
            const state=await driver.execute(`const scene=SceneManager._scene;return {scene:scene.constructor.name,party:!!scene._partyCommandWindow?.isOpenAndActive(),actor:!!scene._actorCommandWindow?.isOpenAndActive(),target:!!scene._enemyWindow?.isOpenAndActive(),message:!!scene._messageWindow?.pause&&scene._messageWindow._waitCount===0,hp:$gameTroop.members()[0]?.hp,actorHp:$gameParty.leader().hp,inBattle:$gameParty.inBattle()};`);
            if(state.scene==='Scene_Map' && !state.inBattle)break;
            if(state.party||state.actor||state.target||state.message) {
                commands.push(state);
                if(state.actor && !commands.some((v,j)=>j<commands.length-1&&v.actor))await shot('battle');
                if(outcome==='escape' && state.party && await driver.execute('return SceneManager._scene._partyCommandWindow.isOpenAndActive();')) {
                    await key('\uE015');
                    assert.equal(await driver.execute('return SceneManager._scene._partyCommandWindow.index();'),1);
                }
                await key('\uE007');
            }
            await delay(250);
        }
        await driver.waitForScript('return SceneManager._scene?.constructor.name === "Scene_Map" && !$gameParty.inBattle() && $gamePlayer.canMove();',[],{timeout:15000});
        if(outcome!=='escape') {
            assert.ok(commands.some(s=>s.actor),'player selected attack');
            assert.ok(commands.some(s=>s.target),'player selected an enemy');
        }
        const result=await driver.execute('return {exp:$gameParty.leader().currentExp(),hp:$gameParty.leader().hp,dead:$gameTroop.isAllDead(),errors:__starterErrors,textColour:ColorManager.textColor(0)};');
        assert.equal(result.dead,outcome==='victory');
        assert.equal(result.exp,outcome==='victory'?5:0);
        assert.ok(result.hp>0); assert.deepEqual(result.errors,[]);
        if(outcome==='defeat')assert.equal(result.hp,1,'canLose revives the defeated party');
        assert.equal(result.textColour,'#f2f0ff','starter windowskin uses legible text palette');
        await shot(outcome+'-map');
        report({status:'passed',initial,result,keyboardSelections:commands,evidence:run,scope:'Criação via API do editor; início de jogo, diálogo e batalha por teclado real, sem forceAction ou setupNewGame no runtime. Derrota usa inimigo fortalecido apenas no fixture salvo.'});
        console.log('Projeto inicial: exploração, diálogo e '+outcome+' por teclado passaram. '+run);
    } catch(error) {
        if(driver)try{await shot('failure');}catch{}
        const diagnostic=driver?await driver.execute('const s=window.SceneManager?._scene;return {scene:s?.constructor.name,busy:s?.isBusy(),openness:s?._commandWindow?.openness,keys:window.Input?._currentState,text:document.body.innerText};').catch(()=>null):null;
        report({status:'failed',failure:String(error.stack||error),diagnostic,evidence:run}); throw error;
    } finally {if(driver)await driver.close().catch(()=>{});}
}
if(require.main===module)main({outcome:process.argv[2]||'victory'}).catch(error=>{console.error(error);process.exitCode=1;});
module.exports={main};
