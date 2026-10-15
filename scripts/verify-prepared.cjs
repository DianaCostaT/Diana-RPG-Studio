'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {prepareEditor}=require('./prepare-source.cjs');
const root=path.resolve(__dirname,'..');
function snapshot() {
    const base=path.join(root,'build','diana'),files={};
    const visit=folder=>{for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
        if(entry.name==='node_modules'||entry.name==='provenance.json')continue;
        const file=path.join(folder,entry.name);
        if(entry.isDirectory())visit(file);
        else if(entry.isFile())files[path.relative(base,file).replaceAll('\\','/')]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
        else throw new Error('Unexpected generated source symlink: '+file);
    }};
    visit(base);return files;
}
prepareEditor(root);const first=snapshot();
prepareEditor(root);const second=snapshot();
assert.deepEqual(second,first,'Same pinned commit, patches and bootstrap produce identical files');
assert.equal(fs.existsSync(path.join(root,'build','diana','template')),false);
const result={status:'passed',at:new Date().toISOString(),files:Object.keys(second).length,
    scope:'Two exports and patch applications compared byte-for-byte, excluding timestamp provenance and external node_modules link. Dependency installation and release packaging are not validated.',
    provenance:JSON.parse(fs.readFileSync(path.join(root,'build','diana','provenance.json'),'utf8'))};
fs.writeFileSync(path.join(root,'artifacts','prepare-verification.json'),JSON.stringify(result,null,2));
console.log('PASS: duas preparações equivalentes; '+result.files+' arquivos comparados.');
