/* Compiles approved, project-owned vehicle sources without regenerating originals. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PNG}=require('../upstream/RPGReactor/editor/node_modules/pngjs');
const raster=require('./jrpg-raster.cjs');
const root=path.resolve(__dirname,'..'),source=path.join(root,'assets','vehicles','originals'),out=path.join(root,'assets','vehicles','pack');
const files=[['$DianaAirship.png',144,192],['$DianaBoat.png',144,192],['$DianaShip.png',144,192]];
function sha(bytes){return crypto.createHash('sha256').update(bytes).digest('hex');}
function compile(){
 fs.mkdirSync(path.join(out,'img','characters'),{recursive:true});
 const entries=files.map(([name,width,height])=>{
  const input=path.join(source,name.slice(1,-4)+'Illustrated.png');if(!fs.existsSync(input))throw new Error('Fonte original ausente: '+input);
  const frames=raster.cells(PNG.sync.read(fs.readFileSync(input)),3,4),png=new PNG({width,height});
  for(let row=0;row<4;row++)raster.aligned(frames[row],png,{cellWidth:48,cellHeight:48,row,targetHeight:42,baseline:46});
  const bytes=PNG.sync.write(png);fs.writeFileSync(path.join(out,'img','characters',name),bytes);
  return {path:'img/characters/'+name,width,height,sha256:sha(bytes)};
 });
 fs.copyFileSync(path.join(root,'LICENSE'),path.join(out,'LICENSE'));
 const manifest={schemaVersion:1,id:'diana-native-vehicles',version:1,license:'MIT',origin:'Sprites originais Diana, desenhados especificamente para este projeto; sem recursos de jogos comerciais.',grid:{characters:[144,192],columns:3,rows:4,cell:[48,48]},files:entries};
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 return manifest;
}
module.exports={compile};if(require.main===module)console.log('Veículos compilados: '+compile().files.length+' PNGs.');
