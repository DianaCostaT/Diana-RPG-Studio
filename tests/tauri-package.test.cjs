'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {packageTauri}=require('../scripts/package-tauri-windows.cjs');
test('Tauri portable package includes runtime and notices without NW or checkout links',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'luae-tauri-package-'));
 try{
  fs.mkdirSync(path.join(root,'prepared/runtime'),{recursive:true});
  fs.writeFileSync(path.join(root,'prepared/runtime/reactor_main.js'),'runtime fixture');
  fs.writeFileSync(path.join(root,'prepared/provenance.json'),'{}');fs.mkdirSync(path.join(root,'bin'));fs.writeFileSync(path.join(root,'bin/host.exe'),'fixture');
  const out=path.join(root,'portable');const result=packageTauri({prepared:path.join(root,'prepared'),executable:path.join(root,'bin/host.exe'),destination:out});
  assert.equal(result.report.host,'tauri');assert.equal(result.report.distributionStatus,'blocked-license-review');
  for(const file of ['Luae RPG.exe','runtime/reactor_main.js','LICENSE','THIRD_PARTY_NOTICES.md'])assert.ok(fs.existsSync(path.join(out,file)));
  assert.equal(fs.existsSync(path.join(out,'nw.exe')),false);assert.equal(fs.existsSync(path.join(out,'node_modules')),false);
  assert.throws(()=>packageTauri({prepared:path.join(root,'prepared'),executable:path.join(root,'bin/host.exe'),destination:out}),/existe/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
