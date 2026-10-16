/* Import generated art into the existing engine's raster layouts. Originals stay untouched. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PNG}=require('../upstream/RPGReactor/editor/node_modules/pngjs');
const raster=require('./jrpg-raster.cjs'),kit=require('../src/DianaTileKit.js');
const root=path.resolve(__dirname,'..'),base=path.join(root,'assets/jrpg-test'),source=path.join(base,'originals'),out=path.join(base,'pack');
const read=name=>PNG.sync.read(fs.readFileSync(path.join(source,name+'.png')));
function blit(src,dst,sx,sy,sw,sh,dx,dy,dw,dh){for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){const a=(Math.min(src.height-1,Math.floor(sy+(y+.5)*sh/dh))*src.width+Math.min(src.width-1,Math.floor(sx+(x+.5)*sw/dw)))*4,b=((dy+y)*dst.width+dx+x)*4;src.data.copy(dst.data,b,a,a+4);}}
function write(folder,name,image){const dir=path.join(out,'img',folder);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,name+'.png'),PNG.sync.write(image));}
function interiorTileset(){
 const src=read('InterioresClareira'),image=new PNG({width:512,height:512});
 // Bounds reviewed against the original: generation does not guarantee equal spacing.
 const crops={sign:[0,0,330,500],market:[330,0,405,500],innSign:[740,0,330,450],counter:[1070,0,466,500],table:[0,500,390,524],bed:[390,500,390,524],shelf:[780,450,330,574]};
 for(const [name,box] of Object.entries(crops)){
  const o=kit.objects[name],f=raster.bounds(src,...box),scale=Math.min((o.width*32-2)/f.width,(o.height*32-2)/f.height),w=Math.round(f.width*scale),h=Math.round(f.height*scale);
  blit(src,image,f.x,f.y,f.width,f.height,o.x*32+Math.floor((o.width*32-w)/2),o.y*32+o.height*32-h,w,h);
 }
 return image;
}
function compile(){
 const alignment={walking:[],battle:[],guardian:[]};
 for(const [name,output] of [['GuardiaoCaminhada','$Guardiao']]){const src=raster.cells(read(name),3,4),dst=new PNG({width:144,height:192});
  for(let row=0;row<4;row++){const frames=src[row].slice();if(row===1)frames[2]=frames[0];alignment.guardian.push(...raster.aligned(frames,dst,{cellWidth:48,cellHeight:48,row,targetHeight:42,baseline:46}));}write('characters',output,dst);
 }
 const walking=raster.cells(read('LioraCaminhada6'),6,4),walk=new PNG({width:288,height:192});
 for(let row=0;row<4;row++)alignment.walking.push(...raster.aligned([2,1,0,5,4,3].map(i=>walking[row][i]),walk,{cellWidth:48,cellHeight:48,row,targetHeight:42,baseline:46}));write('characters','$Liora[f6]',walk);
 // The canonical name uses the same six-column contract as System.json.
 write('characters','$Liora',walk);
 const residents=raster.cells(read('MoradoresClareira'),12,8);
 for(const [name,bx,by] of [['Mira',0,0],['Orin',6,0],['Nila',0,4],['Ivo',6,4]]){
  const sheet=new PNG({width:288,height:192});
  for(let row=0;row<4;row++)raster.aligned(residents[by+row].slice(bx,bx+6),sheet,{cellWidth:48,cellHeight:48,row,targetHeight:42,baseline:46});
  write('characters','$'+name,sheet);
 }
 const old=raster.cells(read('Combate'),4,4),damage=raster.cells(read('Dano'),4,2),golem=raster.cells(read('GuardiaoCombate6'),6,3),victory=raster.isolatedCells(read('Vitoria6Final'),6,2),sheet=new PNG({width:1152,height:1536});
 for(const [row,frames,height] of [[0,old[0],156],[1,old[1],156],[2,golem[0],156],[3,golem[1],156],[4,damage[0],156],[5,golem[2],156],[6,victory[0],180],[7,victory[1],156]])alignment.battle.push(...raster.aligned(frames,sheet,{cellWidth:192,cellHeight:192,row,targetHeight:height,baseline:186}));
 write('sv_actors','ClareiraCombate',sheet);
 // Native A5: base textures and 16 neighbour masks for dirt/water shores.
 const textures=read('ClareiraTerrenosPadrao'),ground=new PNG({width:256,height:224}),samples=[];
 // Sample a small patch at 2:1. Shrinking a whole swatch into 32px destroys
 // pixel clusters and produces noisy grass/paving instead of the reference art.
 const patch=(type,column=0,row=0)=>{const tile=new PNG({width:32,height:32}),ox=type%4*textures.width/4,oy=Math.floor(type/4)*textures.height/2;blit(textures,tile,ox+32+column*80,oy+32+row*120,64,64,0,0,32,32);return tile;};
 for(let i=0;i<8;i++){const tile=patch(i);samples.push(tile);blit(tile,ground,0,0,32,32,i*32,0,32,32);}
 for(const [type,start] of [[0,40],[3,48]])for(let i=0;i<8;i++){const tile=patch(type,i%4,Math.floor(i/4)),index=start+i;blit(tile,ground,0,0,32,32,index%8*32,Math.floor(index/8)*32,32,32);}
 for(const [source,offset] of [[1,8],[2,24]])for(let mask=0;mask<16;mask++){
  const tile=new PNG({width:32,height:32});for(let y=0;y<32;y++)for(let x=0;x<32;x++){
   const distances=[y,31-x,31-y,x],inside=distances.every((d,i)=>(mask&(1<<i))||d>=5);
   const a=(y*32+x)*4;(inside?samples[source]:samples[0]).data.copy(tile.data,a,a,a+4);
  }const index=offset+mask;blit(tile,ground,0,0,32,32,index%8*32,Math.floor(index/8)*32,32,32);
 }write('tilesets','ClareiraTerrenos',ground);
 const architecture=read('ClareiraObjetosPadrao'),fountain=read('ObjetosGrandiosos');
 const boxes={tree:[0,0,366,470],house:[366,0,378,470],shrine:[744,0,434,480],bush:[1178,0,270,480],rock:[0,485,366,275],flowers:[380,485,365,275],lamp:[770,480,175,280],fence:[1020,480,428,280],bridge:[0,780,420,306],pine:[420,750,300,336],cliff:[744,770,410,316],stump:[1160,790,288,296]};
 const extract=name=>name==='well'?{source:fountain,...raster.bounds(fountain,1026,0,420,525)}:{source:architecture,...raster.bounds(architecture,...boxes[name])};
 const pieces=Object.entries(kit.objects).filter(([,o])=>o.page==='B').map(([name])=>extract(name)),objects=new PNG({width:512,height:512});
 Object.values(kit.objects).filter(o=>o.page==='B').forEach((o,i)=>{const f=pieces[i],scale=Math.min((o.width*32-2)/f.width,(o.height*32-2)/f.height),w=Math.round(f.width*scale),h=Math.round(f.height*scale);blit(f.source,objects,f.x,f.y,f.width,f.height,o.x*32+Math.floor((o.width*32-w)/2),o.y*32+o.height*32-h,w,h);});write('tilesets','ClareiraObjetos',objects);
 const landscape=new PNG({width:512,height:512});
 for(const [name,o] of Object.entries(kit.objects).filter(([,o])=>o.page==='D')){
  const f=extract(name),scale=Math.min((o.width*32-2)/f.width,(o.height*32-2)/f.height),w=Math.round(f.width*scale),h=Math.round(f.height*scale);
  blit(f.source,landscape,f.x,f.y,f.width,f.height,o.x*32+Math.floor((o.width*32-w)/2),o.y*32+o.height*32-h,w,h);
 }write('tilesets','ClareiraPaisagem',landscape);
 write('tilesets','ClareiraInteriores',interiorTileset(textures));
 fs.writeFileSync(path.join(out,'alignment.json'),JSON.stringify(alignment,null,2)+'\n');
 fs.writeFileSync(path.join(out,'chipset.json'),JSON.stringify({schemaVersion:1,tileSize:32,pages:{A5:{name:'ClareiraTerrenos',tileIdStart:1536,columns:8},B:{name:'ClareiraObjetos',tileIdStart:0,columns:16},C:{name:'ClareiraInteriores',tileIdStart:256,columns:16},D:{name:'ClareiraPaisagem',tileIdStart:512,columns:16}},terrain:kit.terrain,objects:kit.objects},null,2)+'\n');
 const portraits=read('Rostos'),faces=new PNG({width:576,height:288});for(let row=0;row<2;row++)for(let col=0;col<2;col++)blit(portraits,faces,col*portraits.width/2,row*portraits.height/2,portraits.width/2,portraits.height/2,col*144,row*144,144,144);write('faces','ClareiraRostos',faces);
 const map=read('Clareira'),parallax=new PNG({width:1024,height:1024});blit(map,parallax,0,0,map.width,map.height,0,0,1024,1024);write('parallaxes','!VilaClareira',parallax);
 // Keep the first approved scene intact at its original tile scale within the
 // expanded, editable world. Transparent margins let native terrain and
 // buildings outside the scenic plate remain visible and walkable.
 const expanded=new PNG({width:80*32,height:64*32});
 blit(parallax,expanded,0,0,parallax.width,parallax.height,20*32,16*32,parallax.width,parallax.height);
 write('parallaxes','!VilaClareiraExpandida',expanded);
 const forest=read('BosqueBatalha'),battleback=new PNG({width:1000,height:740});blit(forest,battleback,0,0,forest.width,forest.height,0,0,1000,740);write('battlebacks1','BosqueClareira',battleback);
 write('tilesets','ClareiraColisao',new PNG({width:768,height:48}));
 const files=[];function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const file=path.join(dir,entry.name);if(entry.isDirectory())scan(file);else if(file.endsWith('.png')){const bytes=fs.readFileSync(file),img=PNG.sync.read(bytes);files.push({path:path.relative(out,file).replaceAll('\\','/'),width:img.width,height:img.height,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}}}scan(path.join(out,'img'));
 const manifest={schemaVersion:1,name:'Vila da Clareira',license:'MIT',origin:'Arte original gerada para Diana com imagegen; sem extração de jogos comerciais.',sampling:'nearest-neighbor; original art retained in ../originals',files};fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');fs.copyFileSync(path.join(root,'LICENSE'),path.join(out,'LICENSE'));return manifest;
}
module.exports={compile,blit};if(require.main===module)console.log('Importados '+compile().files.length+' assets para '+out);
