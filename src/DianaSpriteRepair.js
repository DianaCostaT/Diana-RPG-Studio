/* Original Diana pixel-only sheet repair; shared by authoring and asset import. */
(function(root){
 'use strict';
 function validate(image,columns,rows){
  if(!Number.isInteger(image?.width)||!Number.isInteger(image?.height)||!image.data||image.data.length!==image.width*image.height*4||!Number.isInteger(columns)||!Number.isInteger(rows)||columns<1||rows<1||image.width<columns||image.height<rows)throw Error('Imagem ou grade inválida.');
 }
 function bounds(image,rect,threshold=0){
  let x1=rect.x+rect.width,y1=rect.y+rect.height,x2=-1,y2=-1;
  for(let y=rect.y;y<rect.y+rect.height;y++)for(let x=rect.x;x<rect.x+rect.width;x++)if(image.data[(y*image.width+x)*4+3]>threshold){x1=Math.min(x1,x);y1=Math.min(y1,y);x2=Math.max(x2,x);y2=Math.max(y2,y);}
  return x2<0?null:{x:x1,y:y1,width:x2-x1+1,height:y2-y1+1};
 }
 // Search near each nominal cut for the least occupied seam. Prefer a clear
 // gutter, then distance to the original grid; never assume equal art spacing.
 function cut(expected,radius,limit,occupancy){
  let best=Math.round(expected),score=Infinity,distance=Infinity;
  for(let p=Math.max(1,Math.floor(expected-radius));p<=Math.min(limit-1,Math.ceil(expected+radius));p++){
   const n=occupancy(p-1)+occupancy(p),d=Math.abs(p-expected);
   if(n<score||n===score&&d<distance){best=p;score=n;distance=d;}
  }
  return {position:best,occupied:score>0};
 }
 function islands(image,columns,rows,threshold){
  const seen=new Uint8Array(image.width*image.height),parts=Array.from({length:columns*rows},()=>[]);
  for(let start=0;start<seen.length;start++){
   if(seen[start]||image.data[start*4+3]<=threshold)continue;
   const pixels=[start];seen[start]=1;let left=image.width,top=image.height,right=0,bottom=0;
   for(let i=0;i<pixels.length;i++){
    const x=pixels[i]%image.width,y=Math.floor(pixels[i]/image.width);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
     const nx=x+dx,ny=y+dy,next=ny*image.width+nx;
     if(nx<0||ny<0||nx>=image.width||ny>=image.height||seen[next]||image.data[next*4+3]<=threshold)continue;
     seen[next]=1;pixels.push(next);
    }
   }
   const col=Math.min(columns-1,Math.floor((left+right+1)/2/image.width*columns)),row=Math.min(rows-1,Math.floor((top+bottom+1)/2/image.height*rows));
   parts[row*columns+col].push({rect:{x:left,y:top,width:right-left+1,height:bottom-top+1},pixels});
  }
  const rects=[],masks=[],warnings=[];
  parts.forEach((list,index)=>{
   list.sort((a,b)=>b.pixels.length-a.pixels.length);
   if(!list.length){rects.push({x:index%columns*Math.floor(image.width/columns),y:Math.floor(index/columns)*Math.floor(image.height/rows),width:1,height:1});masks.push(new Set());warnings.push({index,reason:'empty'});return;}
   rects.push(list[0].rect);masks.push(new Set(list[0].pixels));
   if(list.length>1)warnings.push({index,reason:'detached',discardedPixels:list.slice(1).reduce((n,p)=>n+p.pixels.length,0)});
  });
  return {rects,masks,warnings};
 }
 function detect(image,columns,rows,{threshold=0,isolate=false}={}){
  if(isolate){validate(image,columns,rows);return islands(image,columns,rows,threshold);}
  validate(image,columns,rows);const rects=[],warnings=[];
  const visible=(x,y)=>image.data[(y*image.width+x)*4+3]>threshold;
  for(let col=0;col<columns;col++){
   const left=Math.round(col*image.width/columns),right=Math.round((col+1)*image.width/columns),counts=new Uint32Array(image.height);
   for(let y=0;y<image.height;y++)for(let x=left;x<right;x++)if(visible(x,y))counts[y]++;
   const cuts=[0];for(let row=1;row<rows;row++){const seam=cut(row*image.height/rows,image.height/rows*.35,image.height,y=>counts[y]);cuts.push(seam.position);if(seam.occupied)warnings.push({column:col,row,axis:'y'});}cuts.push(image.height);
   for(let row=0;row<rows;row++)rects[row*columns+col]={x:left,y:cuts[row],width:right-left,height:cuts[row+1]-cuts[row]};
  }
  return {rects,warnings};
 }
 function repack(image,columns,rows,{rects,masks,cellWidth=Math.floor(image.width/columns),cellHeight=Math.floor(image.height/rows),padding=2,threshold=0,allowUpscale=false,isolate=false}={}){
  validate(image,columns,rows);
  if(!Number.isInteger(cellWidth)||!Number.isInteger(cellHeight)||cellWidth<3||cellHeight<3||!Number.isInteger(padding)||padding<1||padding*2>=Math.min(cellWidth,cellHeight))throw Error('Célula ou margem inválida.');
  if(columns*cellWidth*rows*cellHeight>16777216)throw Error('A folha corrigida excede 16 milhões de pixels.');
  const detected=rects?{rects,masks,warnings:[]}:detect(image,columns,rows,{threshold,isolate});
  if(detected.rects.length!==columns*rows)throw Error('Informe um recorte para cada quadro.');
  const frames=detected.rects.map((rect,index)=>{
   if(![rect.x,rect.y,rect.width,rect.height].every(Number.isInteger)||rect.x<0||rect.y<0||rect.width<1||rect.height<1||rect.x+rect.width>image.width||rect.y+rect.height>image.height)throw Error('Recorte fora da imagem.');
   return detected.masks?.[index]?.size===0?null:bounds(image,rect,threshold);
  });
  const filled=frames.filter(Boolean),scale=Math.min(allowUpscale?Infinity:1,...filled.flatMap(b=>[(cellWidth-padding*2)/b.width,(cellHeight-padding*2)/b.height]));
  const width=columns*cellWidth,height=rows*cellHeight,data=new Uint8ClampedArray(width*height*4),metrics=[];
  frames.forEach((b,index)=>{
   if(!b){metrics.push({index,empty:true});return;}
   const w=Math.max(1,Math.round(b.width*scale)),h=Math.max(1,Math.round(b.height*scale)),x=index%columns*cellWidth+Math.floor((cellWidth-w)/2),y=Math.floor(index/columns)*cellHeight+cellHeight-padding-h;
   for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++){
    const sx=b.x+Math.min(b.width-1,Math.floor((dx+.5)*b.width/w)),sy=b.y+Math.min(b.height-1,Math.floor((dy+.5)*b.height/h)),from=(sy*image.width+sx)*4,to=((y+dy)*width+x+dx)*4;
    if(image.data[from+3]>threshold&&(!detected.masks?.[index]||detected.masks[index].has(sy*image.width+sx)))data.set(image.data.subarray(from,from+4),to);
   }
   metrics.push({index,source:b,x,y,width:w,height:h});
  });
  return {width,height,data,rects:detected.rects,warnings:detected.warnings,metrics,scale};
 }
 const api={bounds,detect,repack};root.DianaSpriteRepair=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
