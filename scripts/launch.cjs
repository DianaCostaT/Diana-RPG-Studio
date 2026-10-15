'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const root = path.resolve(__dirname,'..');
const exe = path.join(root,'tools','nwjs-sdk-v0.118.0-win-x64','nw.exe');
const editor = path.join(root,'build','diana','editor');
if (!fs.existsSync(exe) || !fs.existsSync(path.join(editor,'index.html')))
    throw new Error('Prepare o editor e extraia NW.js SDK 0.118.0 em tools primeiro.');
const artifacts = path.join(root,'artifacts');
fs.mkdirSync(artifacts,{recursive:true});
const log = fs.openSync(path.join(artifacts,'launch.log'),'a');
const child = spawn(exe,['--user-data-dir='+path.join(artifacts,'profile'),editor],{
    cwd:editor, detached:true, stdio:['ignore',log,log], windowsHide:false
});
fs.closeSync(log);
child.on('error', error => {console.error(error);process.exitCode=1;});
child.unref();
console.log('Inicialização solicitada. Use npm run smoke:windows para verificação automatizada.');
