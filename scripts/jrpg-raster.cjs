'use strict';
const {PNG}=require('../upstream/RPGReactor/editor/node_modules/pngjs');
// Alpha bounds ignore the faint fringe often present around generated sprites.
function bounds(src,sx=0,sy=0,width=src.width,height=src.height){
 let left=width,top=height,right=-1,bottom=-1;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(src.data[((sy+y)*src.width+sx+x)*4+3]>=96){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 if(right<left)throw Error('Empty sprite cell');return {x:sx+left,y:sy+top,width:right-left+1,height:bottom-top+1};
}
function cells(src,columns,rows){return Array.from({length:rows},(_,r)=>Array.from({length:columns},(_,c)=>{
 const x=Math.round(c*src.width/columns),y=Math.round(r*src.height/rows),width=Math.round((c+1)*src.width/columns)-x,height=Math.round((r+1)*src.height/rows)-y;
 return {source:src,...bounds(src,x,y,width,height)};
}));}
function isolatedCells(src,columns,rows){
 const result=Array.from({length:rows},()=>[]);
 for(let c=0;c<columns;c++){
  const x=Math.round(c*src.width/columns),w=Math.round((c+1)*src.width/columns)-x,bands=[];let band=null;
  for(let y=0;y<src.height;y++){
   let count=0;for(let px=x;px<x+w;px++)if(src.data[(y*src.width+px)*4+3]>=96)count++;
   if(count){if(!band||y-band.bottom>12){band={top:y,bottom:y,area:0};bands.push(band);}band.bottom=y;band.area+=count;}
  }
  const selected=bands.sort((a,b)=>b.area-a.area).slice(0,rows).sort((a,b)=>a.top-b.top);
  if(selected.length!==rows)throw Error('Expected '+rows+' isolated sprites in column '+c);
  selected.forEach((b,r)=>result[r].push({source:src,...bounds(src,x,b.top,w,b.bottom-b.top+1)}));
 }return result;
}
function blit(src,dst,sx,sy,sw,sh,dx,dy,dw,dh){
 for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){
  const a=(Math.min(src.height-1,Math.floor(sy+(y+.5)*sh/dh))*src.width+Math.min(src.width-1,Math.floor(sx+(x+.5)*sw/dw)))*4,tx=dx+x,ty=dy+y;
  if(tx<0||ty<0||tx>=dst.width||ty>=dst.height)throw Error('Sprite exceeds target cell');
  src.data.copy(dst.data,(ty*dst.width+tx)*4,a,a+4);
 }
}
function aligned(frames,dst,{cellWidth,cellHeight,row=0,columns=frames.length,targetHeight=cellHeight-8,baseline=cellHeight-3}={}){
 // One scale for the complete animation, never independent X/Y stretching.
 const scale=Math.min(targetHeight/Math.max(...frames.map(f=>f.height)),(cellWidth-6)/Math.max(...frames.map(f=>f.width)));
 const metrics=[];
 frames.forEach((f,i)=>{const w=Math.max(1,Math.round(f.width*scale)),h=Math.max(1,Math.round(f.height*scale)),x=(i%columns)*cellWidth+Math.floor((cellWidth-w)/2),y=(row+Math.floor(i/columns))*cellHeight+baseline-h+1;
  blit(f.source,dst,f.x,f.y,f.width,f.height,x,y,w,h);metrics.push({column:i%columns,row:row+Math.floor(i/columns),x:x%cellWidth,y:y%cellHeight,width:w,height:h,baseline});
 });return metrics;
}
function tileId(x,y){if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>=16||y<0||y>=16)throw Error('Invalid B tile');return (x>=8?128:0)+y*8+x%8;}
module.exports={PNG,bounds,cells,isolatedCells,blit,aligned,tileId};
