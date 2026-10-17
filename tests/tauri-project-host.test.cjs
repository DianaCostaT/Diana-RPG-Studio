'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '../src/DianaTauriHost.js'), 'utf8');
const atomicSource = fs.readFileSync(path.resolve(__dirname, '../build/diana/editor/src/utils/FsAtomic.js'), 'utf8');
const projectManagerSource = fs.readFileSync(path.resolve(__dirname, '../build/diana/editor/src/ProjectManager.js'), 'utf8');
function loadHost(invoke) {
    class ProjectController {}
    const window = { __TAURI__: { core: { invoke } }, ProjectController, RRDialog: { alert: async () => {} } };
    const context = { window, ProjectController, module: { exports: {} }, localStorage: { getItem: () => null, removeItem() {} }, TextEncoder, TextDecoder, Uint8Array, ArrayBuffer, Map, Set, Error, String, Object, Promise, atob, btoa, crypto: globalThis.crypto };
    vm.runInNewContext(source, context);
    return { ...context.module.exports, host: window.RPGReactorHost, controller: ProjectController.prototype, window, context };
}

test('Tauri bridge accepts canonical Windows drive and UNC project paths', () => {
    const { normalize } = loadHost(async () => {});
    assert.equal(normalize('\\\\?\\C:\\Projetos\\Clareira'), 'C:\\Projetos\\Clareira');
    assert.equal(normalize('\\\\?\\UNC\\servidor\\jogos\\Clareira'), '\\\\servidor\\jogos\\Clareira');
    assert.equal(normalize('\\\\servidor\\jogos\\Clareira'), '\\\\servidor\\jogos\\Clareira');
});

test('Tauri mirror opens a selected project and flushes only changed files', async () => {
    const calls = [];
    const app = loadHost(async (command, args) => {
        calls.push([command, args]);
        if (command === 'choose_project_directory') return 'C:\\Games\\Clareira';
        if (command === 'read_project_files') return ['project.rpgreactor', 'data/System.json'];
        if (command === 'read_project_file') return Buffer.from(args.relative === 'project.rpgreactor' ? '{"name":"Clareira"}' : '{"gameTitle":"Clareira"}').toString('base64');
        if (command === 'save_project_changes') return null;
        throw new Error('Unexpected command: ' + command);
    });
    const directory = await app.host.chooseProjectDirectory();
    await app.host.mountProject(directory);
    const projectFile = app.host.path.join(directory, 'project.rpgreactor');
    assert.equal(app.host.fs.readFileSync(projectFile, 'utf8'), '{"name":"Clareira"}');
    app.host.fs.writeFileSync(app.host.path.join(directory, 'data/System.json'), '{"gameTitle":"Novo título"}', 'utf8');
    await app.host.flush();
    const save = calls.find(([command]) => command === 'save_project_changes');
    assert.equal(save[0], 'save_project_changes');
    assert.deepEqual(JSON.parse(JSON.stringify(save[1].files)), [{ path: 'data/System.json', content: Buffer.from('{"gameTitle":"Novo título"}').toString('base64') }]);
    assert.deepEqual(JSON.parse(JSON.stringify(save[1].deleted)), []);
    assert.equal(app.host.fs._snapshot().dirty, 0);
});

test('Tauri project metadata and map list save through the overlay without Node file descriptors', async () => {
    const calls = [];
    const app = loadHost(async (command, args) => {
        calls.push([command, args]);
        if (command === 'save_project_changes') return null;
        throw new Error('Unexpected command: ' + command);
    });
    const root = 'C:\\Games\\Clareira';
    app.host.fs._mount(root, [
        { path: 'project.rpgreactor', content: Buffer.from('{"name":"Clareira"}').toString('base64') },
        { path: 'data/MapInfos.json', content: Buffer.from('[null,{"id":1,"name":"Vila"}]').toString('base64') }
    ]);
    vm.runInNewContext(atomicSource, app.context);
    vm.runInNewContext(projectManagerSource, app.context);
    assert.equal('renameSync' in app.host.fs, false);
    const manager = vm.runInNewContext('new ProjectManager()', app.context);
    const saved = await manager.saveProject({ name: 'Clareira', path: root, maps: [null, { id: 1, name: 'Vila atualizada' }] });
    assert.equal(saved, true);
    await app.host.flush();
    const persisted = calls.find(([command]) => command === 'save_project_changes');
    assert.deepEqual(
        JSON.parse(JSON.stringify(persisted[1].files.map(file => file.path).sort())),
        ['data/MapInfos.json', 'project.rpgreactor']
    );
});

