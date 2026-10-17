'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');

test('runtime Diana desatualizado é renovado ao abrir projetos Tauri',()=>{
 const refresh=fs.readFileSync('patches/zzzzzzzzzzzzzzzz-diana-tauri-runtime-refresh.patch','utf8');
 const host=fs.readFileSync('src/DianaTauriHost.js','utf8');
 assert.match(refresh,/mode === 'web' && !window\.RPGReactorHost\?\.isTauri/);
 assert.match(refresh,/runtimeFilesMatch = \['reactor_objects_legacy\.js', 'reactor_sprites\.js', 'reactor_battle_data\.js'\]/);
 assert.match(refresh,/currentRevision && runtimeFilesMatch/);
 assert.match(host,/mode: 'web', isTauri: true/);
 assert.match(host,/runtimePath: path\.join\('C:\\\\Luae RPG', 'runtime'\)/);
 assert.match(fs.readFileSync('upstream/RPGReactor/editor/src/ProjectManager.js','utf8'),/targetRevision === sourceRevision/);
});
