'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const raster=require('./jrpg-raster.cjs');
const {PNG}=raster;
const base=path.resolve(__dirname,'../assets/art-library-v2'),out=path.join(base,'pack');
const read=name=>PNG.sync.read(fs.readFileSync(path.join(base,'originals',name+'.png')));
function write(folder,name,image){const dir=path.join(out,'img',folder);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,name+'.png'),PNG.sync.write(image));}
function isolated(source,columns,rows){const detected=require('../src/DianaSpriteRepair.js').detect(source,columns,rows,{isolate:true,threshold:95});if(detected.warnings.some(w=>w.reason==='empty'))throw Error('Asset isolado ausente');return detected.rects.map((r,i)=>{const png=new PNG({width:r.width,height:r.height});for(const pixel of detected.masks[i]){const x=pixel%source.width-r.x,y=Math.floor(pixel/source.width)-r.y;source.data.copy(png.data,(y*r.width+x)*4,pixel*4,pixel*4+4);}return {source:png,x:0,y:0,width:r.width,height:r.height};});}
function compile(){
 write('tilesets','DianaV2Collision',new PNG({width:256,height:224}));
 for(const name of ['MercadoClareiraV2','DistritoNeonV2']){const source=read(name),image=new PNG({width:1280,height:1280});raster.blit(source,image,0,0,source.width,source.height,0,0,1280,1280);write('parallaxes','!'+name,image);}
 const backdrop=read('DistritoNeonBatalhaV2'),scaledBackdrop=new PNG({width:1000,height:750}),battleback=new PNG({width:1000,height:740});raster.blit(backdrop,scaledBackdrop,0,0,backdrop.width,backdrop.height,0,0,1000,750);raster.blit(scaledBackdrop,battleback,0,5,1000,740,0,0,1000,740);write('battlebacks1','DistritoNeonBatalhaV2',battleback);
 const brann=read('BrannCombateV2'),sheet=new PNG({width:1536,height:1536});
 // One scale across all 36 poses; preserve aspect ratio and align feet.
 const fixed=require('../src/DianaSpriteRepair.js').repack(brann,6,6,{cellWidth:256,cellHeight:256,padding:8,threshold:95,isolate:true});Buffer.from(fixed.data).copy(sheet.data);
 fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'brann-audit.json'),JSON.stringify({scale:fixed.scale,warnings:fixed.warnings,metrics:fixed.metrics},null,2)+'\n');
 write('sv_actors','BrannClareiraV2',sheet);
 const repair=require('../src/DianaSpriteRepair.js');
 for(const [source,name,rows,folder,size] of [['ArqueiraCaminhadaV2','$ArqueiraV2',4,'characters',64],['EntregadoraCaminhadaV2','$EntregadoraV2',4,'characters',64],['ArqueiraCombateV3','ArqueiraCombateV2',6,'sv_actors',256],['EntregadoraCombateV3','EntregadoraCombateV2',6,'sv_actors',256],['RoboCombateV2','RoboSegurancaAnimV2',6,'enemies',256],['GolemCombateV3','GolemMusgoAnimV2',6,'enemies',256]]){
  const fixed=repair.repack(read(source),6,rows,{cellWidth:size,cellHeight:size,padding:size===64?2:8,threshold:95,isolate:true});
  const empty=fixed.metrics.filter(f=>f.empty).map(f=>f.index),heldVictory=source==='EntregadoraCombateV3'&&JSON.stringify(empty)==='[28,29]';
  if(empty.length&&!heldVictory)throw Error('Quadro vazio: '+source);
  const png=new PNG({width:fixed.width,height:fixed.height});Buffer.from(fixed.data).copy(png.data);write(folder,name,png);
  // Four authored victory poses plus two explicit held salute beats.
  if(heldVictory){for(const [to,from] of [[28,26],[29,27]])raster.blit(png,png,from%6*size,Math.floor(from/6)*size,size,size,to%6*size,Math.floor(to/6)*size,size,size);write(folder,name,png);}
  fs.writeFileSync(path.join(out,name.replace('$','')+'-audit.json'),JSON.stringify({source,scale:fixed.scale,warnings:fixed.warnings,heldVictory:heldVictory?{28:26,29:27}:null,metrics:fixed.metrics},null,2)+'\n');
 }
 const terrain=read('TerrenosV2');
 for(const [theme,offset] of [['Medieval',0],['Cyber',4]]){
  const page=new PNG({width:256,height:512});for(let n=0;n<4;n++){const sx=(offset+n)%4*terrain.width/4,sy=Math.floor((offset+n)/4)*terrain.height/2;
   for(let variant=0;variant<7;variant++){const index=n+variant*8;raster.blit(terrain,page,sx+24+(variant%4)*48,sy+24+Math.floor(variant/4)*64,64,64,index%8*32,Math.floor(index/8)*32,32,32);}
  }
  for(let type=1;type<=3;type++)for(let mask=0;mask<16;mask++){const index=64+(type-1)*16+mask;for(let y=0;y<32;y++)for(let x=0;x<32;x++){const edge=[y,31-x,31-y,x],inside=edge.every((d,i)=>(mask&(1<<i))||d>=4+(x+y)%3),from=(y*page.width+(inside?type*32:0)+x)*4,to=((Math.floor(index/8)*32+y)*page.width+index%8*32+x)*4;page.data.copy(page.data,to,from,from+4);}}
  write('tilesets','DianaV2'+theme+'Terrenos',page);
 }
 for(const theme of ['Medieval','Cyber']){const cells=isolated(read(theme+'ObjetosV2'),4,3),page=new PNG({width:512,height:512}),heights=[156,156,92,138,156,156,92,76,76,40,60,128];
  // Reposition each independently aligned object into the native 4x5-tile slot.
  page.data.fill(0);cells.forEach((frame,i)=>{const object=new PNG({width:128,height:160});raster.aligned([frame],object,{cellWidth:128,cellHeight:160,targetHeight:heights[i],baseline:157,padding:3});raster.blit(object,page,0,0,128,160,i%4*128,Math.floor(i/4)*160,128,160);});write('tilesets','DianaV2'+theme+'Objetos',page);
 }
 const split=(source,columns,rows,names,folder,size)=>{const cells=isolated(read(source),columns,rows);names.forEach((name,i)=>{const image=new PNG({width:size,height:size});raster.aligned([cells[i]],image,{cellWidth:size,cellHeight:size,targetHeight:size-16,baseline:size-8,padding:8});write(folder,name,image);});};
 split('PersonagensV2',4,2,['BrannRetratoV2','ArqueiraV2','SabiaV2','FerreiraV2','EntregadoraNeonV2','HackerNeonV2','SamuraiNeonV2','AndroideNeonV2'],'pictures',256);
 const faces=PNG.sync.read(fs.readFileSync(path.resolve(__dirname,'../assets/jrpg-test/pack/img/faces/ClareiraRostos.png'))),people=read('PersonagensV2');
 raster.blit(people,faces,247,0,150,150,288,144,144,144);raster.blit(people,faces,570,0,200,200,432,144,144,144);raster.blit(people,faces,225,443,150,150,432,0,144,144);write('faces','ClareiraRostos',faces);
 split('MonstrosV2',4,2,['GolemMusgoV2','LoboPrataV2','DragaoBosqueV2','BruxaCogumeloV2','RoboSegurancaV2','MercenarioNeonV2','DroneNeonV2','SerpenteNeonV2'],'enemies',256);
 const equipment=['Espada','Arco','Martelo','Cajado','Escudo','Armadura','Botas','Capa','PocaoPV','PocaoPM','Erva','Pao','Chave','Grimorio','Anel','Moedas','Katana','PistolaPlasma','Rifle','Bastao','EscudoHolo','Jaqueta','LuvaCyber','Visor','Medkit','Bateria','Chip','Cyberdeck','ControleDrone','ChaveCircuito','Nanitos','Creditos'];
 split('EquipamentosV2',8,4,equipment.map(n=>'DianaV2'+n),'pictures',128);
 const legacy=PNG.sync.read(fs.readFileSync(path.resolve(__dirname,'../assets/rtp/medieval/pack/img/system/IconSet.png'))),icons=new PNG({width:512,height:576});
 raster.blit(legacy,icons,0,0,512,512,0,0,512,512);
 isolated(read('EquipamentosV2'),8,4).forEach((f,i)=>{const scale=Math.min(28/f.width,28/f.height),w=Math.round(f.width*scale),h=Math.round(f.height*scale);raster.blit(f.source,icons,f.x,f.y,f.width,f.height,(i%16)*32+Math.floor((32-w)/2),512+Math.floor(i/16)*32+Math.floor((32-h)/2),w,h);});write('system','IconSet',icons);
 const effects=raster.cells(read('EfeitosV2'),5,4);
 effects.forEach((frames,row)=>{const image=new PNG({width:960,height:192});raster.aligned(frames,image,{cellWidth:192,cellHeight:192,columns:5,targetHeight:168,baseline:180,padding:8});write('animations',['CorteV2','FogoV2','PlasmaV2','EscudoCyberV2'][row],image);});
 const files=[];for(const folder of fs.readdirSync(path.join(out,'img')).sort())for(const name of fs.readdirSync(path.join(out,'img',folder)).sort()){const file=path.join(out,'img',folder,name),bytes=fs.readFileSync(file),image=PNG.sync.read(bytes);files.push({path:'img/'+folder+'/'+name,width:image.width,height:image.height,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
 fs.copyFileSync(path.resolve(__dirname,'../LICENSE'),path.join(out,'LICENSE'));
 fs.copyFileSync(path.join(base,'GENERATION.md'),path.join(out,'GENERATION.md'));
 const sources=fs.readdirSync(path.join(base,'originals')).filter(n=>n.endsWith('.png')).sort().map(name=>({path:'originals/'+name,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(base,'originals',name))).digest('hex')}));
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({schemaVersion:1,id:'diana-art-library-v2',origin:'Arte original gerada com image_gen; prompts e limitações em ../GENERATION.md',license:'MIT',sampling:'nearest-neighbor',sources,files},null,2)+'\n');return files;
}
module.exports={compile};if(require.main===module)console.log('Biblioteca V2: '+compile().length+' recursos.');
