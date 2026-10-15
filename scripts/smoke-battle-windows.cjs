'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {WebDriverClient} = require('../upstream/RPGReactor/editor/tests/smoke/webdriver-client.cjs');
const root = path.resolve(__dirname,'..');
const sdk = path.join(root,'tools','nwjs-sdk-v0.118.0-win-x64');
const artifacts = path.join(root,'artifacts');

async function main(options = {}) {
    const prior = JSON.parse(fs.readFileSync(path.join(artifacts,'windows-smoke.json'),'utf8'));
    assert.equal(prior.status,'passed','Execute smoke:windows primeiro');
    const run = fs.mkdtempSync(path.join(artifacts,options.authoring ? 'pose-authoring-smoke-' : 'battle-smoke-'));
    const project = path.join(run,'Demonstração Diana');
    fs.cpSync(prior.project,project,{recursive:true});
    const reportFile = path.join(artifacts,options.authoring ? 'pose-authoring-smoke.json' : 'battle-smoke.json');
    const report = value => fs.writeFileSync(reportFile,JSON.stringify({at:new Date().toISOString(),project,...value},null,2));
    report({status:'running'});
    let driver;
    const open = async app => {
        driver = new WebDriverClient(path.join(sdk,'chromedriver.exe'));
        await driver.start();
        await driver.createSession({browserName:'chrome','goog:chromeOptions':{
            binary:path.join(sdk,'nw.exe'),args:['nwapp='+app,'user-data-dir='+path.join(run,path.basename(app)+'-profile'),'no-first-run']
        }});
        await driver.setScriptTimeout(90000);
    };
    try {
        await open(path.join(root,'build','diana','editor'));
        await driver.waitForScript('return !!window.reactor?.projectController && getComputedStyle(document.getElementById("splash-screen")).display === "none";',[],{timeout:90000});
        const edit = async function(projectPath) {
            const app = reactor, pc = app.projectController, db = app.databaseManager, ui = app.databaseEditorUI;
            await pc.openProjectAtPath(projectPath);
            ui.currentProject=pc.currentProject;
            const templates=ui.getDefaultTemplates(),copy=value=>JSON.parse(JSON.stringify(value));
            const klass=db.addEntry('classes',{...copy(templates.classes),name:'Classe de teste',params:Array.from({length:8},()=>Array(100).fill(100))});
            const actor=db.addEntry('actors',{...copy(templates.actors),name:'Diana',classId:klass.id,characterName:'$DianaSprite',traits:[{code:22,dataId:0,value:1}]});
            const enemy=db.addEntry('enemies',{...copy(templates.enemies),name:'Guardião',params:[20,0,10,10,10,10,10,10]});
            // This copied test project always uses deterministic damage, regardless of starter data.
            db.data.skills[1]={...copy(templates.skills),id:1,name:'Ataque',damage:{type:1,elementId:0,formula:'100',variance:0,critical:false}};
            const troop=db.addEntry('troops',{...copy(templates.troops),name:'Demonstração Diana',members:[{enemyId:enemy.id,x:300,y:300,hidden:false}]});
            // The blank project has no states; battle death uses state ID 1.
            db.data.states[1]={...copy(templates.states),id:1,name:'Nocaute',restriction:4,priority:100,removeAtBattleEnd:false};
            Object.assign(db.data.system,{sideView:true,partyMembers:[actor.id],optVictorySkip:true});
            const settings=db.data.battlePresentation ||= ReactorBattleData.empty();settings.startMessages=false;
            const edited=[];
            for(const [kind,record] of [['actors',actor],['enemies',enemy]]) {
                settings[kind][record.id]={graphic:{mode:'character',name:'$DianaSprite',folder:'characters',scale:2}};
                ui.openDatabase(kind,{select:record.id});ui.showDatabaseDetail(record,kind);
                const options=document.querySelector('details.rr-battler-graphic-card');
                const card=document.querySelector('details.rr-rectangle-poses');
                if(!options||!card)throw new Error('pose controls missing: '+kind);
                options.open=true;card.open=true;
                if(card.getBoundingClientRect().height<1)throw new Error('pose form not visible: '+kind);
                const button=text=>{const node=[...card.querySelectorAll('button')].find(b=>b.getAttribute('data-i18n-text-source')===text);if(!node||node.disabled)throw new Error('button unavailable: '+text);node.click();};
                const number=(host,label,value)=>{const row=[...host.querySelectorAll('label')].find(n=>n.firstElementChild?.textContent===label||n.firstElementChild?.getAttribute('data-i18n-text-source')===label);if(!row)throw new Error('field missing: '+label);const input=row.querySelector('input');input.value=String(value);input.dispatchEvent(new Event('change',{bubbles:true}));};
                [...card.querySelectorAll('input')].find(input=>input.getAttribute('aria-label')===I18n.formatText('New Pose Name')).value='idle';button('Create Pose');
                number(card,'Anchor X',.25);
                let frame=card.querySelector('fieldset[data-frame-index="0"]');
                number(frame,'Width (pixels)',20);frame=card.querySelector('fieldset[data-frame-index="0"]');
                number(frame,'Height (pixels)',30);frame=card.querySelector('fieldset[data-frame-index="0"]');
                number(frame,'Duration (frames)',2);button('Add Frame');
                for(const [label,value] of [['X (pixels)',30],['Y (pixels)',5],['Width (pixels)',22],['Height (pixels)',32],['Duration (frames)',5]]) {
                    number(card.querySelector('fieldset[data-frame-index="1"]'),label,value);
                }
                number(card,'Preview Time (frames)',2);button('Preview Pose');
                card.scrollIntoView({block:'start'});
                edited.push({kind,id:record.id,poses:copy(settings[kind][record.id].graphic.poses)});
            }
            if(!await pc.saveProject())throw new Error('save failed');
            return {edited,actorId:actor.id,enemyId:enemy.id,troopId:troop.id};
        };
        const authored = await driver.executeAsync('const done=arguments[arguments.length-1];('+edit.toString()+')(arguments[0]).then(done,e=>done({failure:String(e.stack||e)}));',[project]);
        assert.equal(authored.failure,undefined);
        assert.deepEqual(authored.edited[0].poses,authored.edited[1].poses);
        const authoring = options.authoring ? await options.authoring(driver,project,authored,run) : null;
        fs.writeFileSync(path.join(run,'pose-editor.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
        await driver.close();driver=null;
        await open(project);
        await driver.waitForScript('return !!window.DataManager && DataManager.isDatabaseLoaded() && SceneManager._scene?.constructor?.name === "Scene_Title";',[],{timeout:90000});
        await driver.execute('window.__battleErrors=[];addEventListener("error",e=>__battleErrors.push(String(e.error||e.message)));DataManager.setupNewGame();$gameParty.members().forEach(actor=>actor.recoverAll());BattleManager.setup(arguments[0],true,true);SceneManager.goto(Scene_Battle);',[authored.troopId]);
        await driver.waitForScript('const s=SceneManager._scene?._spriteset;return SceneManager._scene?.constructor?.name === "Scene_Battle" && s?._actorSprites?.[0]?._mainSprite?.bitmap?.isReady() && s?._enemySprites?.[0]?.bitmap?.isReady();',[],{timeout:90000,description:'side-view battle sprites'});
        let runtimeSelections = null;
        if (authoring?.expectedFrames) {
            runtimeSelections = await driver.execute(`
                const sprites=SceneManager._scene._spriteset;
                return [sprites._actorSprites[0],sprites._enemySprites[0]].map(sprite=>arguments[0].map(expected=>{
                    const graphic=ReactorBattlePresentation.graphicFor(sprite._actor||sprite._enemy);
                    sprite._rrHeldPose={motion:'selection-check',frame:expected.frame};
                    ReactorBattlePresentation.updateGraphicFrame(sprite,graphic);
                    const rect=(sprite._mainSprite||sprite)._frame;
                    sprite._rrHeldPose=null;
                    return {frame:expected.frame,x:rect.x,y:rect.y,width:rect.width,height:rect.height};
                }));
            `,[authoring.expectedFrames]);
            for (const frames of runtimeSelections) assert.deepEqual(frames,authoring.expectedFrames,'visual crop survives save and runtime');
        }
        const sample = await driver.execute(`
            const s=SceneManager._scene._spriteset;
            return [s._actorSprites[0],s._enemySprites[0]].map(sprite=>{
                const g=ReactorBattlePresentation.graphicFor(sprite._actor||sprite._enemy);
                sprite._rrHeldPose={motion:'idle',frame:1};ReactorBattlePresentation.updateGraphicFrame(sprite,g);
                const main=sprite._mainSprite||sprite;
                const result={x:main._frame.x,y:main._frame.y,width:main._frame.width,height:main._frame.height,anchorX:main.anchor.x,anchorY:main.anchor.y};
                sprite._rrHeldPose=null;return result;
            });
        `);
        for(const frame of sample)assert.deepEqual(frame,{x:30,y:5,width:22,height:32,anchorX:.25,anchorY:1});
        await driver.waitForScript('return SceneManager._scene?._fadeDuration === 0;',[],{timeout:30000,description:'battle visible after fade'});
        const ready=await driver.execute('return {phase:BattleManager._phase,party:$gameParty.members().map(a=>({id:a.actorId(),hp:a.hp,mhp:a.mhp,states:a._states})),enemies:$gameTroop.members().map(e=>({hp:e.hp,states:e._states}))};');
        assert.equal(ready.party[0].hp,100,'battle actor starts healthy');
        fs.writeFileSync(path.join(run,'battle.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
        await driver.execute('const actor=$gameParty.battleMembers()[0];actor.forceAction(1,0);BattleManager.forceAction(actor);if(BattleManager._phase === "input")BattleManager.startTurn();');
        await driver.waitForScript('return $gameTroop.isAllDead();',[],{timeout:30000,description:'attack applies damage and defeats enemy'});
        const runtime=await driver.execute('return {enemyHp:$gameTroop.members()[0].hp,allDead:$gameTroop.isAllDead(),errors:__battleErrors};');
        assert.deepEqual(runtime.errors,[]);
        assert.equal(runtime.enemyHp,0);
        report({status:'passed',authored,authoring,runtimeSelections,sample,ready,runtime,provenance:JSON.parse(fs.readFileSync(path.join(root,'build','diana','provenance.json'),'utf8')),screenshot:path.join(run,'pose-editor.png'),battleScreenshot:path.join(run,'battle.png'),
            limits:options.authoring ? 'Grade/arraste por ponteiro WebDriver real para ator/inimigo, play/pause/seek e bounds no editor, save e recortes no runtime; ataque por API; sem timeline avançada de efeitos, derrota ou comandos de batalha por mouse.' : 'Formulário DOM real para ator/inimigo, save e nova execução, batalha lateral e ataque forçado com dano; não cobre comandos de combate por mouse, derrota, trajetória ou timeline avançada.'});
        console.log('PASS: poses visuais ator/inimigo persistidas, recortes/âncoras no jogo e dano em batalha lateral. '+run);
    } catch(error) {
        let diagnostics=null;
        try {
            diagnostics=await driver?.execute('return {scene:window.SceneManager?._scene?.constructor?.name,phase:window.BattleManager?._phase,errors:window.__battleErrors,message:window.$gameMessage?.allText(),party:window.$gameParty?.members().map(a=>({hp:a.hp,mhp:a.mhp,states:a._states})),enemies:window.$gameTroop?.members().map(e=>({hp:e.hp,states:e._states}))};');
            if(driver)fs.writeFileSync(path.join(run,'failure.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
        }catch{}
        report({status:'failed',error:String(error.stack||error),diagnostics});throw error;
    }
    finally {await driver?.close();}
}
module.exports = {main};
if (require.main === module) main().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
