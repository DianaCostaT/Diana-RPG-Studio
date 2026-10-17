'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {appPaths,prepareLegacyProfile}=require('../src/LuaeAppPaths.cjs');
test('application directories honor system paths and keep profiles outside artifacts',()=>{
 const p=appPaths({platform:'win32',env:{APPDATA:'R:/Roaming',LOCALAPPDATA:'L:/Local'},home:'H:/User'});
 assert.equal(p.config,path.join('R:/Roaming','br.luaerpg.studio'));assert.equal(p.data,path.join('L:/Local','br.luaerpg.studio'));assert.ok(!Object.values(p).some(value=>value.includes('artifacts')));
 const linux=appPaths({platform:'linux',env:{XDG_CONFIG_HOME:'/cfg',XDG_DATA_HOME:'/data',XDG_CACHE_HOME:'/cache'},home:'/user'});assert.equal(linux.config,path.join('/cfg','br.luaerpg.studio'));assert.equal(linux.cache,path.join('/cache','br.luaerpg.studio'));
});
test('legacy profile migration preserves the source and survives removal of disposable artifacts',()=>{
 const sandbox=fs.mkdtempSync(path.join(os.tmpdir(),'luae-profile-')),workspace=path.join(sandbox,'workspace'),artifacts=path.join(workspace,'artifacts'),project=path.join(sandbox,'Projetos','Clareira');
 const locations=appPaths({platform:'win32',env:{APPDATA:path.join(sandbox,'roaming'),LOCALAPPDATA:path.join(sandbox,'local')},home:sandbox});
 try{
  fs.mkdirSync(path.join(artifacts,'profile'),{recursive:true});fs.mkdirSync(project,{recursive:true});fs.writeFileSync(path.join(project,'project.rpgreactor'),'{}','utf8');
  fs.writeFileSync(path.join(artifacts,'profile','settings.json'),JSON.stringify({lastProject:project}),'utf8');
  const p=prepareLegacyProfile(workspace,locations);assert.ok(fs.existsSync(path.join(artifacts,'profile','settings.json')),'migration is a copy');
  assert.ok(path.resolve(artifacts).startsWith(path.resolve(sandbox)+path.sep));fs.rmSync(artifacts,{recursive:true});
  const reopened=prepareLegacyProfile(workspace,locations);const saved=JSON.parse(fs.readFileSync(path.join(reopened.legacyProfile,'settings.json'),'utf8'));assert.equal(saved.lastProject,project);assert.ok(fs.existsSync(path.join(saved.lastProject,'project.rpgreactor')));assert.equal(p.legacyProfile,reopened.legacyProfile);
 }finally{assert.ok(path.resolve(sandbox).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(sandbox,{recursive:true,force:true});}
});
