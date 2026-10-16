'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const {WebDriverClient} = require('../upstream/RPGReactor/editor/tests/smoke/webdriver-client.cjs');
const sdk = path.join(root,'tools','nwjs-sdk-v0.118.0-win-x64');
const editor = process.argv[2]?path.resolve(process.argv[2]):path.join(root,'build','diana','editor');
async function main() {
    const artifacts = path.join(root,'artifacts');
    fs.mkdirSync(artifacts,{recursive:true});
    const run = fs.mkdtempSync(path.join(artifacts,'windows-smoke-'));
    const project = path.join(run,'Meu jogo');
    const reportFile = path.join(artifacts,'windows-smoke.json');
    const writeReport = report => fs.writeFileSync(reportFile,JSON.stringify({at:new Date().toISOString(),sdk:'0.118.0',project,...report},null,2));
    writeReport({status:'running'});
    let driver = new WebDriverClient(path.join(sdk,'chromedriver.exe'));
    try {
        await driver.start();
        await driver.createSession({
            browserName:'chrome',
            'goog:chromeOptions':{
                binary:path.join(sdk,'nw.exe'),
                args:['nwapp='+editor,'user-data-dir='+path.join(run,'profile'),'no-first-run']
            }
        });
        await driver.setScriptTimeout(90000);
        await driver.waitForScript('return Boolean(window.reactor?.projectController && window.reactor?.databaseManager && getComputedStyle(document.getElementById("splash-screen")).display === "none");',[],{
            timeout:90000,description:'Diana NW.js initialization'
        });
        const runInEditor = async function(projectPath) {
            const app = window.reactor;
            const manager = app.projectManager;
            const controller = app.projectController;
            if (!await manager.createNewProject(projectPath,'Meu jogo',{blank:false,dianaSample:false}))
                throw new Error(manager.lastCreateError || 'create failed');
            const project = await manager.loadProject(projectPath);
            if (!project) throw new Error('load failed');
            if (!await app.databaseManager.loadAllData(projectPath)) throw new Error('database failed');
            await controller.openProjectAtPath(projectPath);
            const tiles = controller.tilemapManager;
            if (!tiles?.currentMap) throw new Error('map viewport failed');
            const fs = manager.fs, path = manager.path;
            const source = path.join(projectPath,'..','assets-originais');
            fs.mkdirSync(source,{recursive:true});
            const imported = [];
            for (const [category,name,width,height,color] of [
                ['tilesets','DianaTiles',384,768,[54,124,80,255]],
                ['characters','$DianaSprite',96,128,[230,174,64,255]],
                ['parallaxes','DianaParallax',960,720,[22,32,64,255]]
            ]) {
                const file = path.join(source,name+'.png');
                manager.writeSolidPng(file,width,height,color);
                const folder = ResourceManager.folderDefinitions(RRAssetFiles.AUDIO_EXTENSIONS).find(item=>item.id===category);
                const result = ResourceManager.importBytes({fs,path,assetFiles:RRAssetFiles,projectRoot:projectPath,
                    folder,sourceName:name+'.png',sourceBytes:fs.readFileSync(file),
                    writeAtomic:manager._writeFileAtomic.bind(manager)});
                if (result.collision || !fs.existsSync(result.destination)) throw new Error('asset import failed: '+name);
                imported.push(result.logicalName);
            }
            const tileset = app.databaseManager.data.tilesets[tiles.currentMap.tilesetId];
            tileset.tilesetNames[5]='DianaTiles';
            await tiles.refreshTilesetImages(tileset);
            tiles.renderMap();
            Object.assign(tiles.currentMap,{parallaxName:'DianaParallax',parallaxShow:true,
                parallaxLoopX:true,parallaxLoopY:false,parallaxSx:1,parallaxSy:0});
            await tiles.renderParallax();
            const events = app.eventManager;
            const page = events.makeDefaultEventPage({image:{characterName:'$DianaSprite'},trigger:0,
                list:[{code:101,indent:0,parameters:['',0,0,2]},
                    {code:401,indent:0,parameters:['Olá, Diana!']},{code:0,indent:0,parameters:[]}]});
            const event = events.makeQuickEvent(4,4,'Boas-vindas',[page]);
            if (!events.commitQuickEvent(event)) throw new Error('event creation failed');
            tiles.setTileAt(2,3,1,0);
            tiles.setTileAt(2,3,2,1);
            if (tiles.getTileAt(2,3,0)!==1 || tiles.getTileAt(2,3,1)!==2) throw new Error('layers failed');
            controller.currentProject.dianaSmoke = 'persistido';
            if (!await controller.saveProject()) throw new Error('save failed');
            const reopened = await manager.loadProject(projectPath);
            return {name:reopened.name, token:reopened.dianaSmoke, language:window.I18n.currentLanguage(),
                diana:reopened.diana, template:manager.getTemplateProjectPath(),title:document.title,imported,eventId:event.id};
        };
        const script = 'const done=arguments[arguments.length-1]; ('+runInEditor.toString()+')(arguments[0]).then(done,error=>done({error:String(error.stack||error)}));';
        const result = await driver.executeAsync(script,[project]);
        assert.equal(result.error,undefined);
        assert.equal(result.token,'persistido');
        assert.equal(result.language,'pt');
        assert.equal(result.diana.schemaVersion,1);
        assert.equal(result.template,null);
        assert.match(result.title,/Diana RPG Studio/);
        assert.deepEqual(result.imported,['DianaTiles','$DianaSprite','DianaParallax']);
        const pointer = await driver.execute(`
            const app=reactor,t=app.projectController.tilemapManager,m=app.mapEditor,p=app.tilesetPaletteViewer;
            app.eventManager.setEventMode(false);m.setEnabled(true);m.setTool('pencil');m.setLayerMode(0);
            p.currentLayer='B';p.selectedTiles=[{layer:'B',x:3,y:0}];
            const point=t.container.toGlobal(new PIXI.Point(6.5*t.TILE_WIDTH,4.5*t.TILE_HEIGHT));
            const rect=t.app.canvas.getBoundingClientRect();
            return {x:Math.round(rect.left+point.x*rect.width/t.app.screen.width),y:Math.round(rect.top+point.y*rect.height/t.app.screen.height),before:t.getTileAt(6,4,0)};
        `);
        assert.equal(await driver.execute('return document.elementFromPoint(arguments[0],arguments[1]) === reactor.projectController.tilemapManager.app.canvas;',[pointer.x,pointer.y]),true,'pointer targets the visible map canvas');
        await driver.sessionRequest('POST','/actions',{actions:[{type:'pointer',id:'map-mouse',parameters:{pointerType:'mouse'},actions:[
            {type:'pointerMove',duration:0,origin:'viewport',x:pointer.x,y:pointer.y},
            {type:'pointerDown',button:0},{type:'pause',duration:100},{type:'pointerUp',button:0}
        ]}]});
        assert.equal(await driver.execute('return reactor.projectController.tilemapManager.getTileAt(6,4,0);'),3,'mouse stroke paints selected tile');
        const history = await driver.execute('const m=reactor.mapEditor,t=reactor.projectController.tilemapManager;m.undo();const undo=t.getTileAt(6,4,0);m.redo();return {undo,redo:t.getTileAt(6,4,0)};');
        assert.deepEqual(history,{undo:pointer.before,redo:3});
        assert.equal(await driver.executeAsync('const done=arguments[arguments.length-1];reactor.projectController.saveProject().then(done,e=>done({failure:String(e)}));'),true);
        result.pointer={paintedTile:3,cell:[6,4],history};
        const map=JSON.parse(fs.readFileSync(path.join(project,'data','Map001.json'),'utf8'));
        assert.equal(map.data[3*map.width+2],1);
        assert.equal(map.data[map.width*map.height+3*map.width+2],2);
        assert.equal(map.data[4*map.width+6],3);
        assert.equal(map.parallaxName,'DianaParallax');
        assert.equal(map.events[result.eventId].pages[0].list[1].parameters[0],'Olá, Diana!');
        const metadata=JSON.parse(fs.readFileSync(path.join(project,'project.rpgreactor'),'utf8'));
        assert.equal(metadata.dianaSmoke,'persistido');
        assert.ok(fs.existsSync(path.join(project,'data','Map001.json')));
        assert.ok(fs.existsSync(path.join(project,'js','reactor_main.js')));
        assert.deepEqual(fs.readdirSync(path.join(project,'js','plugins')),[]);
        for (const notice of ['LICENSE','THIRD_PARTY_NOTICES.md']) {
            assert.equal(fs.readFileSync(path.join(project,notice),'utf8'),fs.readFileSync(path.join(editor,'..',notice),'utf8'));
        }
        const screenshot=await driver.sessionRequest('GET','/screenshot');
        fs.writeFileSync(path.join(run,'editor.png'),Buffer.from(screenshot,'base64'));
        await driver.close();
        driver = new WebDriverClient(path.join(sdk,'chromedriver.exe'));
        await driver.start();
        await driver.createSession({browserName:'chrome','goog:chromeOptions':{
            binary:path.join(sdk,'nw.exe'),args:['nwapp='+project,'user-data-dir='+path.join(run,'game-profile'),'no-first-run']
        }});
        await driver.waitForScript('return Boolean(window.DataManager && DataManager.isDatabaseLoaded() && SceneManager._scene?.constructor?.name === "Scene_Title");',[],{
            timeout:90000,description:'generated game title scene'
        });
        await driver.execute('window.__dianaErrors=[];addEventListener("error",e=>__dianaErrors.push(String(e.error||e.message)));DataManager.setupNewGame();SceneManager.goto(Scene_Map);');
        await driver.waitForScript('return SceneManager._scene?.constructor?.name === "Scene_Map" && $gameMap.mapId()===1 && !!SceneManager._scene._spriteset;',[],{
            timeout:90000,description:'generated game map scene'
        });
        await driver.execute('window.__dianaEvent = $gameMap.events().find(event=>event.event().name === "Boas-vindas");if (!__dianaEvent) throw new Error("runtime event missing");__dianaEvent.start();');
        await driver.waitForScript('return $gameMessage.allText().includes("Olá, Diana!");',[],{timeout:15000,description:'runtime event dialogue'});
        const runtime = await driver.execute('return {scene:SceneManager._scene.constructor.name,mapId:$gameMap.mapId(),parallax:$gameMap.parallaxName(),message:$gameMessage.allText(),errors:__dianaErrors,revision:RPG_REACTOR_RUNTIME_REVISION};');
        assert.equal(runtime.parallax,'DianaParallax');
        assert.equal(runtime.message,'Olá, Diana!');
        assert.deepEqual(runtime.errors,[]);
        fs.writeFileSync(path.join(run,'game.png'),Buffer.from(await driver.sessionRequest('GET','/screenshot'),'base64'));
        writeReport({status:'passed',result,runtime,provenance:JSON.parse(fs.readFileSync(path.join(editor,'..','provenance.json'),'utf8')),
            limits:'APIs de projeto/assets/eventos/parallax, duas camadas persistidas, pintura por ponteiro WebDriver real e undo/redo por API; jogo e diálogo executados; não cobre colisão, foreground ou batalha completa',
            screenshot:path.join(run,'editor.png'),gameScreenshot:path.join(run,'game.png')});
        console.log('PASS: editor Windows, português, assets, evento, parallax, persistência e jogo executado. '+run);
    } catch (error) {
        writeReport({status:'failed',error:String(error.stack||error)});
        throw error;
    } finally { await driver.close(); }
}
main().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
