'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const repair=require('../src/DianaSpriteRepair.js'),ui=require('../src/DianaSpriteRepairUI.js');
const {PNG,blit}=require('../scripts/jrpg-raster.cjs');
const read=file=>PNG.sync.read(fs.readFileSync(file));
test('recupera cabeça que cruza linha nominal sem copiar o personagem vizinho',()=>{
 const width=20,height=40,data=new Uint8ClampedArray(width*height*4);
 for(const [top,bottom,color] of [[2,16,30],[18,36,200]])for(let y=top;y<=bottom;y++)for(let x=6;x<14;x++)data.set([color,20,40,255],(y*width+x)*4);
 const source={width,height,data},before=Buffer.from(data),result=repair.repack(source,1,2,{isolate:true,cellWidth:20,cellHeight:24,padding:2});
 assert.equal(result.metrics[1].source.y,18,'the head starts before nominal y=20');
 assert.equal(result.metrics[1].source.height,19);
 for(let y=0;y<24;y++)for(let x=0;x<20;x++)assert.notEqual(result.data[(y*20+x)*4],200);
 assert.deepEqual(Buffer.from(source.data),before);
});
test('inspeciona todos os 24 quadros de Liora e Brann e 36 de combate a partir dos originais',()=>{
 for(const [original,packed,columns,rows,size,padding] of [
  ['assets/jrpg-test/originals/LioraCaminhada6.png','assets/jrpg-test/pack/img/characters/$Liora.png',6,4,48,1],
  ['assets/rtp/medieval/BrannCaminhada-v2.png','assets/rtp/medieval/pack/img/characters/$Brann.png',6,4,48,1],
  ['assets/rtp/medieval/BatalhadoresOriginais.png','assets/rtp/medieval/pack/img/sv_actors/BrannMedieval.png',6,6,192,7]]){
  let source=read(original);if(rows===6){const quadrant=new PNG({width:627,height:627});blit(source,quadrant,0,0,627,627,0,0,627,627);source=quadrant;}
  const expected=repair.repack(source,columns,rows,{isolate:true,threshold:95,cellWidth:size,cellHeight:size,padding,allowUpscale:rows===6}),actual=read(packed);
  assert.deepEqual(Buffer.from(expected.data),actual.data,packed+' is produced from complete components, not equal cuts');
  const frameSignatures=[];
  for(let row=0;row<rows;row++){
   const signatures=new Set();for(let col=0;col<columns;col++){
    const index=row*columns+col,metric=expected.metrics[index];assert.ok(!metric.empty,packed+' frame '+index);
    const box={x:col*size,y:row*size,width:size,height:size},b=repair.bounds(actual,box);assert.ok(b);
    assert.ok(b.x>box.x&&b.x+b.width<box.x+size&&b.y>box.y&&b.y+b.height<box.y+size,'every border is transparent');
    assert.equal(b.y+b.height,box.y+size-padding,'common foot baseline');
    const bytes=[];for(let y=box.y;y<box.y+size;y++)bytes.push(actual.data.subarray((y*actual.width+box.x)*4,(y*actual.width+box.x+size)*4));signatures.add(crypto.createHash('sha256').update(Buffer.concat(bytes)).digest('hex'));
   }frameSignatures.push(signatures.size);
  }
  assert.ok(frameSignatures.every(n=>n===6),'each direction/pose has six genuinely distinct frames: '+packed);
  if(original.includes('Liora'))assert.ok(expected.metrics[12].source.y<512,'right-facing head crosses the old y=512 cut');
  if(rows===6){assert.ok(expected.metrics[8].source.x<209,'attack sword crosses former column');assert.equal(expected.metrics[25].source.y,410,'victory sword is recovered above old row');}
 }
});
test('correção atualiza grade e referências de aliados e inimigos sem tocar a folha antiga',()=>{
 const data={system:{},actors:[null,{characterName:'$Brann',battlerName:'BrannMedieval'}],battlePresentation:{actors:{2:{graphic:{name:'BrannMedieval',folder:'sv_actors'}}},enemies:{2:{graphic:{name:'BrannMedieval',folder:'sv_actors'}}}}};
 const grid=ui.walkGrid();ui.apply(data,'characters','$brann','$Brann_centralizado',grid);
 assert.equal(data.actors[1].characterName,'$Brann_centralizado');assert.deepEqual(data.system.dianaSpriteAnimations.characters.$Brann_centralizado.animations.walk.directions[6],[14,12,13,17,15,16]);
 ui.apply(data,'sv_actors','brannmedieval','Brann_corrigido',grid);
 for(const kind of ['actors','enemies'])assert.equal(data.battlePresentation[kind][2].graphic.name,'Brann_corrigido');
 assert.equal(data.actors[1].battlerName,'Brann_corrigido');assert.equal(grid.animations.walk.frames.length,6);
});
test('recortes manuais e margens inválidos são rejeitados antes de gerar pixels',()=>{
 const image={width:8,height:8,data:new Uint8ClampedArray(256)};
 assert.throws(()=>repair.repack(image,1,1,{rects:[{x:7,y:0,width:3,height:8}]}),/Recorte/);
 assert.throws(()=>repair.repack(image,1,1,{padding:4}),/margem/);
 const result=repair.repack(image,1,1,{isolate:true});assert.equal(result.metrics[0].empty,true);
});
test('passada lateral de Brann alterna pernas abertas e pés juntos, com repouso neutro',()=>{
 const image=read('assets/rtp/medieval/pack/img/characters/$Brann.png');
 const footSpan=(row,column)=>{let min=48,max=-1;for(let y=34;y<47;y++)for(let x=0;x<48;x++)if(image.data[((row*48+y)*image.width+column*48+x)*4+3]>95){min=Math.min(min,x);max=Math.max(max,x);}return max-min+1;};
 for(const row of [1,2])for(const passing of [2,5])assert.ok(footSpan(row,passing)<footSpan(row,0)*.75,'passing pose must bring both feet under the hips');
 assert.equal(ui.walkGrid().animations.walk.frames[0],2,'idle chooses the neutral pose');
});
test('quadro fixado de grade ignora relógio e velocidade para aliados e inimigos',()=>{
 const path=require('node:path'),source=process.env.DIANA_BATTLE_SOURCE;
 for(const file of ['editor/src/battle/BattleData.js','runtime/reactor_battle_data.js']){
  let B;
  if(source)B=require(path.join(source,file));
  else{
   // Normal tests exercise the versioned delta without requiring a prepared build.
   // test:prepared runs the exported and patched files themselves.
   const patch=fs.readFileSync(path.resolve(__dirname,'../patches/zzzzzzzzzzzzzzzzz-sprite-grid-held-frames.patch'),'utf8');
   const section=patch.split('diff --git a/'+file+' b/'+file)[1].split('diff --git ')[0];
   const added=section.split(/\r?\n/).filter(l=>l.startsWith('+')&&!l.startsWith('+++')).map(l=>l.slice(1));
   let code=fs.readFileSync(path.resolve(__dirname,'../upstream/RPGReactor',file),'utf8');
   code=code.replace(/^\s*B\.spriteGridFrame=.*$/m,added.find(l=>l.includes('B.spriteGridFrame='))).replace(/^\s*const gridFrame=B\.spriteGridFrame.*$/m,added.find(l=>l.includes('const gridFrame=')));
   const context={module:{exports:{}},require};require('node:vm').runInNewContext(code,context);B=context.module.exports;
  }
  for(const kind of ['actors','enemies']){
   const grid={version:1,columns:6,rows:6,anchor:{x:.5,y:1},animations:{idle:{frames:[0,1,2,3,4,5],speed:10,loop:true},attack:{frames:[6,7,8,9,10,11],speed:6,loop:false}}},g=B.graphic({[kind]:{1:{graphic:{mode:'static',name:'Test',folder:'sv_actors',spriteAnimation:grid}}}},kind,1,{});
   for(let index=0;index<6;index++)for(const time of [0,31,10000]){
    const frame=B.graphicFrame(g,1152,1152,'attack',time,-90,index);assert.deepEqual([frame.x,frame.y,frame.width,frame.height],[index*192,192,192,192]);
   }
   assert.equal(B.graphicFrame(g,1152,1152,'attack',0,-90,999).x,960);
  }
 }
});
