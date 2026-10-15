/* Import generated art into the existing engine's raster layouts. Originals stay untouched. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PNG}=require('../upstream/RPGReactor/editor/node_modules/pngjs');
const root=path.resolve(__dirname,'..'),base=path.join(root,'assets/jrpg-test'),source=path.join(base,'originals'),out=path.join(base,'pack');
const read=name=>PNG.sync.read(fs.readFileSync(path.join(source,name+'.png')));
function blit(src,dst,sx,sy,sw,sh,dx,dy,dw,dh){for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){const a=(Math.min(src.height-1,Math.floor(sy+(y+.5)*sh/dh))*src.width+Math.min(src.width-1,Math.floor(sx+(x+.5)*sw/dw)))*4,b=((dy+y)*dst.width+dx+x)*4;src.data.copy(dst.data,b,a,a+4);}}
function write(folder,name,image){const dir=path.join(out,'img',folder);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,name+'.png'),PNG.sync.write(image));}
function compile(){
 for(const [name,output] of [['LioraCaminhada','$Liora'],['GuardiaoCaminhada','$Guardiao']]){const src=read(name),dst=new PNG({width:144,height:192});
  for(let row=0;row<4;row++)for(let col=0;col<3;col++){const use=name==='GuardiaoCaminhada'&&row===1&&col===2?0:col;blit(src,dst,use*src.width/3,row*src.height/4,src.width/3,src.height/4,col*48,row*48,48,48);}write('characters',output,dst);
 }
 const combat=read('Combate'),sheet=new PNG({width:768,height:1152});for(let row=0;row<4;row++)for(let col=0;col<4;col++)blit(combat,sheet,col*combat.width/4,row*combat.height/4,combat.width/4,combat.height/4,col*192,row*192,192,192);
 const damage=read('Dano');for(let row=0;row<2;row++)for(let col=0;col<4;col++)blit(damage,sheet,col*damage.width/4,row*damage.height/2,damage.width/4,damage.height/2,col*192,(row+4)*192,192,192);write('sv_actors','ClareiraCombate',sheet);
 const portraits=read('Rostos'),faces=new PNG({width:576,height:288});for(let row=0;row<2;row++)for(let col=0;col<2;col++)blit(portraits,faces,col*portraits.width/2,row*portraits.height/2,portraits.width/2,portraits.height/2,col*144,row*144,144,144);write('faces','ClareiraRostos',faces);
 const map=read('Clareira'),parallax=new PNG({width:1024,height:1024});blit(map,parallax,0,0,map.width,map.height,0,0,1024,1024);write('parallaxes','!VilaClareira',parallax);
 const forest=read('BosqueBatalha'),battleback=new PNG({width:1000,height:740});blit(forest,battleback,0,0,forest.width,forest.height,0,0,1000,740);write('battlebacks1','BosqueClareira',battleback);
 write('tilesets','ClareiraColisao',new PNG({width:768,height:48}));
 const files=[];function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())scan(file);else if(file.endsWith('.png')){const bytes=fs.readFileSync(file),img=PNG.sync.read(bytes);files.push({path:path.relative(out,file).replaceAll('\\','/'),width:img.width,height:img.height,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}}}scan(path.join(out,'img'));
 const manifest={schemaVersion:1,name:'Vila da Clareira',license:'MIT',origin:'Arte original gerada para Diana com imagegen; sem extração de jogos comerciais.',sampling:'nearest-neighbor; original art retained in ../originals',files};fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');fs.copyFileSync(path.join(root,'LICENSE'),path.join(out,'LICENSE'));return manifest;
}
module.exports={compile,blit};if(require.main===module)console.log('Importados '+compile().files.length+' assets para '+out);