test('opening an older Tauri project refreshes its saved directional sprite runtime', async () => {
    const app = loadHost(async command => { if (command === 'save_project_changes') return null; throw new Error('Unexpected command: ' + command); });
    const root = 'C:\\Games\\Clareira', revision = '20261017.diana1';
    const current = `// RPG Reactor runtime version: 0.99.0\n// RPG Reactor runtime revision: ${revision}\nglobalThis.RPG_REACTOR_RUNTIME_REVISION = "${revision}";`;
    app.host.version = '0.99.0';
    assert.equal(app.host.runtimePath, 'C:\\Luae RPG\\runtime');
    app.host.fs._mountResources([
        { path: 'runtime/reactor_main.js', content: Buffer.from(current).toString('base64') },
        { path: 'runtime/reactor_objects_legacy.js', content: Buffer.from('current character direction contract').toString('base64') },
        { path: 'runtime/reactor_sprites.js', content: Buffer.from('current directional frame crop').toString('base64') }
    ]);
    app.host.fs._mount(root, [
        { path: 'index.html', content: Buffer.from('<script src="js/reactor_main.js"></script>').toString('base64') },
        { path: 'project.rpgreactor', content: Buffer.from('{"engineVersion":"0.99.0"}').toString('base64') },
        { path: 'js/reactor_main.js', content: Buffer.from(current).toString('base64') },
        { path: 'js/reactor_objects_legacy.js', content: Buffer.from('old character direction contract').toString('base64') },
        { path: 'js/reactor_sprites.js', content: Buffer.from('old directional frame crop').toString('base64') }
    ]);
    assert.equal(app.host.fs.existsSync('C:\\Luae RPG\\runtime\\reactor_main.js'), true);
    assert.equal(app.host.fs.existsSync(app.host.path.join(root, 'index.html')), true);
    vm.runInNewContext(atomicSource, app.context);
    vm.runInNewContext(projectManagerSource, app.context);
    const manager = vm.runInNewContext('new ProjectManager()', app.context), project = { engineVersion: '0.99.0', name: 'Clareira' };
    const result = await manager.refreshReactorRuntime(root, project);
    assert.equal(result.updated, true, JSON.stringify(result));
    assert.equal(app.host.fs.readFileSync(app.host.path.join(root, 'js/reactor_sprites.js'), 'utf8'), 'current directional frame crop');
    assert.equal(app.host.fs.readFileSync(app.host.path.join(root, 'js/reactor_objects_legacy.js'), 'utf8'), 'current character direction contract');
});

test('Tauri playtest saves first, serves the selected project URL and resumes the editor when closed', async () => {
    const calls = [], elements = new Map();
    const app = loadHost(async (command, args) => {
        calls.push([command, args]);
        if (command === 'save_project_changes' || command === 'set_playtest_project') return null;
        throw new Error('Unexpected command: ' + command);
    });
    const document = {
        body: { appendChild(element) { elements.set(element.id, element); } },
        getElementById(id) { return elements.get(id) || null; },
        createElement(tagName) {
            const element = { tagName, style: {}, children: [], append(...children) { this.children.push(...children); } };
            if (tagName === 'section') element.querySelector = selector => selector === 'iframe' ? element.children[1] : null;
            return element;
        }
    };
    app.window.document = document;
    const root = 'C:\\Games\\Clareira';
    app.host.fs._mount(root, [{ path: 'project.rpgreactor', content: Buffer.from('{}').toString('base64') }]);
    app.host.projectRoot = root;
    let stopped = false, resumed = false, saved = false;
    app.window.reactor = { projectController: {
        saveAll: async () => { saved = true; app.host.fs.writeFileSync(root + '\\project.rpgreactor', '{"saved":true}'); return true; },
        app: { stop() { stopped = true; }, start() { resumed = true; } }
    } };

    assert.equal(await app.host.openPlaytest('test&btest'), true);
    assert.equal(saved, true);
    assert.equal(stopped, true);
    assert.equal(app.host.fs._snapshot().dirty, 0);
    assert.deepEqual(calls.map(([command]) => command), ['save_project_changes', 'set_playtest_project']);
    assert.equal(calls[1][1].path, root);
    const modal = document.getElementById('diana-tauri-playtest-modal'), frame = modal.children[1];
    assert.equal(modal.style.display, 'flex');
    assert.match(frame.src, /^http:\/\/diana-project\.localhost\/index\.html\?test&btest&rrSnapshot=/);
    modal.children[0].children[1].onclick();
    assert.equal(modal.style.display, 'none');
    assert.equal(frame.src, 'about:blank');
    assert.equal(resumed, true);
});

test('Tauri playtest does not open if saving fails', async () => {
    let selectedProject = false;
    const app = loadHost(async command => {
        if (command === 'set_playtest_project') selectedProject = true;
        return null;
    });
    app.window.document = { getElementById: () => null };
    app.host.fs._mount('C:\\Games\\Clareira', [{ path: 'project.rpgreactor', content: Buffer.from('{}').toString('base64') }]);
    app.host.projectRoot = 'C:\\Games\\Clareira';
    app.window.reactor = { projectController: { saveAll: async () => false } };
    assert.equal(await app.host.openPlaytest('test'), false);
    assert.equal(selectedProject, false);
});

