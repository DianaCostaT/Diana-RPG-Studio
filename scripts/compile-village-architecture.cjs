'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),raster=require('./jrpg-raster.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'assets/village/pack');
function compile(){
 const source=path.join(root,'assets/village/originals/ArquiteturaClareira.png');
 const frames=raster.cells(raster.PNG.sync.read(fs.readFileSync(source)),2,2).flat(),sheet=new raster.PNG({width:512,height:512});
 frames.forEach((frame,i)=>{const building=new raster.PNG({width:192,height:192});raster.aligned([frame],building,{cellWidth:192,cellHeight:192,targetHeight:186,baseline:191});raster.blit(building,sheet,0,0,192,192,i%2*256,Math.floor(i/2)*256,192,192);});
 const relative='img/tilesets/ClareiraArquitetura.png',target=path.join(out,relative),bytes=raster.PNG.sync.write(sheet);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);
 const manifest={version:1,license:'MIT',origin:'Arquitetura original Diana gerada com imagegen, variante de telhados azul-petróleo; fonte preservada.',sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),files:[{path:relative,width:512,height:512,sha256:crypto.createHash('sha256').update(bytes).digest('hex')}]};
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');fs.copyFileSync(path.join(root,'LICENSE'),path.join(out,'LICENSE'));return manifest;
}
module.exports={compile};if(require.main===module)console.log('Arquitetura da vila compilada: '+compile().files.length+' atlas.');
