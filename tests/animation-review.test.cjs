'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.style={};this.attrs={};this.value='';}
 append(...nodes){this.children.push(...nodes);}replaceChildren(...nodes){this.children=nodes;}
 setAttribute(k,v){this.attrs[k]=v;}set textContent(v){this.text=String(v);this.children=[];}get textContent(){return (this.text||'')+this.children.map(n=>n.textContent||'').join('');}
 getContext(){const canvas=this;return {clearRect(){},fillRect(){},moveTo(){},lineTo(){},drawImage(...args){canvas.lastDraw=args;}};}
}
function load(){let frame;const document={createElement:t=>new Element(t),addEventListener(){}};const context={document,requestAnimationFrame:cb=>{frame=cb;return 1;},cancelAnimationFrame(){},console,Uint8ClampedArray};vm.runInNewContext(fs.readFileSync('src/DianaBattle2D.js','utf8'),context);return {...context,step:timestamp=>frame(timestamp)};}
const all=node=>[node,...node.children.flatMap(all)];
const grid=()=>({version:1,columns:3,rows:1,anchor:{x:.5,y:1},animations:{idle:{frames:[0,1],speed:6,loop:true}}});
test('prévia resolve loop, parada e quadros repetidos com a cadência lógica do runtime',()=>{
 const {DianaBattle2D:{animationFrameAt}}=load(),a={frames:[3,3,0],speed:6,loop:true};
 assert.equal(animationFrameAt(a,12).index,0);assert.equal(animationFrameAt(a,18).index,3);a.loop='once';assert.equal(animationFrameAt(a,999).index,0);assert.equal(animationFrameAt({...a,speed:0},10).index,0);
});
test('reordenação e repetição são reversíveis; revisar fundo e pausar não grava alterações',()=>{
 const c=load(),host=new Element('div');let commits=0;const composer=c.DianaSpriteComposer.mount(host,{value:grid(),onchange:()=>commits++,motions:['idle','guard']});
 const click=label=>all(host).find(n=>n.tag==='button'&&n.textContent===label).onclick();
 click('Repetir quadro');assert.deepEqual(Array.from(composer.value.animations.idle.frames),[0,0,1]);click('Desfazer sequência');assert.deepEqual(Array.from(composer.value.animations.idle.frames),[0,1]);click('Refazer sequência');assert.deepEqual(Array.from(composer.value.animations.idle.frames),[0,0,1]);
 const count=commits;click('Pausar prévia');click('Próximo quadro');const background=all(host).find(n=>n.attrs['aria-label']==='Fundo da revisão de transparência');background.value='light';background.onchange();assert.equal(commits,count);
 const motion=all(host).find(n=>n.attrs['aria-label']==='Animação');motion.value='guard';motion.onchange();assert.deepEqual(Array.from(composer.value.animations.guard.frames),[],'pose sem grade pode ser aberta sem falhar');composer.dispose();
});
test('redução usa uma escala comum para toda a folha e preserva a fonte',()=>{
 const {DianaBattle2D:{SpriteSheetTools}}=load(),width=24,height=12,data=new Uint8ClampedArray(width*height*4);
 const rect=(x,y,w,h)=>{for(let py=y;py<y+h;py++)for(let px=x;px<x+w;px++)data.set([120,60,40,255],(py*width+px)*4);};rect(1,1,10,10);rect(15,4,4,4);
 const result=SpriteSheetTools.center({width,height,data},2,1,2);assert.equal(result.sharedScale,.8);assert.equal(result.alignedCells[0].bounds.width,8);assert.equal(result.alignedCells[1].bounds.width,3);assert.equal(data[(1*width+1)*4+3],255);
});