test('Tauri project mirror rejects path traversal and records deleted files', async () => {
    const app = loadHost(async (command, args) => {
        if (command === 'read_project_files') return ['project.rpgreactor', 'data/Map001.json'];
        if (command === 'read_project_file') return Buffer.from('{}').toString('base64');
        if (command === 'save_project_changes') return null;
        return [];
    });
    await app.host.mountProject('C:\\Games\\Clareira');
    assert.throws(() => app.host.fs.readFileSync('C:\\Games\\Other\\secret.json'), /fora da pasta/);
    app.host.fs.unlinkSync('C:\\Games\\Clareira\\data\\Map001.json');
    await app.host.flush();
    assert.equal(app.host.fs._snapshot().dirty, 0);
});

test('read-only app runtime is separate from writable project files', () => {
    const app = loadHost(async () => null);
    app.host.fs._mountResources([
        { path: 'runtime/reactor_main.js', content: Buffer.from('runtime').toString('base64') },
        { path: 'LICENSE', content: Buffer.from('license').toString('base64') }
    ]);
    app.host.fs._create('C:\\Games\\Novo');
    assert.equal(app.host.fs.readFileSync('C:\\Luae RPG\\runtime\\reactor_main.js', 'utf8'), 'runtime');
    assert.equal(app.host.fs.readFileSync('C:\\Luae RPG\\LICENSE', 'utf8'), 'license');
    assert.throws(() => app.host.fs.writeFileSync('C:\\Luae RPG\\runtime\\reactor_main.js', 'alterado'), /fora da pasta/);
});

test('startup resource gate mounts Pixi before project rendering and skips duplicate loading', async () => {
    let resourceReads = 0, pixiLoads = 0;
    const app = loadHost(async command => {
        assert.equal(command, 'read_app_resources');
        resourceReads++;
        return [
            { path: 'runtime/libs/pako.min.js', content: Buffer.from('this.pako={deflate(){}};').toString('base64') },
            { path: 'runtime/libs/pixi.js', content: Buffer.from('globalThis.PIXI={Application:function Application(){}};').toString('base64') }
        ];
    });
    app.window.document = {
        createElement() { return { dataset: {}, text: '' }; },
        head: { appendChild(script) { pixiLoads++; vm.runInNewContext(script.text, app.window); } }
    };

    await app.host.ensureRuntime();
    await app.host.ensureRuntime();

    assert.equal(app.host.isTauri, true);
    assert.equal(resourceReads, 1);
    assert.equal(pixiLoads, 1);
    assert.equal(typeof app.window.PIXI.Application, 'function');
});

test('opening a Tauri project mounts the selected directory instead of creating /demo', async () => {
    let opened = null;
    const app = loadHost(async command => {
        if (command === 'choose_project_directory') return 'C:\\Games\\Clareira';
        if (command === 'read_project_files') return ['project.rpgreactor'];
        if (command === 'read_project_file') return Buffer.from('{}').toString('base64');
        throw new Error('Unexpected command: ' + command);
    });
    const instance = {
        currentProject: null,
        confirmUnsavedChanges: async () => true,
        uiManager: { updateStatus() {} },
        openProjectAtPath: async path => { opened = path; instance.currentProject = { path }; }
    };
    assert.equal(await app.controller.openProject.call(instance), true);
    assert.equal(opened, 'C:\\Games\\Clareira');
});

test('Tauri creates the Diana starter project in the chosen folder and opens it', async () => {
    const calls = [];
    const app = loadHost(async (command, args) => {
        calls.push(command);
        if (command === 'choose_project_directory') return 'C:\\Games';
        if (command === 'create_project_directory') return 'C:\\Games\\Novo RPG';
        if (command === 'save_project_changes') return null;
        if (command === 'read_project_files') return ['project.rpgreactor'];
        if (command === 'read_project_file') return Buffer.from('{"name":"Novo RPG"}').toString('base64');
        if (command === 'read_starter_resources') return [];
        return null;
    });
    app.host.runtimeReady = true;
    const instance = {
        currentProject: null,
        confirmUnsavedChanges: async () => true,
        uiManager: { showNewProjectDialog: async () => ({ name: 'Novo RPG', mode: '2d' }), updateStatus() {} },
        projectManager: { isSafeProjectName: () => true, createNewProject: async target => { app.host.fs.writeFileSync(app.host.path.join(target, 'project.rpgreactor'), '{"name":"Novo RPG"}'); return true; } },
        openProjectAtPath: async target => { instance.currentProject = { path: target }; }
    };
    assert.equal(await app.controller.newProject.call(instance), true);
    assert.equal(instance.currentProject.path, 'C:\\Games\\Novo RPG');
    assert.ok(calls.includes('create_project_directory'));
    assert.ok(calls.includes('save_project_changes'));
});

