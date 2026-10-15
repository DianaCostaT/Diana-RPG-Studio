'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {main}=require('./smoke-battle-windows.cjs');

async function authoring(driver,project,authored,run) {
    const expectedFrames=[{frame:1,x:32,y:64,width:32,height:32},{frame:2,x:5,y:7,width:20,height:20}];
    const setup=function(kind,id) {
        const ui=reactor.databaseEditorUI,record=reactor.databaseManager.data[kind][id];
        ui.openDatabase(kind,{select:id});ui.showDatabaseDetail(record,kind);
        const options=document.querySelector('details.rr-battler-graphic-card'),card=document.querySelector('details.rr-rectangle-poses');
        options.open=true;card.open=true;
        window.__poseSmokeCard=card;
        Object.defineProperty(window,'__poseSmokeGraphic',{configurable:true,get:()=>reactor.databaseManager.data.battlePresentation[kind][id].graphic});
        window.__poseBeforePicking=JSON.stringify(__poseSmokeGraphic.poses.idle);
        return true;
    };
    const results=[];
    for(const [kind,id] of [['actors',authored.actorId],['enemies',authored.enemyId]]) {
        await driver.execute('return ('+setup.toString()+')(arguments[0],arguments[1]);',[kind,id]);
        await driver.waitForScript('return !!__poseSmokeCard.querySelector("canvas.rr-pose-sheet-canvas");',[],{timeout:15000,description:'spritesheet picker loaded'});
        await driver.execute(`
            const card=__poseSmokeCard;
            const name=[...card.querySelectorAll('input')].find(input=>input.getAttribute('aria-label')===I18n.formatText('New Pose Name'));
            name.value='selection-check';
            [...card.querySelectorAll('button')].find(b=>b.getAttribute('data-i18n-text-source')==='Create Pose').click();
            const height=card.querySelector('[data-pose-control="cell-height"]');height.value='32';height.dispatchEvent(new Event('change'));
        `);
        const coordinates=async(points)=>driver.execute(`
            const canvas=__poseSmokeCard.querySelector('canvas.rr-pose-sheet-canvas');
            canvas.scrollIntoView({block:'center'});
            const rect=canvas.getBoundingClientRect();
            return arguments[0].map(p=>({x:Math.round(rect.left+p.x*rect.width/canvas.width),y:Math.round(rect.top+p.y*rect.height/canvas.height)}));
        `,[points]);
        const move=point=>({type:'pointerMove',duration:100,origin:'viewport',...point});
        const pointer=async(points)=>{
            const positions=await coordinates(points);
            assert.equal(await driver.execute('return document.elementFromPoint(arguments[0],arguments[1])===__poseSmokeCard.querySelector("canvas.rr-pose-sheet-canvas");',[positions[0].x,positions[0].y]),true,'visible picker receives pointer');
            const actions=[move(positions[0]),{type:'pointerDown',button:0}];
            if(positions[1])actions.push(move(positions[1]));
            actions.push({type:'pointerUp',button:0});
            await driver.sessionRequest('POST','/actions',{actions:[{type:'pointer',id:'pose-sheet-mouse',parameters:{pointerType:'mouse'},actions}]});
        };
        await pointer([{x:48,y:80}]);
        let frames=await driver.execute('return __poseSmokeGraphic.poses["selection-check"].frames;');
        assert.deepEqual(frames[1],{x:32,y:64,width:32,height:32,duration:12});
        await driver.execute('const mode=__poseSmokeCard.querySelector("[data-pose-control=free-rectangle]");mode.checked=true;mode.dispatchEvent(new Event("change"));');
        await pointer([{x:5,y:7},{x:25,y:27}]);
        frames=await driver.execute('return __poseSmokeGraphic.poses["selection-check"].frames;');
        assert.deepEqual(frames[2],{x:5,y:7,width:20,height:20,duration:12});
        const before=await driver.execute('return JSON.stringify(__poseSmokeGraphic.poses);');
        await driver.execute('__poseSmokeCard.querySelector("[data-pose-control=play]").click();');
        await driver.waitForScript('return __poseSmokeCard.posePreview.playing && __poseSmokeCard.posePreview.tick>4;',[],{timeout:10000,description:'automatic preview advances'});
        const paused=await driver.execute('__poseSmokeCard.querySelector("[data-pose-control=pause]").click();return __poseSmokeCard.posePreview.tick;');
        // Observe at least a few actual animation frames while paused.
        assert.equal(await driver.executeAsync('const done=arguments[arguments.length-1];requestAnimationFrame(()=>requestAnimationFrame(()=>done(__poseSmokeCard.posePreview.tick)));'),paused);
        const seek=await driver.execute('const slider=__poseSmokeCard.querySelector("[data-pose-control=timeline]");slider.value=13;slider.dispatchEvent(new Event("input"));return __poseSmokeCard.posePreview.tick;');
        assert.equal(seek,13);
        assert.equal(await driver.execute('return JSON.stringify(__poseSmokeGraphic.poses);'),before,'play/pause/seek never edits project');
        assert.equal(await driver.execute('return JSON.stringify(__poseSmokeGraphic.poses.idle);'),await driver.execute('return __poseBeforePicking;'));
        const bounds=await driver.execute(`
            const card=__poseSmokeCard,row=[...card.querySelector('fieldset[data-frame-index="2"]').querySelectorAll('label')].find(n=>n.firstElementChild.getAttribute('data-i18n-text-source')==='Width (pixels)');
            row.querySelector('input').value='999';row.querySelector('input').dispatchEvent(new Event('change'));
            return {width:__poseSmokeGraphic.poses['selection-check'].frames[2].width,message:card.querySelector('[role=status]').textContent};
        `);
        assert.equal(bounds.width,20);
        assert.ok(bounds.message.length>0,'out-of-image crop reports error');
        const stopped=await driver.execute('const card=__poseSmokeCard;card.querySelector("[data-pose-control=play]").click();card.open=false;return true;');
        assert.equal(stopped,true);
        await driver.waitForScript('return !__poseSmokeCard.posePreview.playing;',[],{timeout:5000,description:'closed details stop animation'});
        results.push({kind,grid:frames[1],drag:frames[2],pausedTick:paused,seek,boundsError:bounds.message});
        await driver.execute('__poseSmokeCard.open=true;__poseSmokeCard.querySelector("[data-pose-control=reset]").click();const mode=__poseSmokeCard.querySelector("[data-pose-control=free-rectangle]");mode.checked=false;mode.dispatchEvent(new Event("change"));__poseSmokeCard.querySelector("canvas").scrollIntoView({block:"center"});');
        fs.writeFileSync(path.join(run,kind+'-picker.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
    }
    assert.equal(await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectController.saveProject().then(done,e=>done({failure:String(e)}));'),true);
    const data=JSON.parse(fs.readFileSync(path.join(project,'data','BattlePresentation.json'),'utf8'));
    assert.deepEqual(data.actors[authored.actorId].graphic.poses['selection-check'],data.enemies[authored.enemyId].graphic.poses['selection-check']);
    return {results,expectedFrames};
}

main({authoring}).catch(error=>{console.error(error.stack||error);process.exitCode=1;});
