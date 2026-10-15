'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const required=['AGENTS.md','README.md','ROADMAP.md','TASKS.md','docs/ARCHITECTURE.md','docs/BATTLE_SYSTEM.md','docs/ANIMATION_SYSTEM.md','docs/LICENSE_AUDIT.md',
    '.diana-ai/handoff.md','.diana-ai/current_state.json','.diana-ai/decisions.json','.diana-ai/known_issues.json','.diana-ai/next_steps.json'];
for(const file of required)assert.ok(fs.existsSync(path.join(root,file)),file+' exists');
for(const file of ['package.json','upstream-lock.json','tools-lock.json',...required.filter(file=>file.endsWith('.json'))]){
    JSON.parse(fs.readFileSync(path.join(root,file),'utf8').replace(/^\uFEFF/,''));
}
let links=0;
for(const file of ['README.md','ROADMAP.md','TASKS.md',...fs.readdirSync(path.join(root,'docs')).filter(name=>name.endsWith('.md')).map(name=>'docs/'+name)]){
    const text=fs.readFileSync(path.join(root,file),'utf8');
    for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
        const target=match[1];if(/^[a-z]+:|^#/.test(target))continue;
        assert.ok(fs.existsSync(path.resolve(root,path.dirname(file),target.split('#')[0])),file+': '+target);links++;
    }
}
console.log('PASS: documentação obrigatória, JSONs e '+links+' links locais.');
