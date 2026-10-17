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
        saveAll: async () => { saved = true; return true; },
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
