/* Deterministic, project-owned pixel raster source for the Diana Medieval RTP. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PNG}=require('../upstream/RPGReactor/editor/node_modules/pngjs');
const raster=require('./jrpg-raster.cjs'),repair=require('../src/DianaSpriteRepair.js');
const root=path.resolve(__dirname,'..'),out=path.join(root,'assets','rtp','medieval','pack');
const C={clear:[0,0,0,0],ink:[35,31,43,255],skin:[239,190,143,255],steel:[154,176,187,255],gold:[239,190,74,255],leaf:[68,126,81,255],wood:[119,74,45,255],fire:[244,111,47,255],water:[62,160,207,255],ice:[174,225,244,255],arcane:[169,99,223,255],wine:[194,52,64,255],wineLight:[255,132,96,255],blueLight:[118,220,242,255],leafLight:[145,205,92,255],steelLight:[223,238,235,255],goldDark:[151,93,44,255]};
function image(w,h,draw){const png=new PNG({width:w,height:h});for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=draw(x,y)||C.clear,i=(y*w+x)*4;png.data[i]=c[0];png.data[i+1]=c[1];png.data[i+2]=c[2];png.data[i+3]=c[3];}return png;}
function polygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,yi]=points[i],[xj,yj]=points[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
function lineDistance(x,y,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-(x1+t*dx),y-(y1+t*dy));}
function effect(col,style){return image(960,192,(x,y)=>{const f=Math.floor(x/192),px=x%192,cx=96,cy=96,dx=px-cx,dy=y-cy,d=Math.hypot(dx,dy),r=24+f*12;
 if(style==='slash')return Math.abs(dy+dx*.35)<7+f*2&&Math.abs(dx)<65?col:C.clear;
 if(style==='lightning')return Math.abs(dx-Math.sin((dy+f*7)/9)*18)<5&&Math.abs(dy)<70?col:C.clear;
 if(style==='water')return d>r-10&&d<r&&dy>0?col:C.clear;
 if(style==='ice')return Math.abs(dx)<r/2&&dy>-r&&dy<r&&Math.abs(dx)+Math.abs(dy)<r?col:C.clear;
 return d<r&&d>r-14?col:C.clear;});}
function icons(){const colors=[C.fire,C.water,C.ice,C.steel,C.gold,C.wood,C.arcane,C.leaf];return image(512,512,(x,y)=>{const n=Math.floor(x/32)+Math.floor(y/32)*16,px=x%32,py=y%32,col=colors[n%colors.length];
 if(n===1||n===6||n===7){const fill=n===1?C.wine:n===6?C.water:C.leaf,shine=n===1?C.wineLight:n===6?C.blueLight:C.leafLight,glass=[[10,11],[22,11],[24,15],[22,26],[19,29],[13,29],[10,26],[8,15]],inside=[[12,13],[20,13],[22,16],[20,25],[18,27],[14,27],[12,25],[10,16]];if(px>=13&&px<=19&&py>=5&&py<=12)return py<=7?C.goldDark:py>=11?C.ink:C.wood;if(polygon(px,py,glass)){if(!polygon(px,py,inside))return C.ink;if(py>=19)return py<24?fill:(n===1?C.wineLight:n===6?C.ice:C.leafLight);if(px<=13&&py<22)return shine;return n===6?C.blueLight:[150,195,198,255];}return C.clear;}
 if(n===3){const blade=lineDistance(px,py,10,24,24,7),handle=lineDistance(px,py,10,24,5,29),guard=lineDistance(px,py,7,21,14,27);if(blade<4.2)return blade>3?C.ink:(px+py<25?C.steelLight:C.steel);if(guard<2)return guard>1.35?C.ink:C.gold;if(handle<2.4)return handle>1.5?C.ink:C.wood;if((px===5&&py===29)||(px===6&&py===30))return C.gold;return C.clear;}
 if(n===4||n===5){const shape=n===4?[[8,5],[24,5],[27,17],[16,28],[5,17]]:[[8,7],[13,5],[19,5],[24,7],[27,14],[23,21],[20,27],[12,27],[9,21],[5,14]],inner=n===4?[[10,8],[22,8],[24,16],[16,24],[8,16]]:[[10,9],[14,8],[18,8],[22,9],[24,14],[21,19],[18,24],[14,24],[11,19],[8,14]];if(polygon(px,py,shape)){if(!polygon(px,py,inner))return C.ink;if(n===4){if(Math.abs(px-16)<=1)return C.gold;if(py<13&&px<14)return C.steelLight;return py<17?C.steel:C.goldDark;}if(px>=14&&px<=17&&py>=9&&py<=22)return C.gold;if(px<13&&py<16)return C.steelLight;return py<17?C.steel:C.goldDark;}return C.clear;}
 if(n===2){if(lineDistance(px,py,8,23,18,8)<3.5)return py<15?C.leafLight:C.leaf;if(lineDistance(px,py,8,23,18,8)<4.7)return C.ink;if(lineDistance(px,py,18,8,25,4)<2.1)return C.wood;return C.clear;}
 if(px<4||py<4||px>27||py>27)return C.clear;if(n%4===0)return (px-16)**2+(py-16)**2<90?col:C.clear;if(n%4===1)return Math.abs(px-16)<3||py>17?col:C.clear;if(n%4===2)return px>8&&px<24&&py>6&&py<27?col:C.clear;return Math.abs(px-16)+Math.abs(py-16)<14?col:C.clear;});}
function props(){return image(512,512,(x,y)=>{const tx=Math.floor(x/32),ty=Math.floor(y/32),px=x%32,py=y%32,n=tx+ty*16;
 if(n===0)return px>3&&px<28&&py>12&&py<29?(py<16?C.gold:C.wood):C.clear;
 if(n===1||n===2)return px>5&&px<26&&py>3&&py<30?(px>8&&px<23&&py>8&&py<26?C.wood:C.ink):C.clear;
 if(n===3)return py>17&&px>5&&px<26?C.wood:(Math.abs(px-16)+Math.abs(py-13)<11?C.fire:C.clear);
 if(n===4)return px>5&&px<27&&py>5&&py<29?C.steel:C.clear;
 return (px+py+n)%17===0?C.leaf:C.clear;});}
function write(folder,name,png){const dir=path.join(out,'img',folder);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,name+'.png'),PNG.sync.write(png));}
function compile(){
 fs.mkdirSync(out,{recursive:true});
 const staleIcons=path.join(out,'img/system/DianaMedievalIcons.png');if(fs.existsSync(staleIcons))fs.unlinkSync(staleIcons);
 write('characters','$LioraMedieval',PNG.sync.read(fs.readFileSync(path.join(root,'assets/jrpg-test/pack/img/characters/$Liora.png'))));
 const walkingSource=PNG.sync.read(fs.readFileSync(path.join(root,'assets/rtp/medieval/BrannCaminhada-v2.png'))),fixedWalk=repair.repack(walkingSource,6,4,{cellWidth:48,cellHeight:48,padding:1,threshold:95,isolate:true}),brann=new PNG({width:288,height:192});
 Buffer.from(fixedWalk.data).copy(brann.data);
 write('characters','$Brann',brann);
 const lioraSource=PNG.sync.read(fs.readFileSync(path.join(root,'assets/jrpg-test/pack/img/sv_actors/ClareiraCombate.png'))),lioraSheet=new PNG({width:1152,height:1152});
 const lioraFrames=[];for(const [row,from,count] of [[0,0,4],[1,1,4],[2,4,4],[3,0,4],[4,6,6],[5,4,4]]){
  const frames=Array.from({length:6},(_,i)=>({source:lioraSource,...raster.bounds(lioraSource,Math.min(i,count-1)*192,from*192,192,192)}));
  lioraFrames.push(...frames);
 }raster.aligned(lioraFrames,lioraSheet,{cellWidth:192,cellHeight:192,columns:6,targetHeight:154,baseline:184});
 write('sv_actors','LioraMedieval',lioraSheet);
 // Import original illustrated atlases with one consistent scale per row and feet aligned.
 const combat=raster.cells(PNG.sync.read(fs.readFileSync(path.join(root,'assets/rtp/medieval/BatalhadoresOriginais.png'))),12,12);
 for(const [folder,name,bx,by] of [['sv_actors','BrannMedieval',0,0],['enemies','LoboCinza',6,0],['enemies','MusgoVivo',0,6],['enemies','BruxaCinza',6,6]]){
  const sheet=new PNG({width:1152,height:1152});
  raster.aligned(combat.slice(by,by+6).flatMap(row=>row.slice(bx,bx+6)),sheet,{cellWidth:192,cellHeight:192,columns:6,targetHeight:154,baseline:184});
  if(name==='BrannMedieval'){
   const original=PNG.sync.read(fs.readFileSync(path.join(root,'assets/rtp/medieval/BatalhadoresOriginais.png'))),quadrant=new PNG({width:627,height:627});
   raster.blit(original,quadrant,0,0,627,627,0,0,627,627);
   const fixed=repair.repack(quadrant,6,6,{cellWidth:192,cellHeight:192,padding:7,threshold:95,isolate:true,allowUpscale:true});Buffer.from(fixed.data).copy(sheet.data);
   fs.writeFileSync(path.join(out,'brann-frame-audit.json'),JSON.stringify({rects:fixed.rects,warnings:fixed.warnings,metrics:fixed.metrics},null,2)+'\n');
  }
  write(folder,name,sheet);
 }
 const guardianSource=PNG.sync.read(fs.readFileSync(path.join(root,'assets/rtp/medieval/GuardiaoRaizOriginais.png'))),guardianCells=raster.cells(guardianSource,4,4),guardian=new PNG({width:768,height:768});
 for(let row=0;row<4;row++)raster.aligned(guardianCells[row],guardian,{cellWidth:192,cellHeight:192,row,targetHeight:160,baseline:174,padding:12});
 write('enemies','GuardiaoRaiz',guardian);
 write('tilesets','MedievalProps',props());write('system','IconSet',icons());
 for(const [name,col,style] of [['Corte',C.steel,'slash'],['Impacto',C.gold,'impact'],['Fogo',C.fire,'impact'],['Agua',C.water,'water'],['Gelo',C.ice,'ice'],['Raio',C.gold,'lightning'],['Arcano',C.arcane,'impact']])write('animations','Efeito'+name,effect(col,style));
 fs.copyFileSync(path.join(root,'LICENSE'),path.join(out,'LICENSE'));
 const files=[];const scan=dir=>fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).forEach(e=>{const f=path.join(dir,e.name);if(e.isDirectory())scan(f);else if(e.name.endsWith('.png')){const b=fs.readFileSync(f),p=PNG.sync.read(b);files.push({path:path.relative(out,f).replaceAll('\\','/'),width:p.width,height:p.height,sha256:crypto.createHash('sha256').update(b).digest('hex')});}});scan(path.join(out,'img'));
 const manifest={schemaVersion:1,id:'diana-native-medieval-rtp',version:3,license:'MIT',origin:'Arte original imagegen (BatalhadoresOriginais.png, BrannCaminhada-v2.png e GuardiaoRaizOriginais.png), Liora original do pack Clareira; efeitos, ícones e props procedurais Diana. Prompts em assets/rtp/GENERATION_PROMPTS.md; sem assets de jogos comerciais.',grid:{characters:[288,192],battlers:[1152,1152],rootGuardian:[768,768],effects:[960,192],icons:[512,512],props:[512,512]},files};
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
module.exports={compile};if(require.main===module)console.log('RTP Medieval compilado: '+compile().files.length+' PNGs.');
