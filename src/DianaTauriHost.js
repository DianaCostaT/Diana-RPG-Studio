/* Tauri project bridge. Upstream still reads project files synchronously, so
 * keep a memory mirror and persist its changed files through validated Rust commands. */
(function (root) {
    'use strict';
    const invoke = root.__TAURI__ && root.__TAURI__.core && root.__TAURI__.core.invoke;
    if (typeof invoke !== 'function') return;
    const slash = value => String(value || '').replaceAll('\\', '/');
    function normalize(value) {
        let input = slash(value);
        // Rust canonicalize returns verbatim Windows paths. Keep their meaning
        // when exposing them to the upstream's ordinary path API.
        if (input.startsWith('//?/UNC/')) input = '//' + input.slice(8);
        else if (/^\/\/\?\/[A-Za-z]:\//.test(input)) input = input.slice(4);
        const prefix = /^[A-Za-z]:/.test(input) ? input.slice(0, 2) : input.startsWith('//') ? '//' : input.startsWith('/') ? '/' : '';
        const parts = [];
        for (const part of input.slice(prefix.length).split('/')) {
            if (!part || part === '.') continue;
            if (part === '..') parts.pop(); else parts.push(part);
        }
        const joined = parts.join('\\');
        return prefix ? (prefix === '//' ? '\\\\' + joined : prefix === '/' ? '\\' + joined : prefix + '\\' + joined) : (joined || '.');
    }
    const path = {
        sep: '\\',
        join: (...parts) => normalize(parts.filter(Boolean).join('\\')),
        resolve: (...parts) => {
            let result = '';
            for (let i = parts.length - 1; i >= 0; i--) {
                const part = String(parts[i] || '');
                result = part + (result ? '\\' + result : '');
                if (/^[A-Za-z]:[\\/]/.test(part) || part.startsWith('\\\\')) break;
            }
            return normalize(/^[A-Za-z]:[\\/]|^\\\\/.test(result) ? result : 'C:\\Luae RPG\\' + result);
        },
        normalize,
        isAbsolute: value => /^[A-Za-z]:[\\/]|^\\\\/.test(String(value || '')),
        basename(value, suffix = '') { const name = normalize(value).split('\\').pop() || ''; return suffix && name.endsWith(suffix) ? name.slice(0, -suffix.length) : name; },
        dirname(value) { const valuePath = normalize(value), index = valuePath.lastIndexOf('\\'); return index < 0 ? '.' : index === 2 && /^[A-Za-z]:/.test(valuePath) ? valuePath.slice(0, 3) : valuePath.slice(0, index); },
        extname(value) { const name = this.basename(value), index = name.lastIndexOf('.'); return index > 0 ? name.slice(index) : ''; },
        relative(from, to) {
            const a = normalize(from).split('\\'), b = normalize(to).split('\\');
            while (a.length && b.length && a[0].toLowerCase() === b[0].toLowerCase()) { a.shift(); b.shift(); }
            return [...a.map(() => '..'), ...b].join('\\');
        }
    };
    const encoder = new TextEncoder(), decoder = new TextDecoder();
    const mime = file => ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ogg': 'audio/ogg', '.mid': 'audio/midi', '.midi': 'audio/midi', '.json': 'application/json', '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html' }[path.extname(file).toLowerCase()] || 'application/octet-stream');
    const toBytes = value => typeof value === 'string' ? encoder.encode(value) : value instanceof ArrayBuffer ? new Uint8Array(value) : ArrayBuffer.isView(value) ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength) : new Uint8Array(value || []);
    const fromBase64 = value => Uint8Array.from(atob(value), char => char.charCodeAt(0));
    const toBase64 = value => { const bytes = toBytes(value); let text = ''; for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(text); };
    const key = value => normalize(value).toLowerCase();
    function createFileSystem() {
        let rootPath = null, generation = 0, revision = 0, flushTail = Promise.resolve();
        const files = new Map(), directories = new Set(), original = new Map(), deleted = new Map(), paths = new Map();
        const appRoot = 'C:\\Luae RPG', appFiles = new Map(), appDirectories = new Set([key(appRoot)]), appPaths = new Map([[key(appRoot), appRoot]]);
        function inApp(file) { const full = normalize(file), prefix = key(appRoot); return key(full) === prefix || key(full).startsWith(prefix + '\\'); }
        function resolveProject(file) {
            const full = normalize(file), prefix = key(rootPath || '');
            if (!rootPath || (key(full) !== prefix && !key(full).startsWith(prefix + '\\'))) throw new Error('Acesso fora da pasta do projeto.');
            return full;
        }
        function relative(file) { return slash(resolveProject(file).slice(rootPath.length)).replace(/^\/+/, ''); }
        function parents(file) {
            let current = path.dirname(file);
            while (current && current !== file && !directories.has(key(current))) {
                directories.add(key(current)); paths.set(key(current), current);
                file = current; current = path.dirname(current);
            }
        }
        function stat(file) {
            const full = inApp(file) ? normalize(file) : resolveProject(file), entry = (inApp(full) ? appFiles : files).get(key(full)), dir = (inApp(full) ? appDirectories : directories).has(key(full));
            if (!dir && !entry) { const error = new Error('Arquivo não encontrado: ' + full); error.code = 'ENOENT'; throw error; }
            return { size: entry ? entry.length : 0, mtimeMs: 0, isDirectory: () => dir, isFile: () => !dir, isSymbolicLink: () => false };
        }
        function same(a, b) { return a.length === b.length && a.every((value, index) => value === b[index]); }
        const fs = {
            existsSync(file) { try { const full = inApp(file) ? normalize(file) : resolveProject(file), list = inApp(full) ? appFiles : files, dirs = inApp(full) ? appDirectories : directories; return list.has(key(full)) || dirs.has(key(full)); } catch { return false; } },
            readFileSync(file, encoding) { const full = inApp(file) ? normalize(file) : resolveProject(file), data = (inApp(full) ? appFiles : files).get(key(full)); if (!data) { const error = new Error('Arquivo não encontrado: ' + full); error.code = 'ENOENT'; throw error; } return encoding ? decoder.decode(data) : data.slice(); },
            writeFileSync(file, value) { const full = resolveProject(file), data = toBytes(value).slice(); parents(full); directories.delete(key(full)); files.set(key(full), data); paths.set(key(full), full); deleted.delete(relative(full)); },
            appendFileSync(file, value) { const a = this.existsSync(file) ? this.readFileSync(file) : new Uint8Array(), b = toBytes(value), data = new Uint8Array(a.length + b.length); data.set(a); data.set(b, a.length); this.writeFileSync(file, data); },
            mkdirSync(dir, options = {}) { const full = resolveProject(dir); if (!options.recursive && this.existsSync(full)) { const error = new Error('Pasta já existe.'); error.code = 'EEXIST'; throw error; } parents(path.join(full, 'child')); directories.add(key(full)); paths.set(key(full), full); },
            readdirSync(dir, options = {}) {
                const full = inApp(dir) ? normalize(dir) : resolveProject(dir), list = inApp(full) ? appFiles : files, dirs = inApp(full) ? appDirectories : directories;
                if (!dirs.has(key(full))) { const error = new Error('Pasta não encontrada: ' + full); error.code = 'ENOENT'; throw error; }
                const prefix = key(full).replace(/\\+$/, '') + '\\', children = new Map();
                for (const mapKey of list.keys()) if (mapKey.startsWith(prefix)) { const name = mapKey.slice(prefix.length).split('\\')[0]; children.set(name, true); }
                for (const mapKey of dirs) if (mapKey.startsWith(prefix)) { const name = mapKey.slice(prefix.length).split('\\')[0]; children.set(name, false); }
                return [...children].sort(([a], [b]) => a.localeCompare(b, 'pt-BR', { numeric: true })).map(([name, isFile]) => options.withFileTypes ? { name, isFile: () => isFile, isDirectory: () => !isFile, isSymbolicLink: () => false } : name);
            },
            statSync(file) { return stat(file); }, lstatSync(file) { return stat(file); }, realpathSync(file) { return inApp(file) ? normalize(file) : resolveProject(file); },
            copyFileSync(from, to) { this.writeFileSync(to, this.readFileSync(from)); },
            unlinkSync(file) { const full = resolveProject(file); if (!files.has(key(full))) { const error = new Error('Arquivo não encontrado.'); error.code = 'ENOENT'; throw error; } files.delete(key(full)); paths.delete(key(full)); deleted.set(relative(full), ++revision); },
            rmSync(file, options = {}) { const full = resolveProject(file), prefix = key(full); for (const mapKey of [...files.keys()]) if (mapKey === prefix || (options.recursive && mapKey.startsWith(prefix + '\\'))) this.unlinkSync(paths.get(mapKey)); directories.delete(prefix); },
            rmdirSync(dir) { const full = resolveProject(dir); if (this.readdirSync(full).length) { const error = new Error('Pasta não vazia.'); error.code = 'ENOTEMPTY'; throw error; } directories.delete(key(full)); paths.delete(key(full)); },
            // Do not expose renameSync here. Upstream's atomic writer uses the
            // presence of that method to choose its Node implementation, which
            // also requires openSync/fsyncSync. This in-memory filesystem has
            // neither; leaving renameSync absent makes it use writeFileSync,
            // and host.flush() commits the overlay atomically in Rust.
            flush() {
                const requestedGeneration = generation;
                const save = async () => {
                    if (!rootPath || generation !== requestedGeneration) return;
                    const targetRoot = rootPath, snapshot = new Map(), removals = new Map(deleted), writes = [];
                    for (const [mapKey, data] of files) if (!original.has(mapKey) || !same(original.get(mapKey), data)) {
                        const captured = data.slice(); snapshot.set(mapKey, captured);
                        writes.push({ path: relative(paths.get(mapKey)), content: toBase64(captured) });
                    }
                    if (!writes.length && !removals.size) return;
                    await invoke('save_project_changes', { path: targetRoot, files: writes, deleted: [...removals.keys()] });
                    // Only the bytes actually sent are persisted. New edits and
                    // deletions remain dirty, including while another save waits.
                    if (generation !== requestedGeneration) return;
                    for (const [mapKey, data] of snapshot) original.set(mapKey, data);
                    for (const [file, token] of removals) {
                        original.delete(key(path.join(targetRoot, file)));
                        if (deleted.get(file) === token) deleted.delete(file);
                    }
                };
                const pending = flushTail.then(save, save);
                flushTail = pending.catch(() => {});
                return pending;
            },
            _mount(directory, records) {
                generation++; rootPath = normalize(directory); files.clear(); directories.clear(); original.clear(); deleted.clear(); paths.clear();
                directories.add(key(rootPath)); paths.set(key(rootPath), rootPath);
                for (const record of records) { const full = normalize(path.join(rootPath, record.path)), data = fromBase64(record.content); parents(full); files.set(key(full), data); original.set(key(full), data.slice()); paths.set(key(full), full); }
                return rootPath;
            },
            _create(directory) { generation++; rootPath = normalize(directory); files.clear(); directories.clear(); original.clear(); deleted.clear(); paths.clear(); directories.add(key(rootPath)); paths.set(key(rootPath), rootPath); return rootPath; },
            _mountResources(records, merge = false) {
                if (!merge) { appFiles.clear(); appDirectories.clear(); appPaths.clear(); }
                appDirectories.add(key(appRoot)); appPaths.set(key(appRoot), appRoot);
                for (const record of records) { const full = normalize(path.join(appRoot, record.path)), data = fromBase64(record.content); let parent = path.dirname(full); while (parent && parent !== appRoot && !appDirectories.has(key(parent))) { appDirectories.add(key(parent)); appPaths.set(key(parent), parent); parent = path.dirname(parent); } appFiles.set(key(full), data); appPaths.set(key(full), full); }
            },
            _snapshot() { return { rootPath, files: files.size, dirty: deleted.size + [...files].filter(([k, v]) => !original.has(k) || !same(original.get(k), v)).length }; }
        };
        return fs;
    }
    class WebBuffer extends Uint8Array {
        static from(value, encoding) { return typeof value === 'string' && encoding === 'base64' ? fromBase64(value) : toBytes(value).slice(); }
        static alloc(size, fill = 0) { const result = new WebBuffer(size); result.fill(typeof fill === 'number' ? fill : 0); return result; }
        static allocUnsafe(size) { return new WebBuffer(size); }
        static concat(parts) { const buffers = parts.map(toBytes), result = new WebBuffer(buffers.reduce((n, item) => n + item.length, 0)); let offset = 0; for (const item of buffers) { result.set(item, offset); offset += item.length; } return result; }
        static isBuffer(value) { return value instanceof WebBuffer; }
        writeUInt32BE(value, offset = 0) { new DataView(this.buffer, this.byteOffset, this.byteLength).setUint32(offset, value >>> 0, false); return offset + 4; }
        writeUInt32LE(value, offset = 0) { new DataView(this.buffer, this.byteOffset, this.byteLength).setUint32(offset, value >>> 0, true); return offset + 4; }
        writeUInt16LE(value, offset = 0) { new DataView(this.buffer, this.byteOffset, this.byteLength).setUint16(offset, value & 0xffff, true); return offset + 2; }
        toString(encoding = 'utf8') { return encoding === 'base64' ? toBase64(this) : decoder.decode(this); }
    }
    const fs = createFileSystem();
    function createPlaytestModal() {
        let modal = root.document.getElementById('diana-tauri-playtest-modal');
        if (modal) return modal;
        modal = root.document.createElement('section');
        modal.id = 'diana-tauri-playtest-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:12000;background:rgba(8,12,18,.96);display:none;flex-direction:column;padding:12px;box-sizing:border-box;';
        const toolbar = root.document.createElement('header');
        toolbar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:0 0 10px;color:var(--color-text-strong,#fff);font:600 13px sans-serif;';
        const title = root.document.createElement('span');
        title.textContent = 'Playtest';
        const close = root.document.createElement('button');
        close.type = 'button'; close.textContent = 'Fechar teste';
        close.style.cssText = 'padding:7px 12px;border:1px solid var(--color-border-input,#657080);border-radius:5px;background:var(--color-bg-panel,#202733);color:inherit;cursor:pointer;';
        const frame = root.document.createElement('iframe');
        frame.title = 'Playtest do projeto'; frame.allow = 'autoplay; fullscreen; gamepad';
        frame.style.cssText = 'flex:1;width:100%;min-height:0;border:1px solid var(--color-border-input,#657080);background:#000;';
        close.onclick = () => {
            modal.style.display = 'none'; frame.src = 'about:blank';
            const controller = root.reactor?.projectController;
            if (controller?.mapEditor3D) controller.mapEditor3D.suspended = false;
            if (!controller?.mapEditor3D?.isEnabled?.()) controller?.app?.start?.();
        };
        toolbar.append(title, close); modal.append(toolbar, frame); root.document.body.appendChild(modal);
        return modal;
    }
    const host = {
        mode: 'web', isTauri: true, version: '0.2.6', fs, path,
        runtimePath: path.join('C:\\Luae RPG', 'runtime'), projectRoot: null,
        async ensureRuntime() {
            if (this.runtimeReady) return;
            if (!this.runtimePromise) this.runtimePromise = invoke('read_app_resources').then(records => {
                fs._mountResources(records);
                const pakoFile = path.join('C:\\Luae RPG', 'runtime', 'libs', 'pako.min.js');
                if (fs.existsSync(pakoFile) && !root.pako) new Function(fs.readFileSync(pakoFile, 'utf8')).call(root);
                if (!root.pako || typeof root.pako.deflate !== 'function') throw new Error('O compressor de arquivos do runtime não carregou.');
                const pixiFile = path.join('C:\\Luae RPG', 'runtime', 'libs', 'pixi.js');
                if (!root.PIXI && fs.existsSync(pixiFile)) {
                    const script = root.document.createElement('script');
                    script.text = fs.readFileSync(pixiFile, 'utf8');
                    script.dataset.dianaTauriRuntime = 'pixi';
                    root.document.head.appendChild(script);
                }
                if (!root.PIXI) throw new Error('A biblioteca PixiJS do runtime não carregou.');
                this.runtimeReady = true;
            }).catch(error => { this.runtimePromise = null; throw error; });
            await this.runtimePromise;
        },
        async chooseProjectDirectory() { return await invoke('choose_project_directory') || null; },
        async ensureStarterResources() {
            if (this.starterReady) return;
            if (!this.starterPromise) this.starterPromise = invoke('read_starter_resources').then(records => {
                fs._mountResources(records, true); this.starterReady = true;
            }).catch(error => { this.starterPromise = null; throw error; });
            await this.starterPromise;
        },
        async mountProject(directory) {
            const names = await invoke('read_project_files', { path: directory }), records = [];
            for (let offset = 0; offset < names.length; offset += 8) {
                const batch = await Promise.all(names.slice(offset, offset + 8).map(async name => ({ path: name, content: await invoke('read_project_file', { path: directory, relative: name }) })));
                records.push(...batch);
            }
            this.projectRoot = fs._mount(directory, records); return this.projectRoot;
        },
        async flush() { await fs.flush(); }, applyBrowserUi() {},
        async unsupported(label) { await root.RRDialog.alert(`${label}: esta função ainda não foi migrada para o Tauri.`, {title:'Luae RPG',kind:'warning'}); return false; },
        async exportProject() {
            const app = root.reactor, controller = app?.projectController;
            if (!this.projectRoot || !controller) return false;
            try {
                if (controller.saveAll && await controller.saveAll() !== true) return false;
                await this.flush();
                const parent = await this.chooseProjectDirectory(); if (!parent) return false;
                app.uiManager?.updateStatus?.('Exportando jogo standalone Tauri…');
                const destination = await invoke('export_game', {projectPath:this.projectRoot,parentPath:parent});
                app.uiManager?.updateStatus?.('Exportação local criada: '+destination);
                await root.RRDialog.alert(`Jogo exportado para:\n${destination}\n\nExecute LuaeGame.exe mantendo a pasta game ao lado. Requer Windows com WebView2.\n\nA revisão de licenças e avisos continua necessária antes da distribuição pública.`, {title:'Exportar jogo'});
                return destination;
            } catch (error) {
                app?.uiManager?.updateStatus?.('A exportação não foi concluída.');
                await root.RRDialog.alert(error.message || String(error), {title:'Exportar jogo',kind:'error'});
                return false;
            }
        },
        async openPlaytest(mode = 'test') {
            if (!this.projectRoot) throw new Error('Abra um projeto antes de iniciar o playtest.');
            const controller = root.reactor?.projectController;
            if (controller?.saveAll && await controller.saveAll() !== true) return false;
            await this.flush();
            await invoke('set_playtest_project', { path: this.projectRoot });
            const modal = createPlaytestModal(), frame = modal.querySelector('iframe');
            // Tauri maps registered protocols to http://<scheme>.localhost on
            // Windows. The raw scheme URL is not navigable in WebView2 iframes.
            frame.src = `http://diana-project.localhost/index.html?${String(mode || 'test')}&rrSnapshot=${Date.now()}`;
            modal.style.display = 'flex';
            controller?.app?.stop?.();
            if (controller?.mapEditor3D) controller.mapEditor3D.suspended = true;
            return true;
        },
        assetUrl(filePath) { return 'data:' + mime(filePath) + ';base64,' + toBase64(fs.readFileSync(filePath)); },
        saveFile: async ({ data, projectPath }) => { if (!projectPath) throw new Error('Salve o arquivo dentro de um projeto aberto.'); fs.writeFileSync(projectPath, data); await fs.flush(); return { path: projectPath, project: true }; }
    };
    root.RPGReactorHost = host;
    if (root.RREncryptedAssets && typeof root.RREncryptedAssets.useFileSystem === 'function') {
        root.RREncryptedAssets.useFileSystem(fs, path, filePath => host.assetUrl(filePath));
        root.RPGReactorAssetUrl = root.RREncryptedAssets.resolveAssetUrl;
    } else root.RPGReactorAssetUrl = filePath => host.assetUrl(filePath);
    root.Buffer = root.Buffer || WebBuffer;
    root.process = root.process || { platform: 'tauri', cwd: () => 'C:\\Luae RPG', pid: 1, env: {}, kill() { throw new Error('Processos externos não estão disponíveis no Tauri.'); } };
    root.require = root.require || function (name) {
        if (name === 'fs') return fs;
        if (name === 'path') return path;
        if (name === 'buffer') return { Buffer: root.Buffer };
        if (name === 'os') return { homedir: () => 'C:\\Users' };
        if (name === 'url') return { pathToFileURL: filePath => ({ href: host.assetUrl(filePath) }) };
        if (name === 'zlib') return { deflateSync: data => root.pako.deflate(toBytes(data)), deflateRawSync: data => root.pako.deflateRaw(toBytes(data)), inflateSync: data => root.pako.inflate(toBytes(data)), inflateRawSync: data => root.pako.inflateRaw(toBytes(data)) };
        if (name === 'crypto') return { randomBytes: size => { const result = crypto.getRandomValues(new Uint8Array(size)); result.toString = encoding => [...result].map(value => value.toString(16).padStart(2, '0')).join(''); return result; } };
        throw new Error('Módulo Node "' + name + '" ainda não foi migrado para o host Tauri.');
    };
    if (typeof ProjectController !== 'undefined') {
    ProjectController.prototype.openProject = async function () {
        if (!await this.confirmUnsavedChanges()) return false;
        try {
            const selected = await host.chooseProjectDirectory(); if (!selected) return false;
            this.uiManager.updateStatus('Carregando projeto…'); await host.mountProject(selected);
            await this.openProjectAtPath(host.projectRoot); return this.currentProject && this.currentProject.path === host.projectRoot;
        } catch (error) {
            this.uiManager.updateStatus('Não foi possível abrir o projeto.');
            await root.RRDialog.alert('Não foi possível abrir o projeto.\n\n' + (error.message || error), { title: 'Abrir projeto', kind: 'error' });
            return false;
        }
    };
    ProjectController.prototype.newProject = async function () {
        if (!await this.confirmUnsavedChanges()) return false;
        try {
            await host.ensureRuntime();
            const choice = await this.uiManager.showNewProjectDialog({ defaultName: 'Meu jogo', hasTemplate: false, validate: name => this.projectManager.isSafeProjectName(name) ? '' : 'Use um nome válido para o projeto.' });
            if (!choice) return false;
            const parent = await host.chooseProjectDirectory(); if (!parent) return false;
            await host.ensureStarterResources();
            const target = await invoke('create_project_directory', { parent, name: choice.name });
            fs._create(target);
            this.uiManager.updateStatus('Criando projeto…');
            if (!await this.projectManager.createNewProject(target, choice.name, { blank: true, dianaMode: choice.mode || '2d' })) throw new Error(this.projectManager.lastCreateError || 'Não foi possível criar os arquivos do projeto.');
            await host.flush();
            await host.mountProject(target);
            await this.openProjectAtPath(target);
            return this.currentProject && this.currentProject.path === target;
        } catch (error) {
            this.uiManager.updateStatus('Não foi possível criar o projeto.');
            await root.RRDialog.alert('Não foi possível criar o projeto.\n\n' + (error.message || error), { title: 'Novo projeto', kind: 'error' });
            return false;
        }
    };
    ProjectController.prototype.checkAutoLoadProject = async function () {
        const last = localStorage.getItem('lastProjectPath'); if (!last) return;
        try { await host.mountProject(last); await this.openProjectAtPath(host.projectRoot); }
        catch (error) { localStorage.removeItem('lastProjectPath'); this.uiManager.updateStatus('O último projeto não pôde ser aberto: ' + (error.message || error)); }
    };
    }
    if (typeof module !== 'undefined' && module.exports) module.exports = { createFileSystem, createPathApi: () => path, normalize, WebBuffer };
})(typeof window !== 'undefined' ? window : globalThis);