test('Tauri serializes saves and keeps edits made during a pending write dirty', async () => {
    let release, entered;
    const reached = new Promise(resolve => { entered = resolve; }), calls = [];
    const app = loadHost(async (command, args) => {
        assert.equal(command, 'save_project_changes'); calls.push(args);
        if (calls.length === 1) { entered(); await new Promise(resolve => { release = resolve; }); }
    });
    const root = 'C:\\Games\\Save', file = root + '\\data\\System.json';
    app.host.fs._create(root); app.host.fs.writeFileSync(file, 'primeira');
    const first = app.host.flush(); await reached;
    app.host.fs.writeFileSync(file, 'segunda'); const second = app.host.flush();
    assert.equal(calls.length, 1, 'the second save waits for the first'); release(); await first;
    await second;
    assert.deepEqual(calls.map(call => Buffer.from(call.files[0].content, 'base64').toString()), ['primeira', 'segunda']);
    assert.equal(app.host.fs._snapshot().dirty, 0);
});

test('failed Tauri save retains dirty bytes and can be retried', async () => {
    let fail = true;
    const app = loadHost(async () => { if (fail) throw Error('disco indisponível'); });
    app.host.fs._create('C:\\Games\\Retry'); app.host.fs.writeFileSync('C:\\Games\\Retry\\project.rpgreactor', '{}');
    await assert.rejects(app.host.flush(), /disco/); assert.equal(app.host.fs._snapshot().dirty, 1);
    fail = false; await app.host.flush(); assert.equal(app.host.fs._snapshot().dirty, 0);
});

test('a completed write for an old project does not mark a newly mounted project clean', async () => {
    let release, entered;
    const reached = new Promise(resolve => { entered = resolve; });
    const app = loadHost(async () => { entered(); await new Promise(resolve => { release = resolve; }); });
    app.host.fs._create('C:\\Games\\Old'); app.host.fs.writeFileSync('C:\\Games\\Old\\file.json', 'old');
    const save = app.host.flush(); await reached;
    app.host.fs._create('C:\\Games\\New'); app.host.fs.writeFileSync('C:\\Games\\New\\file.json', 'new'); release(); await save;
    assert.equal(app.host.fs._snapshot().dirty, 1);
    assert.equal(app.host.fs.readFileSync('C:\\Games\\New\\file.json', 'utf8'), 'new');
});

test('starter resources merge with runtime and are requested only once', async () => {
    let calls = 0;
    const app = loadHost(async command => {
        assert.equal(command, 'read_starter_resources'); calls++;
        return [{ path: 'editor/diana-assets/jrpg-test/manifest.json', content: Buffer.from('{"version":1}').toString('base64') }];
    });
    app.host.fs._mountResources([{ path: 'runtime/reactor_main.js', content: Buffer.from('runtime').toString('base64') }]);
    await app.host.ensureStarterResources(); await app.host.ensureStarterResources();
    assert.equal(calls, 1);
    assert.equal(app.host.fs.readFileSync('C:\\Luae RPG\\runtime\\reactor_main.js', 'utf8'), 'runtime');
    assert.equal(app.host.fs.readFileSync('C:\\Luae RPG\\editor\\diana-assets\\jrpg-test\\manifest.json', 'utf8'), '{"version":1}');
});

test('Tauri export persists pending changes before selecting and exporting', async () => {
    const calls = [];
    const app = loadHost(async (command, args) => {
        calls.push(command);
        if (command === 'choose_project_directory') return 'C:\\Exports';
        if (command === 'export_game') { assert.equal(args.projectPath, 'C:\\Games\\Export'); return 'C:\\Exports\\Clareira'; }
    });
    app.host.projectRoot = app.host.fs._create('C:\\Games\\Export');
    app.window.reactor = { projectController: { async saveAll() { calls.push('saveAll'); app.host.fs.writeFileSync('C:\\Games\\Export\\data.json', '{}'); return true; } } };
    assert.equal(await app.host.exportProject(), 'C:\\Exports\\Clareira');
    assert.deepEqual(calls, ['saveAll', 'save_project_changes', 'choose_project_directory', 'export_game']);
});

test('Tauri export cancellation and failed saving never invoke the exporter', async () => {
    const calls = [];
    const app = loadHost(async command => { calls.push(command); return null; });
    app.host.projectRoot = 'C:\\Games\\Export';
    app.window.reactor = { projectController: { saveAll: async () => false } };
    assert.equal(await app.host.exportProject(), false); assert.deepEqual(calls, []);
    app.window.reactor.projectController.saveAll = async () => true;
    assert.equal(await app.host.exportProject(), false); assert.deepEqual(calls, ['choose_project_directory']);
});
