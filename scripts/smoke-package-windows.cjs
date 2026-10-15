'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { packageWindows } = require('./package-windows.cjs');
const { exportWindows } = require('./export-windows.cjs');
const { WebDriverClient } = require('../upstream/RPGReactor/editor/tests/smoke/webdriver-client.cjs');
const root = path.resolve(__dirname, '..');
async function main({ prepared } = {}) {
    if (process.platform !== 'win32') throw new Error('Smoke exige Windows e SDK local.');
    const artifacts = path.join(root, 'artifacts'); fs.mkdirSync(artifacts, { recursive: true });
    const run = fs.mkdtempSync(path.join(artifacts, 'windows-package-'));
    const sdk = path.join(root, 'tools', 'nwjs-sdk-v0.118.0-win-x64');
    const reportFile = path.join(run, 'report.json');
    const report = { status: 'running', run, api: {}, interaction: {}, runtime: {} };
    const save = () => fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
    save();
    let driver;
    async function launch(binary, app, profile) {
        driver = new WebDriverClient(path.join(sdk, 'chromedriver.exe'));
        await driver.start();
        await driver.createSession({ browserName: 'chrome', 'goog:chromeOptions': { binary, args: ['nwapp=' + app, 'user-data-dir=' + path.join(run, profile), 'no-first-run'] } });
        await driver.setScriptTimeout(90000);
    }
    async function keys(key, duration = 150) {
        await driver.sessionRequest('POST', '/actions', { actions: [{ type: 'key', id: 'package-keyboard', actions: [{ type: 'keyDown', value: key }, { type: 'pause', duration }, { type: 'keyUp', value: key }] }] });
    }
    try {
        const built = packageWindows({ prepared, destination: path.join(run, 'editor-original') });
        const relocated = path.join(run, 'Editor relocado');
        fs.renameSync(built.out, relocated);
        assert.equal(fs.existsSync(built.out), false);
        assert.equal(fs.existsSync(path.join(relocated, 'app/editor/node_modules/lamejs')), false);
        report.package = { relocated, files: built.report.files.length, dependencies: built.report.dependencies, distributionStatus: built.report.distributionStatus };
        await launch(path.join(relocated, 'nw.exe'), path.join(relocated, 'app/editor'), 'editor-profile');
        await driver.waitForScript('return !!window.reactor?.projectController && getComputedStyle(document.getElementById("splash-screen")).display === "none";', [], { timeout: 90000 });
        assert.equal(await driver.execute('return RRAudioExport.FORMATS.some(f=>f.id==="mp3");'), false);
        const project = path.join(run, 'Projeto original');
        const created = await driver.executeAsync(`const done=arguments[arguments.length-1];(async()=>{
            const app=reactor, pm=app.projectManager, p=arguments[0];
            if(!await pm.createNewProject(p,'Jogo portavel',{blank:false}))throw Error(pm.lastCreateError||'create failed');
            await app.projectController.openProjectAtPath(p);
            if(!await app.projectController.saveProject())throw Error('save failed');
            return {title:document.title,formats:RRAudioExport.FORMATS.map(f=>f.id),dependencies:require.resolve('pngjs')};
        })().then(done,e=>done({error:String(e.stack||e)}));`, [project]);
        assert.equal(created.error, undefined); assert.ok(created.dependencies.startsWith(relocated));
        report.api = created;
        fs.writeFileSync(path.join(run, 'editor.png'), Buffer.from(await driver.sessionRequest('GET', '/screenshot'), 'base64'));
        await driver.close(); driver = null;
        const exported = exportWindows({ project, destination: path.join(run, 'game-original') });
        const game = path.join(run, 'Jogo relocado'); fs.renameSync(exported.out, game);
        assert.equal(fs.existsSync(exported.out), false);
        await launch(path.join(game, 'nw.exe'), path.join(game, 'game'), 'game-profile');
        await driver.waitForScript('return window.SceneManager?._scene?.constructor?.name === "Scene_Title" && SceneManager._scene._commandWindow?.isOpen();', [], { timeout: 90000 });
        await keys('\uE007');
        await driver.waitForScript('return SceneManager._scene?.constructor?.name === "Scene_Map" && $gamePlayer.canMove() && !$gamePlayer.isTransferring() && Graphics.frameCount > 90;', [], { timeout: 90000 });
        const before = await driver.execute('return {x:$gamePlayer.x,y:$gamePlayer.y};');
        await keys('\uE014', 450);
        await driver.waitForScript('return !$gamePlayer.isMoving();');
        const after = await driver.execute('return {x:$gamePlayer.x,y:$gamePlayer.y};');
        assert.ok(after.x > before.x, 'seta direita movimenta jogador no jogo exportado');
        await keys('\uE00C');
        await driver.waitForScript('return SceneManager._scene?.constructor?.name === "Scene_Menu";', [], { timeout: 15000 });
        report.interaction = { titleNewGame: 'Enter WebDriver', movement: { before, after, key: 'ArrowRight' }, menu: 'Escape WebDriver' };
        report.runtime = await driver.execute('return {scene:SceneManager._scene.constructor.name,map:$gameMap.mapId(),revision:window.RPG_REACTOR_RUNTIME_REVISION};');
        fs.writeFileSync(path.join(run, 'game.png'), Buffer.from(await driver.sessionRequest('GET', '/screenshot'), 'base64'));
        report.status = 'passed';
        report.limits = 'Editor criado/salvo por API; controles reais WebDriver no jogo exportado (Enter, direita, Escape). Nao cobre export por UI, batalha ou direitos de assets de terceiros. SDK notices incompletos bloqueiam publicacao.';
    } catch (error) { report.status = 'failed'; report.error = String(error.stack || error); throw error; }
    finally { if (driver) await driver.close(); save(); console.log(reportFile); }
}
if (require.main === module) main(require('./package-windows.cjs').options(process.argv.slice(2))).catch(e => { console.error(e.stack || e); process.exitCode = 1; });
module.exports = { main };
