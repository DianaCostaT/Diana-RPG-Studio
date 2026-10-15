/* Original Diana app mark, rendered deterministically without extra dependencies. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const inside=(x,y,points)=>{let yes=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [a,b]=points[i],[c,d]=points[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)yes=!yes;}return yes;};
function pixel(x,y){
 const dx=Math.max(32-x,0,x-96),dy=Math.max(32-y,0,y-96);if(x<4||x>124||y<4||y>124||dx*dx+dy*dy>28*28)return [0,0,0,0];
 let color=[34,37,54,255];
 for(const [shape,rgba] of [[[[64,18],[99,64],[64,110],[29,64]],[183,173,255,255]],[[[64,18],[99,64],[64,64]],[230,225,255,255]],[[[64,64],[99,64],[64,110]],[130,112,210,255]],[[[64,43],[80,64],[64,85],[48,64]],[34,37,54,255]],[[[99,18],[102,27],[111,30],[102,33],[99,42],[96,33],[87,30],[96,27]],[181,228,209,255]]])if(inside(x,y,shape))color=rgba;
 return color;
}
function crc(buffer){let n=0xffffffff;for(const byte of buffer){n^=byte;for(let i=0;i<8;i++)n=(n>>>1)^((n&1)?0xedb88320:0);}return (n^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),out=Buffer.alloc(12+data.length);out.writeUInt32BE(data.length);t.copy(out,4);data.copy(out,8);out.writeUInt32BE(crc(Buffer.concat([t,data])),8+data.length);return out;}
function png(size){const raw=Buffer.alloc((size*4+1)*size);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const sum=[0,0,0,0];for(let sy=0;sy<4;sy++)for(let sx=0;sx<4;sx++){const p=pixel((x+(sx+.5)/4)*128/size,(y+(sy+.5)/4)*128/size);for(let c=0;c<4;c++)sum[c]+=p[c];}for(let c=0;c<4;c++)raw[y*(size*4+1)+1+x*4+c]=Math.round(sum[c]/16);}
 const head=Buffer.alloc(13);head.writeUInt32BE(size);head.writeUInt32BE(size,4);head[8]=8;head[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',head),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);}
function ico(){const sizes=[16,32,48,256],images=sizes.map(png),head=Buffer.alloc(6+16*sizes.length);head.writeUInt16LE(1,2);head.writeUInt16LE(sizes.length,4);let offset=head.length;images.forEach((data,i)=>{const start=6+i*16;head[start]=sizes[i]===256?0:sizes[i];head[start+1]=head[start];head.writeUInt16LE(1,start+4);head.writeUInt16LE(32,start+6);head.writeUInt32LE(data.length,start+8);head.writeUInt32LE(offset,start+12);offset+=data.length;});return Buffer.concat([head,...images]);}
function generate(dir){fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'diana.png'),png(256));fs.writeFileSync(path.join(dir,'diana.ico'),ico());fs.copyFileSync(path.resolve(__dirname,'../src/assets/diana.svg'),path.join(dir,'diana.svg'));return path.join(dir,'diana.ico');}
module.exports={generate,png,ico};if(require.main===module)generate(path.resolve(process.argv[2]||'artifacts/diana-icons'));
