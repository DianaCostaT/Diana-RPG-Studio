'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function patchPaths(patch) {
    const paths = [...patch.matchAll(/^\+\+\+ b\/(.+)\r?$/gm)].map(match => match[1].trim());
    for (const file of paths) {
        if (!/^(editor|runtime|template)\//.test(file) || file.split('/').includes('..') || /[\\\0]/.test(file)) {
            throw new Error('Caminho de patch inválido: ' + file);
        }
    }
    return paths;
}

function brandHtml(html) {
    const entry = '    <script src="src/main.js"></script>';
    if (html.split(entry).length !== 2) throw new Error('Ponto de integração upstream mudou.');
    return html.replace(/<img id="splash-image"[\s\S]*?<\/script>/,
        '<div data-rr-i18n-skip style="font:600 48px system-ui;color:var(--color-text-strong);letter-spacing:2px">Diana RPG Studio</div>')
        .replace('<html lang="en">', '<html lang="pt-BR">')
        .replace('<title>RPG Reactor</title>', '<title>Diana RPG Studio</title>')
        .replace('href="images/icon.png"','href="images/diana.png"')
        .replaceAll('src="images/logo.png"','src="images/diana.png"')
        .replaceAll('alt="RPG Reactor"','alt="Diana RPG Studio"')
        .replace('</head>', '    <link rel="stylesheet" href="src/DianaWorkspace.css">\n    <link rel="stylesheet" href="src/DianaAppearance.css">\n    <link rel="stylesheet" href="src/DianaStudio.css">\n    <script src="src/DianaStudio.js" defer></script>\n</head>')
        .replace(entry, '    <script src="src/DianaThemes.js"></script>\n    <script src="src/DianaStarterData.js"></script>\n    <script src="src/DianaProjectValidation.js"></script>\n    <script src="src/DianaBootstrap.js"></script>\n    <script src="src/DianaWorkspace.js"></script>\n    <script src="src/DianaWindowsFolders.js"></script>\n    <script src="src/DianaProjectMode.js"></script>\n    <script src="src/DianaBattle2D.js"></script>\n    <script src="src/DianaIcons.js"></script>\n' + entry);
}

