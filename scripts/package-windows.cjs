'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function copyTree(source, destination, skip = () => false) {
    if (skip(source)) return;
    const stat = fs.lstatSync(source);
    if (stat.isSymbolicLink()) throw new Error('Link/junction proibido: ' + source);
    if (stat.isDirectory()) {
        fs.mkdirSync(destination, { recursive: true });
        for (const name of fs.readdirSync(source)) copyTree(path.join(source, name), path.join(destination, name), skip);
    } else fs.copyFileSync(source, destination);
}
function freshDestination(destination, sources) {
    const target = path.resolve(destination);
    for (const source of sources.map(s => path.resolve(s))) {
        if (target === source || target.startsWith(source + path.sep) || source.startsWith(target + path.sep)) throw new Error('Destino sobrepoe origem: ' + target);
    }
    if (fs.existsSync(target)) throw new Error('Destino ja existe; nada foi sobrescrito: ' + target);
    fs.mkdirSync(target, { recursive: true });
    return target;
}
function copySdk(sdk, out) {
    for (const required of ['nw.exe', 'nw.dll', 'node.dll', 'credits.html', 'ffmpeg.dll']) {
        if (!fs.existsSync(path.join(sdk, required))) throw new Error('SDK local incompleto: ' + required);
    }
    copyTree(sdk, out, file => /^(chromedriver\.exe|nwjc\.exe|debug\.log)$/i.test(path.basename(file)));
    return { version: '0.118.0', nwSha256: hash(path.join(sdk, 'nw.exe')), ffmpegSha256: hash(path.join(sdk, 'ffmpeg.dll')), creditsSha256: hash(path.join(sdk, 'credits.html')), codecOverlay: false,
        officialCreditsComplete: !/sample credits page|generate_about_credits/i.test(fs.readFileSync(path.join(sdk, 'credits.html'), 'utf8')) };
}
function dependencies(source, names, out) {
    const inventory = [], visited = new Set();
    function visit(name) {
        if (visited.has(name)) return;
        if (!/^(@[\w.-]+\/)?[\w.-]+$/.test(name)) throw new Error('Dependencia invalida: ' + name);
        visited.add(name);
        const folder = path.join(source, ...name.split('/'));
        const pkg = JSON.parse(fs.readFileSync(path.join(folder, 'package.json'), 'utf8'));
        const target = path.join(out, ...name.split('/'));
        copyTree(folder, target, file => path.basename(file) === 'node_modules');
        const licenses = fs.readdirSync(folder).filter(f => /^(licen[sc]e|copying|notice)(\.|$)/i.test(f) || (/^readme/i.test(f) && /Permission is hereby granted/.test(fs.readFileSync(path.join(folder, f), 'utf8'))));
        inventory.push({ name, version: pkg.version, declaredLicense: pkg.license || null, licenseFiles: licenses, licenseReview: licenses.length ? 'text-preserved; embedded-code-review-pending' : 'blocked-missing-license-text', packageSha256: hash(path.join(folder, 'package.json')) });
        for (const dependency of Object.keys(pkg.dependencies || {})) visit(dependency);
    }
    names.forEach(visit);
    return inventory.sort((a, b) => a.name.localeCompare(b.name));
}
function manifest(out, info) {
    const files = [];
    function walk(folder) {
        for (const name of fs.readdirSync(folder)) {
            const file = path.join(folder, name), stat = fs.lstatSync(file);
            if (stat.isSymbolicLink()) throw new Error('Pacote contem link: ' + file);
            if (stat.isDirectory()) walk(file);
            else files.push({ path: path.relative(out, file).replaceAll('\\', '/'), bytes: stat.size, sha256: hash(file) });
        }
    }
    walk(out);
    const report = { schemaVersion: 1, createdAt: new Date().toISOString(), distributionStatus: 'blocked-license-review',
        limitations: ['SDK local possui credits.html placeholder; avisos oficiais completos ausentes, publicacao bloqueada.', 'Inventario documental nao certifica licencas transitivas de WASM ou bibliotecas embutidas.'], ...info, files };
    fs.writeFileSync(path.join(out, 'diana-package.json'), JSON.stringify(report, null, 2) + '\n');
    return report;
}
function packageWindows({ prepared = path.join(root, 'build', 'diana'), sdk = path.join(root, 'tools', 'nwjs-sdk-v0.118.0-win-x64'), destination } = {}) {
    if (!destination) throw new Error('Informe --out com uma pasta nova.');
    const audio = fs.readFileSync(path.join(prepared, 'editor', 'src', 'forge', 'SoundEffectGenerator', 'AudioExport.js'), 'utf8');
    if (!audio.includes('MP3 opcional desativado')) throw new Error('Prepare centralmente com zzzz-windows-package.patch antes de empacotar.');
    const preparedPackage = JSON.parse(fs.readFileSync(path.join(prepared, 'editor', 'package.json'), 'utf8'));
    if (preparedPackage.dependencies?.lamejs) throw new Error('O manifest preparado ainda declara lamejs; aplique o patch de remoção LGPL antes de empacotar.');
    const out = freshDestination(destination, [prepared, sdk]);
    const sdkInfo = copySdk(sdk, out);
    const app = path.join(out, 'app');
    copyTree(prepared, app, file => ['node_modules', 'tests', 'build-scripts', 'dist-scripts', 'changelog'].includes(path.basename(file)));
    copyTree(path.join(root, 'licenses'), path.join(app, 'licenses'));
    const pkgFile = path.join(app, 'editor', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
    delete pkg.devDependencies; delete pkg.scripts;
    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');
    const source = fs.realpathSync(path.join(prepared, 'editor', 'node_modules'));
    const inventory = dependencies(source, Object.keys(pkg.dependencies), path.join(app, 'editor', 'node_modules'));
    fs.writeFileSync(path.join(out, 'Diana.cmd'), '@echo off\r\nstart "" "%~dp0nw.exe" --user-data-dir="%~dp0profile" "%~dp0app\\editor"\r\n');
    require('./build-windows-launcher.cjs').buildLauncher(path.join(out,'Diana.exe'));
    fs.writeFileSync(path.join(out,'LEIA-ME.txt'),'Diana RPG Studio — versão local de desenvolvimento\r\n\r\nAbra Diana.exe. Não é necessário instalar Node, Git ou executar comandos.\r\nMantenha todos os arquivos desta pasta juntos.\r\n\r\nCriar projeto: Arquivo > Novo projeto. Use Testar jogo para executar.\r\nEsta versão é para teste local; distribuição pública aguarda revisão de licenças.\r\n');
    return { out, report: manifest(out, { kind: 'editor', sdk: sdkInfo, dependencies: inventory, mp3Encoding: 'disabled; lamejs removed from prepared manifest and lockfile', demoIncluded: false, provenance: JSON.parse(fs.readFileSync(path.join(prepared, 'provenance.json'), 'utf8')) }) };
}
function options(args) {
    const result = {};
    for (let i = 0; i < args.length; i += 2) {
        const key = { '--out': 'destination', '--prepared': 'prepared', '--sdk': 'sdk', '--project': 'project' }[args[i]];
        if (!key || !args[i + 1]) throw new Error('Opcao invalida: ' + args[i]);
        result[key] = path.resolve(args[i + 1]);
    }
    return result;
}
module.exports = { packageWindows, copyTree, copySdk, manifest, freshDestination, options };
if (require.main === module) { try { console.log(packageWindows(options(process.argv.slice(2))).out); } catch (error) { console.error(error.message); process.exitCode = 1; } }
