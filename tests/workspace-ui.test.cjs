'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');

test('workspace principal mantém apenas destinos de autoria essenciais',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../src/DianaWorkspace.js'),'utf8');
 const nodes=[];
 const element=tag=>({tag,children:[],dataset:{},attributes:{},className:'',textContent:'',append(...items){this.children.push(...items);},before(node){this.beforeNode=node;},addEventListener(){},setAttribute(name,value){this.attributes[name]=value;},getAttribute(name){return this.attributes[name]??null;},querySelectorAll(){return [];}});
 const toolbar=element('div');
 const document={addEventListener(_name,callback){callback();},createElement:element,getElementById(id){return id==='toolbar'?toolbar:null;},querySelector(){return null;}};
 class Observer{observe(){}}
 vm.runInNewContext(source,{document,MutationObserver:Observer,window:{},globalThis:{}});
 const bar=toolbar.beforeNode;assert.ok(bar);nodes.push(...bar.children.filter(node=>node.dataset?.dianaAction));
 assert.deepEqual(nodes.map(node=>node.dataset.dianaAction),['maps','events','event-search','database','battle','resources','sprite-repair','play']);
 assert.equal(nodes.some(node=>['enemies','animations','parallax'].includes(node.dataset.dianaAction)),false);
});

test('tela inicial destaca a Vila da Clareira e explica o conteudo do projeto novo',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../src/DianaWorkspace.js'),'utf8');
 const make=(tag,text='')=>({tag,children:[],attributes:{},dataset:{},className:'',textContent:text,append(...items){this.children.push(...items);},prepend(...items){this.children.unshift(...items);},insertBefore(node){this.inserted=node;},before(node){this.beforeNode=node;},addEventListener(){},setAttribute(name,value){this.attributes[name]=value;},removeAttribute(name){delete this.attributes[name];},querySelector(){return null;},querySelectorAll(){return [];}});
 const toolbar=make('div'),tagline=make('p'),start=make('span'),open=make('span'),tips=make('h2'),cards=make('div'),steps=Array.from({length:4},()=>make('li'));
 const welcome=make('div');welcome.querySelector=selector=>({'.welcome-logo':null,'.welcome-tagline':tagline,'.welcome-button[data-action="new-project"] span':start,'.welcome-button[data-action="open-project"] span':open,'.welcome-getting-started h2':tips,'.welcome-cards':cards,'.welcome-community':null})[selector]||null;welcome.querySelectorAll=()=>steps;
 const document={addEventListener(_name,callback){callback();},createElement:tag=>make(tag),getElementById(id){return id==='toolbar'?toolbar:null;},querySelector(selector){return selector==='.welcome-content'?welcome:null;}};
 class Observer{observe(){}}
 vm.runInNewContext(source,{document,MutationObserver:Observer,window:{},globalThis:{}});
 assert.equal(start.textContent,'Come\u00e7ar pela Vila da Clareira');assert.equal(open.textContent,'Abrir meu projeto');
 assert.equal(tagline.textContent.includes('Vila da Clareira'),true);assert.equal(tips.textContent,'Seu RPG come\u00e7a em um mundo pronto');
 assert.equal(steps[2].textContent,'Edite her\u00f3is, inimigos, poses, armas e sons por status.');
 assert.equal(welcome.inserted.className,'welcome-card diana-welcome-village');
 assert.ok(welcome.inserted.children.some(node=>node.textContent==='Vila da Clareira'));
});