function prepareEditor(root = path.resolve(__dirname, '..'), destination) {
    const upstream = path.join(root, 'upstream', 'RPGReactor');
    const build = path.join(root, 'build');
    const out = destination ? path.resolve(destination) : path.join(build, 'diana');
    if (path.dirname(out) !== build) throw new Error('A preparação deve ficar diretamente na pasta build do workspace.');
    const pin = JSON.parse(fs.readFileSync(path.join(root, 'upstream-lock.json'), 'utf8'));
    const actual = execFileSync('git', ['-C', upstream, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    if (actual !== pin.commit) throw new Error('Revisão upstream inesperada: ' + actual);
    const dependencies = path.join(upstream, 'editor', 'node_modules');
    if (!fs.existsSync(path.join(dependencies, 'pixi.js'))) {
        throw new Error('Dependências ausentes. Instale com npm ci --ignore-scripts em upstream/RPGReactor/editor após aprovação.');
    }
    const patches = fs.readdirSync(path.join(root, 'patches')).filter(file => file.endsWith('.patch'))
        .sort((a, b) => a === 'held-poses.patch' ? -1 : b === 'held-poses.patch' ? 1 : a.localeCompare(b));
    const extraPaths = patches.flatMap(file => patchPaths(fs.readFileSync(path.join(root, 'patches', file), 'utf8')))
        .filter(file => file.startsWith('template/'));
    fs.mkdirSync(build, { recursive: true });
    const staging = fs.mkdtempSync(path.join(build, 'prepared-'));
    const archive = path.join(staging, 'base.tar');
    // Export the pinned commit, not unrecorded changes in the upstream working tree.
    execFileSync('git', ['-C', upstream, 'archive', '--format=tar', '--output=' + archive,
        pin.commit, 'editor', 'runtime', 'LICENSE', 'THIRD_PARTY_NOTICES.md', ...new Set(extraPaths)]);
    execFileSync('tar', ['-xf', archive, '-C', staging]);
    fs.unlinkSync(archive);
    const prefix = path.relative(root, staging).replaceAll('\\', '/');
    for (const patch of patches) {
        const file = path.join(root, 'patches', patch);
        execFileSync('git', ['apply', '--check', '--directory=' + prefix, '--whitespace=error', file], { cwd: root });
        execFileSync('git', ['apply', '--directory=' + prefix, '--whitespace=error', file], { cwd: root });
    }
    // Only legacy runtime source files are staged for patches; no Demo assets ship.
    const template = path.join(staging, 'template');
    if (fs.existsSync(template)) {
        const resolved = fs.realpathSync(template);
        if (!resolved.startsWith(fs.realpathSync(staging) + path.sep)) throw new Error('Template fora do staging.');
        fs.rmSync(template, { recursive: true });
    }
    const editor = path.join(staging, 'editor');
    for (const file of fs.readdirSync(path.join(editor, 'images'))) {
        if (/^splash-screen-\d+\.png$/i.test(file)) fs.unlinkSync(path.join(editor, 'images', file));
    }
    const pkgFile = path.join(editor, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
    pkg.name = 'diana-rpg-studio';
    pkg.version = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8').replace(/^\uFEFF/,'')).version;
    pkg.name_for_display = 'Diana RPG Studio';
    pkg.window.title = 'Diana RPG Studio';
    pkg.window.icon = 'images/diana.png';
    pkg.window.show = true;
    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');
    const htmlFile = path.join(editor, 'index.html');
    const branded=brandHtml(fs.readFileSync(htmlFile, 'utf8')).replace('    <script src="src/main.js"></script>','    <script src="src/DianaTileKit.js"></script>\n    <script src="src/DianaJRPGSample.js"></script>\n    <script src="src/DianaClassicEditor.js"></script>\n    <script src="src/main.js"></script>');
    const featureScripts=['DianaRTPExpansion.js','DianaVillageExpansion.js','DianaCombatModes.js','DianaStudio.js'];
    const expanded=branded.replace('    <script src="src/main.js"></script>',featureScripts.filter(name=>!branded.includes('src="src/'+name+'"')).map(name=>'    <script src="src/'+name+'"></script>').join('\n')+'\n    <script src="src/main.js"></script>');
    fs.writeFileSync(htmlFile, expanded.includes('href="src/DianaStudio.css"')?expanded:expanded.replace('</head>','    <link rel="stylesheet" href="src/DianaStudio.css">\n</head>'));
    for(const name of featureScripts)fs.copyFileSync(path.join(root,'src',name),path.join(editor,'src',name));
    fs.copyFileSync(path.join(root,'src','DianaStudio.css'),path.join(editor,'src','DianaStudio.css'));
    fs.copyFileSync(path.join(root,'src','DianaCombatModes.js'),path.join(staging,'runtime','DianaCombatModes.js'));
    fs.copyFileSync(path.join(root, 'src', 'DianaBootstrap.js'), path.join(editor, 'src', 'DianaBootstrap.js'));
    fs.copyFileSync(path.join(root, 'src', 'DianaStarterData.js'), path.join(editor, 'src', 'DianaStarterData.js'));
    fs.copyFileSync(path.join(root, 'src', 'DianaProjectValidation.js'), path.join(editor, 'src', 'DianaProjectValidation.js'));
    for (const name of ['DianaWorkspace.js','DianaWorkspace.css','DianaWindowsFolders.js','DianaProjectMode.js','DianaBattle2D.js','DianaThemes.js','DianaIcons.js','DianaAppearance.css']) fs.copyFileSync(path.join(root,'src',name),path.join(editor,'src',name));
    require('./diana-icons.cjs').generate(path.join(editor,'images'));
    fs.copyFileSync(path.join(editor,'images','diana.png'),path.join(editor,'images','icon.png'));
    fs.copyFileSync(path.join(root,'src','DianaJRPGSample.js'),path.join(editor,'src','DianaJRPGSample.js'));
    fs.copyFileSync(path.join(root,'src','DianaTileKit.js'),path.join(editor,'src','DianaTileKit.js'));
    fs.copyFileSync(path.join(root,'src','DianaClassicEditor.js'),path.join(editor,'src','DianaClassicEditor.js'));
    for(const name of ['DianaStudio.js','DianaStudio.css'])fs.copyFileSync(path.join(root,'src',name),path.join(editor,'src',name));
    fs.copyFileSync(path.join(root,'src','DianaCombatModes.js'),path.join(staging,'runtime','DianaCombatModes.js'));
    fs.cpSync(path.join(root,'assets','jrpg-test','pack'),path.join(editor,'diana-assets','jrpg-test'),{recursive:true});
    fs.cpSync(path.join(root,'assets','rtp','medieval','pack'),path.join(editor,'diana-assets','rtp-medieval'),{recursive:true});
    fs.cpSync(path.join(root,'assets','defense','pack'),path.join(editor,'diana-assets','defense'),{recursive:true});
    fs.cpSync(path.join(root,'assets','vehicles','pack'),path.join(editor,'diana-assets','vehicles'),{recursive:true});
    fs.cpSync(path.join(root,'assets','village','pack'),path.join(editor,'diana-assets','village'),{recursive:true});
    if (fs.existsSync(path.join(root, 'LICENSE'))) fs.copyFileSync(path.join(root, 'LICENSE'), path.join(staging, 'LICENSE'));
    // Development link reuses installed dependencies; it is not a release package.
    fs.symlinkSync(dependencies, path.join(editor, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
    const provenance = {
        base: pin, preparedAt: new Date().toISOString(), demoIncluded: false,
        featureSources:Object.fromEntries([...featureScripts,'DianaStudio.css'].map(name=>[name,sha256(path.join(root,'src',name))])),
        vehicleAssetManifestSha256:sha256(path.join(root,'assets','vehicles','pack','manifest.json')),
        villageAssetManifestSha256:sha256(path.join(root,'assets','village','pack','manifest.json')),
        patches: patches.map(file => ({ file, sha256: sha256(path.join(root, 'patches', file)) })),
        bootstrapSha256: sha256(path.join(root, 'src', 'DianaBootstrap.js')),
        starterSha256: sha256(path.join(root, 'src', 'DianaStarterData.js')),
        validationSha256: sha256(path.join(root, 'src', 'DianaProjectValidation.js')),
        workspaceSha256: sha256(path.join(root,'src','DianaWorkspace.js')),
        workspaceCssSha256: sha256(path.join(root,'src','DianaWorkspace.css')),
        folderServiceSha256: sha256(path.join(root,'src','DianaWindowsFolders.js')),
        projectModeSha256: sha256(path.join(root,'src','DianaProjectMode.js')),
        battle2DSha256: sha256(path.join(root,'src','DianaBattle2D.js')),
        themesSha256: sha256(path.join(root,'src','DianaThemes.js')),
        appearanceCssSha256: sha256(path.join(root,'src','DianaAppearance.css')),
        iconsSha256: sha256(path.join(root,'src','DianaIcons.js')),
        appMarkSha256: sha256(path.join(root,'src/assets/diana.svg')),
        iconGeneratorSha256: sha256(path.join(root,'scripts/diana-icons.cjs')),
        jrpgSampleSha256: sha256(path.join(root,'src','DianaJRPGSample.js')),
        tileKitSha256: sha256(path.join(root,'src','DianaTileKit.js')),
        classicEditorSha256: sha256(path.join(root,'src','DianaClassicEditor.js')),
        studioSha256: sha256(path.join(root,'src','DianaStudio.js')),
        studioCssSha256: sha256(path.join(root,'src','DianaStudio.css')),
        combatModesSha256: sha256(path.join(root,'src','DianaCombatModes.js')),
        jrpgAssetManifestSha256: sha256(path.join(root,'assets','jrpg-test','pack','manifest.json')),
        nativeRtpManifestSha256: sha256(path.join(root,'assets','rtp','medieval','pack','manifest.json')),
        defenseAssetManifestSha256: sha256(path.join(root,'assets','defense','pack','manifest.json')),
        dependencyLockSha256: sha256(path.join(upstream, 'editor', 'package-lock.json')),
        dependencies: 'Local development link to upstream/editor/node_modules; not a distributable package'
    };
    fs.writeFileSync(path.join(staging, 'provenance.json'), JSON.stringify(provenance, null, 2) + '\n');
    let previous = null;
    if (fs.existsSync(out)) {
        previous = path.join(build, 'previous-' + path.basename(staging));
        fs.renameSync(out, previous);
    }
    try { fs.renameSync(staging, out); }
    catch (error) {
        if (previous) fs.renameSync(previous, out);
        throw error;
    }
    console.log('Editor Diana preparado em ' + path.join(out, 'editor') + '; revisão e patches registrados; demo não incluído.');
    return provenance;
}

module.exports = { prepareEditor, patchPaths, brandHtml };
