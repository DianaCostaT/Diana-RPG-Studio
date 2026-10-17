/* Classic, paged 2D battle authoring over the shared Reactor data contract. */
(function(root){
 'use strict';
 const defaults=[['idle','Normal (parado)'],['attack','Ataque — mão direita'],['attackLeft','Ataque — mão esquerda'],['skill','Habilidade'],['dead','Nocaute'],['damage','Dano'],['abnormal','Estado alterado'],['guard','Defesa'],['walk','Caminhar — esquerda'],['walkRight','Caminhar — direita'],['victory','Vitória'],['item','Item']];
 const poseNames=graphic=>[...new Set([...defaults.map(([id])=>id),...Object.keys(graphic?.poses||{}),...Object.keys(graphic?.spriteAnimation?.animations||{}),...Object.keys(graphic?.poseSounds||{})])];
 const label=id=>defaults.find(row=>row[0]===id)?.[1]||id;
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const button=(text,fn)=>{const b=el('button','diana-maker-button',text);b.type='button';b.onclick=fn;return b;};
 const copy=value=>JSON.parse(JSON.stringify(value));
 // Authoring shortcuts only: saved data remains native BattleData steps.
 function studioSteps(){return [
  ['POSE','pose','Fixar quadro',{operation:'hold',motion:'idle',frame:1}],
  ['MOVE','move','Mover',{duration:30,easing:'smooth'}],
  ['WAIT','wait','Esperar',{duration:20}],
  ['ATTACK','motion','Animar ataque',{motion:'attack',duration:20}],
  ['PROJECTILE','projectile','Projétil',{}],
  ['EFFECT','animation','Efeito visual',{}],
  ['DAMAGE','impact','Aplicar ação',{role:'allTargets'}],
  ['CAMERA','camera','Câmera',{}],['SOUND','sound','Som',{}],
  ['SHAKE','shake','Tremor',{}],['FLASH','flash','Flash',{}],
  ['RETURN','move','Retornar à origem',{anchor:'home',duration:30,easing:'smooth'}],
  ['STATE','state','Alterar estado',{}],
  ['VICTORY','motion','Animar vitória',{motion:'victory',duration:30}],
  ['DEATH','motion','Animar nocaute',{motion:'dead',duration:30}]
 ].map(([id,value,label,extra])=>({key:'studio:'+id,value,label:id+' — '+label,extra,raw:true,
  hint:id==='ATTACK'?'Apresentação do ataque. Insira DAMAGE no instante do impacto para aplicar a ação uma vez.':id==='DAMAGE'?'Aplica dano e efeitos da habilidade ou item pelas regras do jogo.':id==='VICTORY'||id==='DEATH'?'Animação do combatente; não altera HP nem encerra a batalha.':undefined}));}
 const defaultGrid=()=>({version:1,columns:3,rows:4,anchor:{x:.5,y:1},animations:{idle:{frames:[0],speed:12,loop:true}}});
 const SpriteSheetTools={
  analyze(imageData,columns,rows,threshold=0){
   const {width,height,data}=imageData||{};
   if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||!data||data.length!==width*height*4||!Number.isInteger(columns)||!Number.isInteger(rows)||columns<1||rows<1||columns>width||rows>height)throw new Error('Folha ou grade inválida.');
   const cells=[];
   const visible=(x,y)=>x>=0&&y>=0&&x<width&&y<height&&data[(y*width+x)*4+3]>threshold;
   for(let index=0;index<columns*rows;index++){
    const column=index%columns,row=Math.floor(index/columns),x=Math.floor(column*width/columns),y=Math.floor(row*height/rows),right=Math.floor((column+1)*width/columns),bottom=Math.floor((row+1)*height/rows);
    let left=right,top=bottom,maxX=x-1,maxY=y-1;
    for(let py=y;py<bottom;py++)for(let px=x;px<right;px++)if(data[(py*width+px)*4+3]>threshold){left=Math.min(left,px);top=Math.min(top,py);maxX=Math.max(maxX,px);maxY=Math.max(maxY,py);}
    const cellWidth=right-x,cellHeight=bottom-y,bounds=maxX<x?null:{x:left,y:top,width:maxX-left+1,height:maxY-top+1};
    const touches={left:!!bounds&&left===x,right:!!bounds&&maxX===right-1,top:!!bounds&&top===y,bottom:!!bounds&&maxY===bottom-1};
    const seam=[];
    if(touches.left&&column>0)for(let py=top;py<=maxY;py++)if(visible(x,py)&&visible(x-1,py)){seam.push('left');break;}
    if(touches.right&&column+1<columns)for(let py=top;py<=maxY;py++)if(visible(right-1,py)&&visible(right,py)){seam.push('right');break;}
    if(touches.top&&row>0)for(let px=left;px<=maxX;px++)if(visible(px,y)&&visible(px,y-1)){seam.push('top');break;}
    if(touches.bottom&&row+1<rows)for(let px=left;px<=maxX;px++)if(visible(px,bottom-1)&&visible(px,bottom)){seam.push('bottom');break;}
    cells.push({index,x,y,width:cellWidth,height:cellHeight,empty:!bounds,solid:!!bounds&&bounds.width===cellWidth&&bounds.height===cellHeight,bounds,touches,seam:[...new Set(seam)],ambiguous:seam.length>0});
   }
   return cells;
  },
  cleanEdges(imageData,columns,rows){
   const cells=this.analyze(imageData,columns,rows),{width,height,data}=imageData,output=new Uint8ClampedArray(data),removedCells=[];
   for(const cell of cells){
    if(cell.empty||cell.solid)continue;
    const seen=new Set(),parts=[];
    for(let y=cell.y;y<cell.y+cell.height;y++)for(let x=cell.x;x<cell.x+cell.width;x++){
     const start=y*width+x;if(seen.has(start)||!data[start*4+3])continue;
     const pixels=[start];seen.add(start);let edge=false;
     for(let i=0;i<pixels.length;i++){const point=pixels[i],px=point%width,py=Math.floor(point/width);edge ||= px===cell.x||px===cell.x+cell.width-1||py===cell.y||py===cell.y+cell.height-1;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=px+dx,ny=py+dy,next=ny*width+nx;if(nx<cell.x||nx>=cell.x+cell.width||ny<cell.y||ny>=cell.y+cell.height||seen.has(next)||!data[next*4+3])continue;seen.add(next);pixels.push(next);}
     }parts.push({pixels,edge});
    }
    parts.sort((a,b)=>b.pixels.length-a.pixels.length);let removed=false;
    for(const part of parts.slice(1))if(part.edge&&part.pixels.length<parts[0].pixels.length*.25){for(const pixel of part.pixels)output.fill(0,pixel*4,pixel*4+4);removed=true;}
    if(removed)removedCells.push(cell.index);
   }
   return {width,height,data:output,removedCells};
  },
  center(imageData,columns,rows,padding=2,threshold=0){
   const cells=this.analyze(imageData,columns,rows,threshold),{width,height,data}=imageData,output=new Uint8ClampedArray(data.length),moves=[];
   if(!Number.isInteger(padding)||padding<0)throw new Error('Margem inválida.');
   const skipped=[];
   // One reduction for the complete sheet prevents size changes between poses.
   const sharedScale=Math.min(1,...cells.filter(cell=>!cell.empty&&!cell.solid&&!cell.ambiguous).map(cell=>{const margin=Math.min(padding,Math.floor((Math.min(cell.width,cell.height)-1)/2));return Math.min(Math.max(1,cell.width-margin*2)/cell.bounds.width,Math.max(1,cell.height-margin*2)/cell.bounds.height);}));
   for(const cell of cells){if(cell.empty)continue;if(cell.solid||cell.ambiguous){for(let py=cell.y;py<cell.y+cell.height;py++)for(let px=cell.x;px<cell.x+cell.width;px++){const i=(py*width+px)*4;output.set(data.subarray(i,i+4),i);}skipped.push(cell.index);continue;}const b=cell.bounds,margin=Math.min(padding,Math.floor((Math.min(cell.width,cell.height)-1)/2)),maxWidth=Math.max(1,cell.width-margin*2),maxHeight=Math.max(1,cell.height-margin*2),scale=sharedScale,dw=Math.max(1,Math.floor(b.width*scale)),dh=Math.max(1,Math.floor(b.height*scale)),dx=cell.x+Math.floor((cell.width-dw)/2),dy=cell.y+cell.height-margin-dh;
    for(let py=0;py<dh;py++)for(let px=0;px<dw;px++){const sx=b.x+Math.min(b.width-1,Math.floor(px/scale)),sy=b.y+Math.min(b.height-1,Math.floor(py/scale)),from=(sy*width+sx)*4,to=((dy+py)*width+dx+px)*4;output[to]=data[from];output[to+1]=data[from+1];output[to+2]=data[from+2];output[to+3]=data[from+3];}
    const changed=dx!==b.x||dy!==b.y||dw!==b.width||dh!==b.height;if(changed)moves.push(cell.index);
   }
   return {width,height,data:output,cells,moved:moves.length,movedCells:moves,skippedCells:skipped,sharedScale,alignedCells:this.analyze({width,height,data:output},columns,rows,threshold)};
  }
 };
 async function saveAlignedSheet(blob,{projectRoot,folder,name}){
  if(!blob||!projectRoot||!name)throw new Error('Não foi possível identificar a imagem ou o projeto aberto.');
  const path=require('path'),fs=require('fs'),safeFolder=String(folder||'characters').replaceAll('\\','/');
  if(safeFolder.split('/').some(part=>!part||part==='.'||part==='..'))throw new Error('A pasta do sprite não é válida.');
  const directory=path.join(projectRoot,'img',safeFolder),rawName=String(name),marker=/^[!$]/.test(rawName)?rawName[0]:'',stem=marker+rawName.slice(marker?1:0).replace(/[^\p{L}\p{N}_-]+/gu,'_').replace(/^_+|_+$/g,'')||'Sprite';let outputName=`${stem}_centralizado`,target=path.join(directory,outputName+'.png'),suffix=2;
  while(fs.existsSync(target)){outputName=`${stem}_centralizado_${suffix++}`;target=path.join(directory,outputName+'.png');}
  const bytes=new Uint8Array(await blob.arrayBuffer());
  if(root.RPGReactorHost?.saveFile)await root.RPGReactorHost.saveFile({data:bytes,projectPath:target,mimeType:'image/png'});
  else{fs.mkdirSync(directory,{recursive:true});if(root.RRWriteFileAtomicSync)root.RRWriteFileAtomicSync(fs,target,bytes);else fs.writeFileSync(target,bytes);}
  return outputName;
 }
 function animationFrameAt(animation,ticks){
  const frames=animation?.frames||[],speed=Number(animation?.speed);
  if(!frames.length||!Number.isFinite(speed)||speed<=0)return {index:0,position:0};
  const step=Math.floor(Math.max(0,Number(ticks)||0)/speed),position=animation.loop===true?step%frames.length:Math.min(frames.length-1,step);
  return {index:frames[position],position};
 }
 class SpriteComposer{
  static mount(host,{value,onchange,image,motions=[],onSaveImage}={}){
   let grid=copy(value||defaultGrid()),selected=Object.keys(grid.animations)[0]||'idle',previewTick=0,raf=0,stopped=false,workingImage=image,alignedCanvas=null,alignment=null,cleanFragments=false;
   let playing=true,lastTime=null,previewBackground='checker',compareOriginal=false,sequencePosition=0,previousGrid=JSON.stringify(grid),undoControl,redoControl;
   const past=[],future=[];
   const commit=()=>{const next=JSON.stringify(grid);if(next!==previousGrid){past.push(previousGrid);if(past.length>40)past.shift();future.length=0;previousGrid=next;}if(undoControl)undoControl.disabled=!past.length;if(redoControl)redoControl.disabled=!future.length;onchange?.(copy(grid));};
   const restore=(from,to)=>{if(!from.length)return;to.push(JSON.stringify(grid));const next=JSON.parse(from.pop());if(next.columns!==grid.columns||next.rows!==grid.rows)resetAlignment();grid=next;previousGrid=JSON.stringify(grid);if(!Object.hasOwn(grid.animations,selected))selected=Object.keys(grid.animations)[0];previewTick=0;render();onchange?.(copy(grid));};
   const animation=()=>grid.animations[selected];
   const resetAlignment=()=>{workingImage=image;alignedCanvas=null;alignment=null;};
   const canvas=el('canvas','diana-grid-preview');canvas.width=288;canvas.height=192;
   const drawPreview=()=>{const {index:cell}=animationFrameAt(animation(),previewTick),c=canvas.getContext?.('2d');if(!c)return;c.clearRect(0,0,canvas.width,canvas.height);c.fillStyle=previewBackground==='light'?'#f4f1e9':'#18232f';c.fillRect(0,0,canvas.width,canvas.height);if(previewBackground==='checker'){c.fillStyle='#405064';for(let y=0;y<canvas.height;y+=16)for(let x=0;x<canvas.width;x+=16)if((x/16+y/16)%2===0)c.fillRect(x,y,16,16);}const source=compareOriginal?image:workingImage,anchor=grid.anchor||{x:.5,y:1},ax=Number.isFinite(anchor.x)?Math.max(0,Math.min(1,anchor.x)):.5,ay=Number.isFinite(anchor.y)?Math.max(0,Math.min(1,anchor.y)):1,px=canvas.width/2,py=canvas.height-18;if(source?.width&&source?.height){const w=source.width/grid.columns,h=source.height/grid.rows,x=cell%grid.columns*w,y=Math.floor(cell/grid.columns)*h,s=Math.min(4,ax?(px-8)/(w*ax):Infinity,ax<1?(canvas.width-px-8)/(w*(1-ax)):Infinity,ay?(py-8)/(h*ay):Infinity,ay<1?(canvas.height-py-8)/(h*(1-ay)):Infinity);c.imageSmoothingEnabled=false;c.drawImage(source,x,y,w,h,px-w*s*ax,py-h*s*ay,w*s,h*s);}c.strokeStyle='rgba(239,207,139,.9)';c.setLineDash?.([4,4]);c.beginPath?.();c.moveTo(px,8);c.lineTo(px,canvas.height-4);c.moveTo(8,py);c.lineTo(canvas.width-8,py);c.stroke?.();c.setLineDash?.([]);};
   const tick=timestamp=>{if(stopped)return;if(Number.isFinite(timestamp)){if(lastTime!==null&&playing)previewTick+=Math.max(0,Math.min(250,timestamp-lastTime))*60/1000;lastTime=timestamp;}drawPreview();raf=requestAnimationFrame(tick);};
   const field=(labelText,value,change,min,max,step=1)=>{const input=el('input','database-field-value');input.type='number';input.min=min;input.max=max;input.step=step;input.value=value;input.onchange=()=>{const n=input.valueAsNumber;if(Number.isFinite(n)&&n>=min&&n<=max){change(n);input.setCustomValidity('');}else{input.setCustomValidity('Informe um valor válido.');input.reportValidity?.();}};const row=el('label','diana-classic-field');row.append(el('span','',labelText),input);return row;};
   const render=()=>{host.replaceChildren();const controls=el('div','diana-grid-controls');host.append(controls);
    controls.append(field('Colunas',grid.columns,n=>{grid.columns=Math.floor(n);resetAlignment();render();commit();},1,99),field('Linhas',grid.rows,n=>{grid.rows=Math.floor(n);resetAlignment();render();commit();},1,99),field('Âncora X',grid.anchor?.x??.5,n=>{grid.anchor={...grid.anchor,x:n};commit();},0,1,.05),field('Âncora Y',grid.anchor?.y??1,n=>{grid.anchor={...grid.anchor,y:n};commit();},0,1,.05));
    const name=el('input','database-field-value');name.placeholder='Nova animação';name.setAttribute('aria-label','Nova animação');
    controls.append(name,button('Adicionar animação',()=>{const key=name.value.trim();if(key&&!['__proto__','constructor','prototype'].includes(key)&&!Object.hasOwn(grid.animations,key)){grid.animations[key]={frames:[],speed:12,loop:true};selected=key;previewTick=0;render();commit();}}));
    const names=[...new Set([...Object.keys(grid.animations),...motions])];const choose=el('select','database-field-value');choose.setAttribute('aria-label','Animação');for(const key of names){const option=el('option','',key);option.value=key;choose.append(option);}choose.value=selected;choose.onchange=()=>{selected=choose.value;if(!Object.hasOwn(grid.animations,selected)){Object.defineProperty(grid.animations,selected,{value:{frames:[],speed:12,loop:true},enumerable:true,writable:true,configurable:true});commit();}previewTick=0;sequencePosition=0;render();};controls.append(choose);
    const a=animation();controls.append(field('Velocidade (quadros)',a.speed,n=>{a.speed=Math.floor(n);commit();},1,999),select([[true,'Repetir'],[false,'Parar no último'],['once','Uma vez']],String(a.loop),v=>{a.loop=v==='true'?true:v==='false'?false:'once';commit();}));
   const actions=el('div','diana-grid-actions');if(workingImage?.width&&workingImage?.height){
    const scanCanvas=el('canvas','');scanCanvas.width=workingImage.width;scanCanvas.height=workingImage.height;const scanContext=scanCanvas.getContext('2d');scanContext.drawImage(workingImage,0,0);
    const sourceCells=alignment?.cells||SpriteSheetTools.analyze(scanContext.getImageData(0,0,scanCanvas.width,scanCanvas.height),grid.columns,grid.rows),edgeSpills=sourceCells.filter(cell=>cell.ambiguous).length,solid=sourceCells.filter(cell=>cell.solid).length,empty=sourceCells.filter(cell=>cell.empty).length,adjustable=sourceCells.filter(cell=>!cell.ambiguous&&!cell.solid&&!cell.empty).length;
    const scan=el('div','diana-grid-diagnostics');scan.append(el('strong','','Raio-X da folha'),el('span','',`${adjustable} quadros alinháveis`),el('span','',`${edgeSpills} junções entre células`),el('span','',`${solid} quadros opacos preservados`),el('span','',`${empty} vazios`));actions.append(scan);
    const cleanup=el('input','');cleanup.type='checkbox';cleanup.checked=cleanFragments;cleanup.onchange=()=>{cleanFragments=cleanup.checked;};const cleanupLabel=el('label','diana-classic-field');cleanupLabel.append(cleanup,el('span','','Remover fragmentos pequenos e soltos nas bordas (revise armas e efeitos)'));actions.append(cleanupLabel);
    actions.append(button(alignment?'Recalcular alinhamento':'Centralizar e proteger quadros',()=>{try{if(!alignedCanvas){alignedCanvas=el('canvas','');alignedCanvas.width=workingImage.width;alignedCanvas.height=workingImage.height;const context=alignedCanvas.getContext('2d');context.imageSmoothingEnabled=false;context.drawImage(workingImage,0,0);}const context=alignedCanvas.getContext('2d'),pixels=context.getImageData(0,0,alignedCanvas.width,alignedCanvas.height),cellWidth=alignedCanvas.width/grid.columns,cellHeight=alignedCanvas.height/grid.rows,padding=Math.max(2,Math.ceil(Math.min(cellWidth,cellHeight)*.06)),cleaned=cleanFragments?SpriteSheetTools.cleanEdges(pixels,grid.columns,grid.rows):pixels,result=SpriteSheetTools.center(cleaned,grid.columns,grid.rows,padding);result.removedCells=cleaned.removedCells||[];pixels.data.set(result.data);context.putImageData(pixels,0,0);workingImage=alignedCanvas;alignment=result;previewTick=0;render();}catch(error){root.RRDialog?.alert?.(error.message,{title:'Centralizar sprites',kind:'warning'});}}));
    if(alignment)actions.append(button('Restaurar folha original',()=>{resetAlignment();previewTick=0;render();}));
    if(onSaveImage){const save=button('Salvar folha corrigida no projeto',async()=>{if(!alignedCanvas)return;save.disabled=true;try{const blob=await new Promise(resolve=>alignedCanvas.toBlob(resolve,'image/png'));await onSaveImage(blob,alignment);save.dataset.saved='true';save.textContent='Folha corrigida salva';}catch(error){root.RRDialog?.alert?.(error.message||'Não foi possível salvar a folha.',{title:'Salvar folha',kind:'error'});}finally{save.disabled=false;}});save.disabled=!alignedCanvas;actions.append(save);}
    if(alignment)actions.append(el('small','diana-grid-result',`${alignment.moved} quadros alinhados · ${alignment.skippedCells.length} preservados por segurança · margem mínima de 6% · cores originais, sem suavização.`));
   }host.append(actions);
   const sheet=el('div','diana-grid-sheet');sheet.style.gridTemplateColumns=`repeat(${grid.columns}, 64px)`;for(let index=0;index<grid.columns*grid.rows;index++){const position=a.frames.indexOf(index),cell=button('',()=>{const frame=animation().frames,selectedAt=frame.indexOf(index);if(selectedAt<0)frame.push(index);else for(let i=frame.length-1;i>=0;i--)if(frame[i]===index)frame.splice(i,1);previewTick=0;render();commit();});cell.className='diana-grid-cell';cell.dataset.dianaGridCell=String(index);cell.dataset.selected=String(position>=0);cell.setAttribute('aria-pressed',String(position>=0));cell.setAttribute('aria-label',position>=0?`Remover quadro ${index+1} da animação`:`Selecionar quadro ${index+1} para a animação`);cell.title=position>=0?`Quadro ${index+1} · ordem ${position+1}`:`Quadro ${index+1}`;if(workingImage?.width&&workingImage?.height){const thumb=el('canvas','diana-grid-cell-thumb');thumb.width=60;thumb.height=60;const c=thumb.getContext?.('2d'),w=workingImage.width/grid.columns,h=workingImage.height/grid.rows;if(c){const scale=Math.min(60/w,60/h);c.imageSmoothingEnabled=false;c.drawImage(workingImage,index%grid.columns*w,Math.floor(index/grid.columns)*h,w,h,(60-w*scale)/2,(60-h*scale)/2,w*scale,h*scale);}cell.append(thumb);}else cell.textContent=String(index+1);if(position>=0)cell.append(el('span','diana-grid-order',String(position+1)));sheet.append(cell);}host.append(sheet);
    const selection=el('div','diana-grid-selection');selection.setAttribute('aria-label','Ordem da animação, definida pelos cliques na folha');selection.append(el('span','',a.frames.length?`${a.frames.length} quadros · ordem dos cliques`:'Clique nos quadros na ordem em que devem tocar.'));selection.append(button('Desfazer clique',()=>{if(a.frames.length){a.frames.pop();previewTick=0;render();commit();}}),button('Limpar seleção',()=>{if(a.frames.length){a.frames=[];previewTick=0;render();commit();}}));host.append(selection,canvas);drawPreview();
    const review=el('div','diana-art-review-controls');
    review.append(select([['checker','Fundo quadriculado'],['light','Fundo claro'],['dark','Fundo escuro']],previewBackground,v=>{previewBackground=v;drawPreview();}));
    review.children[0].setAttribute('aria-label','Fundo da revisão de transparência');
    const compare=el('input','');compare.type='checkbox';compare.checked=compareOriginal;compare.onchange=()=>{compareOriginal=compare.checked;drawPreview();};const compareLabel=el('label','diana-classic-field');compareLabel.append(compare,el('span','','Comparar com a folha original'));review.append(compareLabel);
    review.append(button(playing?'Pausar prévia':'Reproduzir prévia',()=>{playing=!playing;render();}),button('Quadro anterior',()=>{playing=false;const a=animation(),n=a.frames.length;if(n){const p=animationFrameAt(a,previewTick).position;previewTick=Math.max(0,p-1)*a.speed;}render();}),button('Próximo quadro',()=>{playing=false;const a=animation(),n=a.frames.length;if(n){const p=animationFrameAt(a,previewTick).position;previewTick=Math.min(n-1,p+1)*a.speed;}render();}));
    undoControl=button('Desfazer sequência',()=>restore(past,future));undoControl.disabled=!past.length;redoControl=button('Refazer sequência',()=>restore(future,past));redoControl.disabled=!future.length;review.append(undoControl,redoControl);
    const order=el('div','diana-sequence-order');const aSequence=animation();
    if(aSequence.frames.length){sequencePosition=Math.min(sequencePosition,aSequence.frames.length-1);const position=el('select','database-field-value');position.setAttribute('aria-label','Passo da sequência');aSequence.frames.forEach((frame,i)=>{const o=el('option','',`${i+1} · quadro ${frame+1}`);o.value=i;position.append(o);});position.value=sequencePosition;position.onchange=()=>{sequencePosition=Number(position.value);};order.append(position);
     const move=delta=>{const next=sequencePosition+delta;if(next<0||next>=aSequence.frames.length)return;[aSequence.frames[sequencePosition],aSequence.frames[next]]=[aSequence.frames[next],aSequence.frames[sequencePosition]];sequencePosition=next;previewTick=0;render();commit();};
     order.append(button('Mover antes',()=>move(-1)),button('Mover depois',()=>move(1)),button('Repetir quadro',()=>{aSequence.frames.splice(sequencePosition+1,0,aSequence.frames[sequencePosition]);sequencePosition++;render();commit();}),button('Remover passo',()=>{aSequence.frames.splice(sequencePosition,1);previewTick=0;render();commit();}));
    }
    host.append(order,review,el('small','diana-help','A cruz marca a âncora usada pelo jogo. A prévia usa 60 quadros lógicos por segundo; fundo, pausa e comparação não alteram o projeto. Desfazer sequência não desfaz arquivos salvos.'));
   };render();raf=requestAnimationFrame(tick);return {get value(){return copy(grid);},dispose(){stopped=true;cancelAnimationFrame(raf);}};
  }
  static open({title='Compor animação por grade',...options}={}){
   const overlay=el('div','rr-modal-overlay diana-grid-modal'),modal=el('div','rr-modal');overlay.append(modal);modal.append(el('div','rr-modal-header',title));const body=el('div','rr-modal-body');modal.append(body);document.body.append(overlay);const composer=SpriteComposer.mount(body,options);const close=()=>{composer.dispose();overlay.remove();};const footer=el('div','rr-modal-footer');footer.append(button('Fechar',close));modal.append(footer);return composer;
  }
 }
 function field(host,title,input){const row=el('label','diana-classic-field');row.append(el('span','',title),input);host.append(row);return input;}
 function select(values,value,change){const s=el('select','database-field-value');for(const [id,text] of values){const o=el('option','',text);o.value=id;s.append(o);}s.value=value;s.onchange=()=>change(s.value);return s;}
 function number(host,title,value,change,min=0,max=816){const n=el('input','database-field-value');n.type='number';n.step=1;n.min=min;n.max=max;n.value=value;n.onchange=()=>{const v=n.valueAsNumber;if(Number.isInteger(v)&&v>=min&&v<=max){n.setCustomValidity('');change(v);}else{n.setCustomValidity(`Informe um inteiro entre ${min} e ${max}.`);n.reportValidity();}};return field(host,title,n);}
 function install(){
  if(typeof DatabaseActionSequenceEditor!=='undefined'){
   const sequence=DatabaseActionSequenceEditor.prototype;
   if(!sequence._luaeStudioSteps){const groups=sequence.stepGroups;sequence.stepGroups=function(){return [['Battle Studio',studioSteps()],...groups.call(this)];};sequence._luaeStudioSteps=true;}
  }
  const proto=DatabaseEditorUI.prototype,nav=proto.setupDatabaseNavigation,open=proto.openDatabase;
  proto.setupDatabaseNavigation=function(){nav.call(this);const host=document.getElementById('database-navigation');
   for(const [type,title] of [['dianaPoses','Animações 2 — Poses'],['dianaBattleScreen','Tela de batalha']]){const tab=el('div','database-nav-item',title);tab.dataset.type=type;tab.onclick=()=>this.openDatabase(type);host.append(tab);}
   host.setAttribute('aria-orientation','horizontal');
   root.RRKeyboardNavigation?.roving(host,{orientation:'horizontal',items:()=>[...host.querySelectorAll('.database-nav-item')].filter(n=>getComputedStyle(n).display!=='none'),isSelected:n=>n.classList.contains('active'),select:n=>this.openDatabase(n.dataset.type)});
  };
  proto.openDatabase=function(type,...args){
   if(!['dianaPoses','dianaBattleScreen'].includes(type))return open.call(this,type,...args);
   if(!this.currentProject||this._databaseSaveInFlight)return;
   const models=this.reactor3dEditor;if(models?._detail&&models.hasPending?.()){models.settlePending().then(go=>{if(go)this.openDatabase(type,...args);});return;}
   this._listGeneration++;this._activeDatabaseList=null;
   const {detailEl}=this.prepareDatabaseSection(type,type==='dianaPoses'?'Animações 2 — Poses de combate':'Tela de batalha 2D',{showListPanel:false});
   detailEl.style.overflowY='auto';
   const view=new Battle2D(this,detailEl);this._detailCleanups||=[];this._detailCleanups.push(()=>view.dispose());
   if(type==='dianaPoses')view.poses();else view.screen();
  };
  installMapComposer();
 }
 function installMapComposer(){
  if(typeof CharacterGraphicPicker==='undefined'||CharacterGraphicPicker.prototype._dianaGridComposer)return;
  const create=CharacterGraphicPicker.prototype.createSheet;
  CharacterGraphicPicker.prototype.createSheet=function(image,layout){
   const sheet=create.call(this,image,layout),picker=this;
   const action=button('Compor animação por grade…',()=>{
    const system=window.reactor?.databaseManager?.data?.system;
    if(!system||!picker._file)return;
    const library=system.dianaSpriteAnimations||={version:1,characters:{}};
    const current=library.characters[picker._file]||{version:1,columns:layout.columns,rows:layout.rows,anchor:{x:.5,y:1},animations:{walk:{frames:[0],speed:12,loop:true}}};
    SpriteComposer.open({title:'Compor caminhada no mapa',value:current,image,motions:['walk'],onchange:value=>{library.characters[picker._file]=value;system.dianaSpriteAnimations=library;window.reactor?.updateStatus?.('Animação de mapa modificada');},onSaveImage:async(blob)=>{const name=await saveAlignedSheet(blob,{projectRoot:picker.currentProject.path,folder:'characters',name:picker._file});window.reactor?.updateStatus?.('Folha centralizada salva como '+name+'.png; selecione-a na lista para usar.');}});
   });action.className='rr-btn-secondary diana-map-grid-composer';
   requestAnimationFrame(()=>{if(picker._parts?.sheet===sheet&&sheet.isConnected)picker._parts.sheetBox.append(action,button('Corrigir folha de sprites?',()=>root.DianaSpriteRepairUI?.open(window.reactor,{folder:'characters',name:picker._file})));});
   return sheet;
  };
  CharacterGraphicPicker.prototype._dianaGridComposer=true;
 }
 class Battle2D{
  constructor(parent,host){this.parent=parent;this.host=host;this.db=parent.databaseManager;this.presentation=parent.battlePresentationEditor;this.images=new Map();this.previews=[];this.dead=false;this.raf=0;this.speed=1;
   this.visibility=()=>{if(document.hidden){cancelAnimationFrame(this.raf);this.raf=0;}else if(this.previews.length)this.animate();};document.addEventListener('visibilitychange',this.visibility);
  }
  changed(){this.db.mutationGeneration++;this.parent.updateStatus('Modificado');}
  settings(){return this.db.data.battlePresentation||=ReactorBattleData.empty();}
  graphic(kind,id){return ReactorBattleData.graphic(this.settings(),kind,id,this.db.data[kind][id]);}
  setGraphic(kind,id,patch){const s=this.settings();s[kind]||={};s[kind][id]={...s[kind][id],graphic:{...s[kind][id]?.graphic,...patch}};this.changed();}
  async image(g){if(!g.name||g.type==='model')return null;const path=require('path'),url=RRAssetFiles.urlFor(path.join(this.parent.currentProject.path,'img',g.folder),g.name,['.png']);
   if(!this.images.has(url))this.images.set(url,new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=url;}));return this.images.get(url);
  }
  preview(canvas,g,motion,kind){const record=this.db.data[kind]?.[this.previewRecordId],armors=kind==='actors'?(record?.equips||[]).slice(1).map(id=>this.db.data.armors?.[id]).filter(Boolean):[];g=ReactorBattleData.motionGraphic(g,motion,armors);const item={canvas,g,motion,kind,image:null};this.previews.push(item);this.image(g).then(img=>{if(!this.dead&&canvas.isConnected)item.image=img;});}
  soundControls(card,kind,id,name,g){
   const path=require('path'),folder=path.join(this.parent.currentProject.path,'audio','se'),extensions=RRAssetFiles.AUDIO_EXTENSIONS;
   const files=RRAssetFiles.listNames(folder,extensions),current=g.poseSounds?.[name]||{name:'',volume:90,pitch:100,pan:0};
   let sound={...current};const persist=()=>{this.setGraphic(kind,id,{poseSounds:{...this.settings()[kind]?.[id]?.graphic?.poseSounds,[name]:{...sound}}});};
   if(current.name&&!files.includes(current.name))files.push(current.name);
   const picker=select([['','Sem som'],...files.map(file=>[file,file])],current.name,value=>{sound.name=value;persist();play.disabled=!value;});
   picker.setAttribute('aria-label','Som da pose '+label(name));field(card,'Som ao entrar',picker);
   const play=button('Ouvir uma vez',()=>{this.poseAudio?.pause();const url=RRAssetFiles.urlFor(folder,sound.name,extensions);if(!url)return;const audio=this.poseAudio=new Audio(url);audio.loop=false;audio.volume=(sound.volume??90)/100;audio.playbackRate=(sound.pitch??100)/100;audio.preservesPitch=false;audio.play().catch(()=>this.parent.updateStatus('Não foi possível reproduzir o som selecionado.'));});play.disabled=!sound.name;card.append(play);
   number(card,'Volume',sound.volume??90,value=>{sound.volume=value;persist();},0,100);
   number(card,'Tom',sound.pitch??100,value=>{sound.pitch=value;persist();},50,150);
   card.append(el('small','','Uma vez ao entrar na pose/status. Sem loop. Biblioteca: Áudio → SE.'));
  }
  animate(){if(this.raf||this.dead||document.hidden)return;const draw=now=>{this.raf=0;if(this.dead||!this.host.isConnected||document.hidden)return;const viewport=this.host.getBoundingClientRect();for(const p of this.previews){if(!p.canvas.isConnected)continue;
    const rect=p.canvas.getBoundingClientRect();if(rect.bottom<viewport.top||rect.top>viewport.bottom||rect.right<viewport.left||rect.left>viewport.right)continue;
    const w=p.canvas.width,h=p.canvas.height,f=p.image?ReactorBattleData.graphicFrame(p.g,p.image.width,p.image.height,p.motion,Math.floor(now*60/1000*this.speed),p.kind==='actors'?-90:90):null;
    const stamp=f?[f.x,f.y,f.width,f.height,w,h].join(','):'missing';if(p.stamp===stamp)continue;p.stamp=stamp;
    const c=p.canvas.getContext('2d');c.clearRect(0,0,w,h);c.fillStyle='#26384a';c.fillRect(0,0,w,h);
    if(p.image){const scale=Math.min((w-12)/f.width,(h-12)/f.height,3);c.imageSmoothingEnabled=false;c.drawImage(p.image,f.x,f.y,f.width,f.height,(w-f.width*scale)/2,h-6-f.height*scale,f.width*scale,f.height*scale);}
    else{c.fillStyle='#d3dce7';c.font='12px Segoe UI';c.textAlign='center';c.fillText(p.g.type==='model'?'Modelo 3D':'Sem imagem',w/2,h/2);}
   }if(this.scenePreview?.canvas?.isConnected)this.drawBattleScene(this.scenePreview,now);this.raf=requestAnimationFrame(draw);};this.raf=requestAnimationFrame(draw);}
  drawBattleScene(scene,now=0){
   const c=scene.canvas.getContext?.('2d');if(!c)return;const w=scene.canvas.width,h=scene.canvas.height;
   c.clearRect(0,0,w,h);
   if(scene.backdrop?.width)c.drawImage(scene.backdrop,0,0,w,h);else{const gradient=c.createLinearGradient(0,0,0,h);gradient.addColorStop(0,'#31536b');gradient.addColorStop(.53,'#5a8067');gradient.addColorStop(1,'#a9824c');c.fillStyle=gradient;c.fillRect(0,0,w,h);}
   c.fillStyle='rgba(11,19,25,.52)';c.fillRect(10,10,Math.min(360,w-20),30);c.fillStyle='#fff';c.font='bold 14px Segoe UI';c.textBaseline='middle';c.fillText(scene.title||'Prévia da batalha',20,25);
   const tick=scene.playing?Math.floor(now*60/1000):scene.frame||0;
   for(const battler of scene.battlers||[]){
    const image=battler.image,record=battler.record,kind=battler.kind;let home;
    if(kind==='actors'){const index=battler.partyIndex,source=scene.settings.screen2d?.actorHomes?.[index];home=source||{x:430+index*90,y:400+index*24};}
    else{home=battler.member||{x:180+battler.enemyIndex*120,y:310+battler.enemyIndex*35};}
    const sx=w/816,sy=h/624,x=(Number(home.x)||0)*sx,y=(Number(home.y)||0)*sy;
    if(image?.width&&image?.height){const g=battler.graphic,f=ReactorBattleData.graphicFrame(g,image.width,image.height,scene.motion,tick,kind==='actors'?-90:90);if(!f)continue;
     const scale=Math.min(1.45,Math.max(.65,Number(g.scale)||1)),dw=f.width*scale,dh=f.height*scale,anchor=f.anchor||{x:.5,y:1};
     c.imageSmoothingEnabled=false;c.drawImage(image,f.x,f.y,f.width,f.height,x-dw*anchor.x,y-dh*anchor.y,dw,dh);
     if(battler.selected){c.strokeStyle='#ffe09a';c.lineWidth=2;c.strokeRect(x-dw*.5-4,y-dh-4,dw+8,dh+8);}
    }else{c.fillStyle=kind==='actors'?'#d7bd83':'#7a9d72';c.beginPath();c.ellipse(x,y-30,15,21,0,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.font='12px Segoe UI';c.textAlign='center';c.fillText(record?.name||'Sem gráfico',x,y+14);}
   }
   c.textAlign='left';c.fillStyle='rgba(11,19,25,.6)';c.fillRect(10,h-35,Math.min(490,w-20),24);c.fillStyle='#f3ead2';c.font='12px Segoe UI';c.fillText('Arraste os aliados para ajustar a formação. Prévia visual, sem alterar regras de combate.',18,h-23);
  }
  poses(){
   let kind='actors',id=this.db.data.actors.find(Boolean)?.id,selectedPose='idle',section='poses';
   const shell=el('div','diana-classic diana-animations2 diana-pose-database');this.host.append(shell);
   const draw=()=>{this.previews=[];shell.replaceChildren();
    const records=(this.db.data[kind]||[]).filter(Boolean);
    const rail=el('aside','diana-pose-record-rail'),railHead=el('div','diana-pose-rail-head');rail.append(railHead);
    const group=el('div','diana-pose-kind-tabs');group.setAttribute('role','tablist');
    for(const [value,title] of [['actors','Aliados'],['enemies','Inimigos']]){const tab=button(title,()=>{kind=value;id=this.db.data[kind].find(Boolean)?.id;draw();});tab.dataset.kind=value;tab.setAttribute('role','tab');tab.setAttribute('aria-selected',String(kind===value));group.append(tab);}railHead.append(group,el('strong','','Personagens de batalha'));
    const recordList=el('div','diana-pose-record-list');recordList.setAttribute('role','listbox');recordList.setAttribute('aria-label',kind==='actors'?'Aliados':'Inimigos');rail.append(recordList);shell.append(rail);
    if(!records.length){shell.append(el('p','','Nenhum registro. Crie um personagem ou inimigo no banco de dados.'));return;}
    if(!records.some(record=>record.id===id))id=records[0].id;
    for(const record of records){const item=button('',()=>{id=record.id;draw();});item.className='diana-pose-record';item.dataset.recordId=String(record.id);item.setAttribute('role','option');item.setAttribute('aria-selected',String(record.id===id));item.append(el('span','diana-pose-record-id',String(record.id).padStart(4,'0')),el('span','diana-pose-record-name',record.name||'Sem nome'));recordList.append(item);}
    const main=el('section','diana-pose-editor-main');shell.append(main);
    const record=records.find(item=>item.id===id),g=this.graphic(kind,id),header=el('header','diana-pose-editor-header');
    const heading=el('div','diana-pose-title');heading.append(el('span','diana-pose-id',String(id).padStart(4,'0')),el('h2','',record.name||'Sem nome'));header.append(heading);
    const speed=select([['0.5','Lenta'],['1','Normal'],['2','Rápida']],String(this.speed),value=>{this.speed=Number(value);this.previews.forEach(item=>{item.stamp='';});});speed.setAttribute('aria-label','Velocidade da prévia');field(header,'Intervalo',speed);main.append(header);
    const resources=el('fieldset','diana-classic-resources diana-pose-resource-row');resources.append(el('legend','','Gráfico de batalha'));
    const modes=[['sv','Spritesheet de batalha'],['character','Spritesheet de personagem'],['static','Imagem / recortes livres']];
    field(resources,'Formato',select(modes,g.type,value=>{this.setGraphic(kind,id,{mode:value,name:'',folder:value==='character'?'characters':value==='sv'?'sv_actors':kind==='actors'?'sv_actors':'enemies'});draw();}));
    const graphicName=el('strong','diana-pose-graphic-name',g.name||'Nenhuma imagem selecionada');
    resources.append(graphicName,button('Escolher gráfico…',()=>{
     const path=require('path'),folder=g.folder||'sv_actors',dir=path.join(this.parent.currentProject.path,'img',folder),files=RRAssetFiles.listNames(dir,['.png']);
     this.parent.showImagePicker('Gráfico de batalha',files,(name,index)=>{if(this.dead)return;this.setGraphic(kind,id,{mode:g.type==='model'?'static':g.type,name,index:index||0,folder});draw();},name=>RRAssetFiles.urlFor(dir,name,['.png']),g.name,{allowNone:true,...(g.type==='character'?{sheetType:'character',currentIndex:g.index||0}:{})});
    }));main.append(resources);
    const tabs=el('div','diana-pose-editor-tabs');tabs.setAttribute('role','tablist');
    for(const [value,title] of [['poses','Poses'],['animations','Animações']]){const tab=button(title,()=>{section=value;draw();});tab.setAttribute('role','tab');tab.setAttribute('aria-selected',String(section===value));tab.dataset.section=value;tabs.append(tab);}main.append(tabs);
    if(section==='poses'){
     const names=poseNames(g);if(!names.includes(selectedPose))selectedPose=names[0]||'idle';
     const poseLayout=el('div','diana-pose-authoring-layout'),posePanel=el('section','diana-pose-library'),detail=el('section','diana-pose-detail');
     const poseHeading=el('div','diana-pose-list-heading');poseHeading.append(el('h3','','Poses de batalha'),el('span','diana-pose-count',String(names.length)));posePanel.append(poseHeading,el('p','diana-help','Escolha uma pose para ver os quadros, configurar o som e editar o recorte.'));
     const poseList=el('div','diana-pose-list');poseList.setAttribute('role','listbox');poseList.setAttribute('aria-label','Poses dispon\u00edveis');this.previewRecordId=id;
     for(const [index,name] of names.entries()){const row=button('',()=>{selectedPose=name;draw();});row.className='diana-pose-row';row.dataset.poseName=name;row.setAttribute('role','option');row.setAttribute('aria-selected',String(name===selectedPose));
      row.append(el('span','diana-pose-row-number',String(index+1).padStart(2,'0')),el('span','diana-pose-row-name',label(name)));
      if(g.poses?.[name])row.append(el('span','diana-pose-row-mark','Editada'));
      poseList.append(row);
     }
     posePanel.append(poseList);
     const newRow=el('div','diana-pose-add-row'),newName=el('input','database-field-value');newName.placeholder='Nome da pose';newName.setAttribute('aria-label','Nome da nova pose');
     newRow.append(newName,button('Adicionar',()=>{const key=newName.value.trim();if(!key||names.includes(key)){newName.setCustomValidity('Informe um nome novo para a pose.');newName.reportValidity();return;}newName.setCustomValidity('');selectedPose=key;this.editPose(kind,id,key,draw);}));posePanel.append(newRow);
     const card=el('fieldset','diana-pose-detail-card');card.append(el('legend','',label(selectedPose)));
     const focus=el('canvas','diana-pose-focus-preview');focus.width=360;focus.height=250;card.append(focus);this.preview(focus,g,selectedPose,kind);
     const poseInfo=el('div','diana-pose-selected-info');poseInfo.append(el('span','diana-pose-id',selectedPose),el('strong','',g.poses?.[selectedPose]?g.poses[selectedPose].frames.length+' quadros personalizados':'Quadros do gr\u00e1fico selecionado'));
     card.append(poseInfo,button('Editar quadros e recorte',()=>this.editPose(kind,id,selectedPose,draw)));
     this.soundControls(card,kind,id,selectedPose,g);detail.append(card);
     poseLayout.append(posePanel,detail);main.append(poseLayout);
    }else{
     const animationPanel=el('section','diana-pose-animation-panel');animationPanel.append(el('h3','','Animações de batalha'),el('p','diana-help','Configure a sequência de quadros, a cadência e a repetição do spritesheet deste personagem. Cada pose continua editável separadamente.'));
     animationPanel.append(button('Editar grade de animação…',()=>this.editSpriteGrid(kind,id,g,draw)),button('Configurar armas…',()=>this.parent.openDatabase('weapons')),button('Configurar sequências…',()=>this.parent.openDatabase('actionSequences')));
     const animations=Object.entries(g.spriteAnimation?.animations||{}),list=el('div','diana-pose-animation-list');
     if(animations.length)for(const [name,data] of animations){const row=el('div','diana-pose-animation-row');row.append(el('strong','',label(name)),el('span','',`${(data.frames||[]).length} quadros`),el('span','',`${data.speed||12} quadros/intervalo`),el('span','',data.loop===true?'Repetir':data.loop==='once'?'Uma vez':'Parar no último'));list.append(row);}
     else list.append(el('p','diana-help','Ainda não há uma grade própria. O jogo usa o spritesheet e as poses configuradas acima.'));
     animationPanel.append(list);main.append(animationPanel);
    }
    this.animate();
   };draw();
  }
  async editPose(kind,id,name,refresh){
   const g=this.graphic(kind,id),image=await this.image(g);if(this.dead)return;
   if(!image){await RRDialog.alert('Selecione primeiro um gráfico 2D válido em Definir gráfico.',{title:'Pose de combate',kind:'warning'});return;}
   const original=g.poses||{},all=JSON.parse(JSON.stringify(original));
   if(!Object.hasOwn(all,name)){
    const frame=ReactorBattleData.graphicFrame(g,image.width,image.height,name,0,kind==='actors'?-90:90);
    const x=Math.max(0,Math.min(image.width-1,Math.floor(frame.x))),y=Math.max(0,Math.min(image.height-1,Math.floor(frame.y)));
    Object.defineProperty(all,name,{value:{loop:true,anchor:{x:.5,y:1},frames:[{x,y,width:Math.max(1,Math.min(image.width-x,Math.floor(frame.width))),height:Math.max(1,Math.min(image.height-y,Math.floor(frame.height))),duration:12}]},enumerable:true,writable:true,configurable:true});
   }
   let draft={[name]:all[name],...all};
   const overlay=el('div','rr-modal-overlay diana-pose-modal'),modal=el('div','rr-modal');overlay.append(modal);
   modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Definir pose — '+label(name));
   modal.append(el('div','rr-modal-header','Definir pose — '+label(name)));
   const body=el('div','rr-modal-body'),canvas=el('canvas','diana-pose-large');canvas.width=320;canvas.height=220;body.append(el('p','diana-help','A prévia fica em destaque. Abra “Retângulos de pose” para selecionar quadros e ajustar duração e repetição.'));body.append(canvas);modal.append(body);document.body.append(overlay);
   const card=this.presentation.rectanglePoseEditor(body,draft,value=>draft=value,(pose,tick)=>{
    const c=canvas.getContext('2d'),f=ReactorBattleData.graphicFrame({...g,poses:draft},image.width,image.height,pose,tick,kind==='actors'?-90:90),scale=Math.min(220/f.width,130/f.height,3);c.clearRect(0,0,240,150);c.imageSmoothingEnabled=false;c.drawImage(image,f.x,f.y,f.width,f.height,120-f.width*scale/2,145-f.height*scale,f.width*scale,f.height*scale);
   },()=>image);card.open=false;
   const close=()=>{card.posePreview.dispose();keys?.dispose();overlay.remove();};
   const footer=el('div','rr-modal-footer');footer.append(button('Cancelar',close),button('Aplicar pose',async()=>{
    const errors=ReactorBattleData.validateGraphicPoses(draft);
    if(errors.length){await RRDialog.alert('Há quadros inválidos. Corrija os recortes antes de aplicar a pose.',{title:'Pose de combate',kind:'warning'});return;}
    this.setGraphic(kind,id,{mode:g.type,poses:draft});close();refresh();
   }));modal.append(footer);
   const keys=root.RRKeyboardNavigation?.modal?.(overlay,{container:()=>modal,onEscape:close});keys?.enter();
   this.parent.registerDetailModal(overlay,close);
  }
  async editSpriteGrid(kind,id,g,refresh){
   const image=await this.image(g);if(this.dead)return;
   if(!image){await RRDialog.alert('Selecione primeiro um gráfico 2D válido.',{title:'Grade de animação',kind:'warning'});return;}
   const motions=poseNames(g),original=copy(g.spriteAnimation||defaultGrid());
   const overlay=el('div','rr-modal-overlay diana-grid-modal'),modal=el('div','rr-modal');overlay.append(modal);modal.append(el('div','rr-modal-header','Compor animação por grade'));
   const body=el('div','rr-modal-body');modal.append(body);document.body.append(overlay);
   let draft=original;const composer=SpriteComposer.mount(body,{value:draft,image,motions,onchange:value=>{draft=value;},onSaveImage:async(blob)=>{const name=await saveAlignedSheet(blob,{projectRoot:this.parent.currentProject.path,folder:g.folder||'sv_actors',name:g.name});this.setGraphic(kind,id,{name});refresh();}});
   const close=()=>{composer.dispose();overlay.remove();};const footer=el('div','rr-modal-footer');
   footer.append(button('Cancelar',close),button('Aplicar grade',async()=>{const errors=ReactorBattleData.validateSpriteAnimation(draft);if(errors.length){await RRDialog.alert('A grade precisa de ao menos um quadro, velocidade e repetição válidos em cada animação.',{title:'Grade de animação',kind:'warning'});return;}this.setGraphic(kind,id,{spriteAnimation:draft});close();refresh();}));modal.append(footer);
  }
  screen(){
   const shell=el('div','diana-classic diana-battle-screen');this.host.append(shell);const system=this.db.data.system;
   const layout=el('div','diana-screen-columns'),controls=el('div'),right=el('div');layout.append(controls,right);shell.append(layout);
   const group=(host,title)=>{const box=el('fieldset','diana-screen-group');box.append(el('legend','',title));host.append(box);return box;};
   const mode=group(controls,'Sistema de batalha');
   field(mode,'Apresentação',select([['side','Lateral (2D)'],['front','Frontal (2D)']],system.optSideView?'side':'front',v=>{system.optSideView=v==='side';this.changed();draw();}));
   field(mode,'Turnos',select([['0','Por turnos'],['1','Tempo ativo'],['2','Tempo com espera']],String(system.battleSystem||0),v=>{system.battleSystem=Number(v);this.changed();}));
   const options=group(controls,'Mensagens');
   if(root.DianaRTPExpansion)root.DianaRTPExpansion.mountEditor(controls,{system,onChange:()=>this.changed(),openDatabase:type=>this.parent.openDatabase(type),projectPath:this.parent.currentProject.path});
   if(root.DianaCombatModes){const rules=el('details','diana-combat-rules'),body=el('div');rules.append(el('summary','','Modos, combos e preparação tática'),body);controls.append(rules);root.DianaCombatModes.mountEditor(body,{system,skills:this.db.data.skills,onChange:()=>this.changed()});}
   for(const [key,title] of [['startMessages','Anunciar inimigos'],['escapeMessages','Mostrar mensagens de fuga']]){const box=el('input');box.type='checkbox';box.checked=this.settings()[key]!==false;box.onchange=()=>{this.settings()[key]=box.checked;this.changed();};field(options,title,box);}
   const commands=group(controls,'Nomes dos comandos');system.terms||={};system.terms.commands||=[];
   for(const [index,title] of [[0,'Lutar'],[1,'Fugir'],[2,'Atacar'],[3,'Defender'],[4,'Item']]){const input=el('input','database-field-value');input.value=system.terms.commands[index]||title;input.onchange=()=>{system.terms.commands[index]=input.value;this.changed();draw();};field(commands,title,input);}
   const positions=group(controls,'Posição dos aliados — pixels (816 × 624)');
   const settings=this.settings(),stored=settings.screen2d?.actorHomes||{};
   for(let i=0;i<4;i++){const row=el('div','diana-position-row');row.append(el('strong','',String(i+1)));positions.append(row);
    for(const axis of ['x','y'])number(row,axis.toUpperCase(),stored[i]?.[axis]??(axis==='x'?600+i*32:280+i*48),v=>{const screen=settings.screen2d||={};const homes=screen.actorHomes||={};homes[i]={x:600+i*32,y:280+i*48,...homes[i],[axis]:v};this.changed();draw();},0,axis==='x'?816:624);
   }
   const preview=group(right,'Prévia da batalha');const stage=el('div','diana-battle-preview-controls');
   const projectPath=this.parent.currentProject.path,path=require('path'),backgroundDir=path.join(projectPath,'img','battlebacks1'),backgrounds=RRAssetFiles.listNames(backgroundDir,['.png']);
   const troops=(this.db.data.troops||[]).filter(Boolean),initialTroop=troops[0]?.id||1,initialBackground=settings.screen2d?.battleback1||'PracaClareira';
   const backgroundSelect=select(backgrounds.map(name=>[name,name]),initialBackground,value=>{this.scenePreview.backgroundName=value;this.loadBattleScene(this.scenePreview);});backgroundSelect.setAttribute('aria-label','Fundo da batalha');
   const troopSelect=select(troops.map(troop=>[troop.id,String(troop.id).padStart(4,'0')+' '+troop.name]),String(initialTroop),value=>{this.scenePreview.troopId=Number(value);this.loadBattleScene(this.scenePreview);});troopSelect.setAttribute('aria-label','Grupo de inimigos de prévia');
   const motionSelect=select([['idle','Aguardar'],['attack','Ataque'],['guard','Defesa'],['damage','Dano'],['victory','Vitória']], 'idle',value=>{this.scenePreview.motion=value;this.scenePreview.frame=0;this.animate();});motionSelect.setAttribute('aria-label','Pose de prévia');
   const playToggle=button('Reproduzir animação',()=>{this.scenePreview.playing=!this.scenePreview.playing;playToggle.textContent=this.scenePreview.playing?'Pausar animação':'Reproduzir animação';this.animate();});stage.append(field(stage,'Fundo',backgroundSelect),field(stage,'Grupo',troopSelect),field(stage,'Pose',motionSelect),playToggle);preview.append(stage);
   const canvas=el('canvas','diana-battle-composition');canvas.width=1000;canvas.height=740;canvas.setAttribute('aria-label','Prévia da batalha com heróis, inimigos e fundo');preview.append(canvas);
   preview.append(el('p','diana-help','A prévia usa os sprites e o fundo selecionados. Arraste um aliado no cenário ou ajuste suas coordenadas; o jogo usa a mesma formação.'));
   right.append(button('Grupos de inimigos e fundos…',()=>this.parent.openDatabase('troops')),button('Animações 2 — Poses…',()=>this.parent.openDatabase('dianaPoses')));
   this.scenePreview={canvas,settings:this.settings(),backgroundName:initialBackground,troopId:initialTroop,motion:'idle',frame:0,playing:false,battlers:[],title:'Praça da Clareira'};
   canvas.onpointerdown=event=>{const rect=canvas.getBoundingClientRect(),point={x:(event.clientX-rect.left)*816/rect.width,y:(event.clientY-rect.top)*624/rect.height};const hit=(this.scenePreview.battlers||[]).filter(item=>item.kind==='actors').map(item=>({item,home:this.scenePreview.settings.screen2d?.actorHomes?.[item.partyIndex]||{x:430+item.partyIndex*90,y:400+item.partyIndex*24}})).reverse().find(({home})=>Math.abs(home.x-point.x)<72&&Math.abs(home.y-point.y)<100);if(hit){this.scenePreview.dragging=hit.item.partyIndex;canvas.setPointerCapture?.(event.pointerId);}};
   canvas.onpointermove=event=>{if(this.scenePreview.dragging===undefined)return;const rect=canvas.getBoundingClientRect(),screen=this.scenePreview.settings.screen2d||={},homes=screen.actorHomes||={},index=this.scenePreview.dragging;screen.actorHomes=homes;const home=homes[index]||={x:430+index*90,y:400+index*24};home.x=Math.max(0,Math.min(816,Math.round((event.clientX-rect.left)*816/rect.width)));home.y=Math.max(0,Math.min(624,Math.round((event.clientY-rect.top)*624/rect.height)));this.drawBattleScene(this.scenePreview);};
   canvas.onpointerup=canvas.onpointercancel=()=>{if(this.scenePreview.dragging===undefined)return;this.scenePreview.dragging=undefined;this.changed();draw();};
   const visuals=(kind,id,partyIndex,enemyIndex,member)=>{const record=this.db.data[kind]?.[id];if(!record)return null;const armors=kind==='actors'?(record.equips||[]).slice(1).map(equipId=>this.db.data.armors?.[equipId]).filter(Boolean):[];const graphic=ReactorBattleData.motionGraphic(this.graphic(kind,id), 'idle', armors);return {kind,id,partyIndex,enemyIndex,member,record,graphic,image:null};};
   this.loadBattleScene=scene=>{const background=scene.backgroundName;this.image({type:'static',name:background,folder:'battlebacks1'}).then(image=>{if(!this.dead&&scene===this.scenePreview){scene.backdrop=image;this.drawBattleScene(scene);}});const troop=this.db.data.troops?.[scene.troopId],members=(troop?.members||[]).filter(member=>!member.hidden),actors=(system.partyMembers||[]).slice(0,4).map((id,index)=>visuals('actors',id,index));scene.battlers=[...actors,...members.map((member,index)=>visuals('enemies',member.enemyId,undefined,index,member))].filter(Boolean);scene.title=troop?.name||background;for(const battler of scene.battlers)this.image(battler.graphic).then(image=>{if(!this.dead&&scene===this.scenePreview){battler.image=image;this.drawBattleScene(scene);}});this.drawBattleScene(scene);this.animate();};
   const draw=()=>{this.scenePreview.settings=this.settings();this.loadBattleScene(this.scenePreview);};draw();
  }
  dispose(){this.dead=true;this.poseAudio?.pause();cancelAnimationFrame(this.raf);document.removeEventListener('visibilitychange',this.visibility);this.previews=[];this.images.clear();}
 }
 root.DianaBattle2D={poseNames,defaults,Battle2D,SpriteSheetTools,saveAlignedSheet,animationFrameAt,studioSteps};root.DianaSpriteComposer=SpriteComposer;if(typeof module!=='undefined')module.exports=root.DianaBattle2D;
 if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',install);
})(globalThis);
