/* Visual source-crop inspection, preview and non-overwriting repair. */
(function(root){
 'use strict';
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const button=(text,fn)=>{const n=el('button',text);n.type='button';n.className='diana-maker-button';n.onclick=fn;return n;};
 const clone=value=>JSON.parse(JSON.stringify(value));
 const sameName=(a,b)=>String(a||'').toLowerCase()===String(b||'').toLowerCase();
 function walkGrid(columns=6,rows=4){
  const frames=columns===6?[2,0,1,5,3,4]:Array.from({length:columns},(_,i)=>i);
  return {version:1,columns,rows,anchor:{x:.5,y:1},animations:{walk:{frames,speed:8,loop:true,directions:Object.fromEntries([2,4,6,8].map((d,row)=>[d,frames.map(i=>row*columns+i)]))}}};
 }
 function apply(data,folder,oldName,name,grid){
  if(folder==='characters'){
   const library=data.system.dianaSpriteAnimations||={version:1,characters:{}};library.characters||={};library.characters[name]=clone(grid);
   for(const actor of data.actors||[])if(actor&&sameName(actor.characterName,oldName)){actor.characterName=name;actor.characterIndex=0;}
  }else{
   for(const kind of ['actors','enemies'])for(const entry of Object.values(data.battlePresentation?.[kind]||{}))if(entry?.graphic&&sameName(entry.graphic.name,oldName)&&entry.graphic.folder===folder){entry.graphic={...entry.graphic,name,spriteAnimation:clone(grid)};}
   if(folder==='sv_actors')for(const actor of data.actors||[])if(actor&&sameName(actor.battlerName,oldName))actor.battlerName=name;
  }
 }
 function open(app,{folder='characters',name}={}){
  const project=app.projectController.getCurrentProject(),db=app.databaseManager;if(!project)return;
  const path=require('path'),overlay=el('div'),modal=el('div'),body=el('div'),footer=el('div');
  overlay.className='rr-modal-overlay diana-repair-modal';modal.className='rr-modal';body.className='rr-modal-body';footer.className='rr-modal-footer';
  modal.append(el('h2','Corrigir folhas de sprites'),body,footer);overlay.append(modal);document.body.append(overlay);
  let source=null,result=null,detected=null,columns=6,rows=4,cellWidth=48,cellHeight=48,padding=1,threshold=0,isolate=false,index=0,playing=false,tick=0,raf=0,closed=false,grid=null,loadId=0;
  const note=el('p','Selecione uma folha. Para recuperar cabeça, armas ou cabelo já cortados, use o original da Clareira ou carregue o PNG de origem. O original do projeto é preservado.');body.append(note);
  const choices=el('div'),settings=el('div'),inspection=el('div'),gallery=el('div'),status=el('p');choices.className=settings.className='diana-grid-controls';inspection.className='diana-repair-inspection';gallery.className='diana-grid-sheet';body.append(choices,settings,inspection,gallery,status);
  const sourceCanvas=el('canvas'),preview=el('canvas');sourceCanvas.width=500;sourceCanvas.height=330;preview.width=288;preview.height=240;inspection.append(sourceCanvas,preview);
  const asset=el('select');asset.setAttribute('aria-label','Folha de sprites');
  const entries=[];for(const dir of ['characters','sv_actors','enemies'])for(const file of root.RRAssetFiles.listNames(path.join(project.path,'img',dir),['.png'])){const value=dir+'/'+file;entries.push({folder:dir,name:file,value});const option=el('option',value);option.value=value;asset.append(option);}
  asset.value=entries.find(e=>e.folder===folder&&(!name||sameName(e.name,name)))?.value||entries[0]?.value||'';choices.append(asset);
  const fail=error=>{status.textContent=error.message||String(error);};
  const pixels=image=>{const c=el('canvas');c.width=image.width;c.height=image.height;c.getContext('2d').drawImage(image,0,0);return c.getContext('2d').getImageData(0,0,c.width,c.height);};
  const load=async(url,crop)=>{const request=++loadId;status.textContent='Carregando folha…';playing=false;result=null;detected=null;save.disabled=true;
   try{const image=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Não foi possível carregar a imagem.'));i.src=url;});if(closed||request!==loadId)return;
    if(crop){const c=el('canvas');c.width=crop;c.height=crop;c.getContext('2d').drawImage(image,0,0,crop,crop,0,0,crop,crop);source=pixels(c);}else source=pixels(image);
    sourceCanvas.dataset.sourceWidth=String(source.width);sourceCanvas.dataset.sourceHeight=String(source.height);index=0;status.textContent='Fonte carregada. Confira todos os quadros antes de salvar.';renderSettings();draw();
   }catch(error){if(request===loadId)fail(error);}
  };
  function chooseAsset(){const entry=entries.find(e=>e.value===asset.value);if(!entry)return;folder=entry.folder;name=entry.name;
   const graphic=Object.values(db.data.battlePresentation?.actors||{}).concat(Object.values(db.data.battlePresentation?.enemies||{})).find(e=>e?.graphic&&sameName(e.graphic.name,name)&&e.graphic.folder===folder)?.graphic;
   const logicalNames=folder==='characters'?[...Object.keys(db.data.system.dianaSpriteAnimations?.characters||{}),...(db.data.actors||[]).filter(Boolean).map(a=>a.characterName)]:[graphic?.name];name=logicalNames.find(n=>sameName(n,name))||name;
   grid=clone(folder==='characters'?db.data.system.dianaSpriteAnimations?.characters?.[name]||walkGrid():graphic?.spriteAnimation||{version:1,columns:6,rows:6,anchor:{x:.5,y:1},animations:{idle:{frames:[0,1,2,3,4,5],speed:10,loop:true}}});
   columns=grid.columns;rows=grid.rows;cellWidth=folder==='characters'?48:192;cellHeight=cellWidth;padding=folder==='characters'?1:7;threshold=0;isolate=false;
   load(root.RRAssetFiles.urlFor(path.join(project.path,'img',folder),name,['.png']));
  }
  asset.onchange=chooseAsset;
  choices.append(button('Usar original da Clareira',()=>{
   const file=folder==='characters'&&/^\$Liora(?:\[f6\])?$/i.test(name)?'LioraCaminhada6':folder==='characters'&&sameName(name,'$Brann')?'BrannCaminhada':folder==='sv_actors'&&sameName(name,'BrannMedieval')?'BatalhadoresOriginais':null;
   if(!file){status.textContent='Não há original incluído para esta folha. Carregue o PNG de origem.';return;}
   threshold=95;isolate=true;load('diana-sprite-sources/'+file+'.png',file==='BatalhadoresOriginais'?627:0);
  }));
  const fileInput=el('input');fileInput.type='file';fileInput.accept='image/png';fileInput.setAttribute('aria-label','Carregar PNG de origem');fileInput.onchange=()=>{const file=fileInput.files?.[0];if(!file)return;const url=URL.createObjectURL(file);load(url).finally(()=>URL.revokeObjectURL(url));};choices.append(fileInput);
  function numeric(host,label,value,change,min,max){const row=el('label'),input=el('input');input.type='number';input.min=min;input.max=max;input.value=value;input.setAttribute('aria-label',label);input.onchange=()=>{const n=input.valueAsNumber;if(Number.isInteger(n)&&n>=min&&n<=max){try{change(n);}catch(error){fail(error);}}else status.textContent='Informe um número inteiro dentro dos limites.';};row.append(el('span',label),input);host.append(row);}
  function invalidate(){result=null;detected=null;save.disabled=true;index=Math.min(index,columns*rows-1);renderSettings();draw();}
  function renderSettings(){settings.replaceChildren();
   numeric(settings,'Colunas',columns,n=>{columns=n;invalidate();},1,32);numeric(settings,'Linhas',rows,n=>{rows=n;invalidate();},1,32);
   numeric(settings,'Largura do quadro',cellWidth,n=>{cellWidth=n;invalidate();},3,512);numeric(settings,'Altura do quadro',cellHeight,n=>{cellHeight=n;invalidate();},3,512);numeric(settings,'Margem',padding,n=>{padding=n;invalidate();},1,64);
   numeric(settings,'Limiar de transparência',threshold,n=>{threshold=n;invalidate();},0,254);
   const label=el('label'),box=el('input');box.type='checkbox';box.checked=isolate;box.onchange=()=>{isolate=box.checked;invalidate();};label.append(box,el('span','Isolar personagem completo (separa fragmentos e efeitos desconectados; revise)'));settings.append(label);
  }
  function repair(){if(!source)return;try{
   detected||=root.DianaSpriteRepair.detect(source,columns,rows,{threshold,isolate});
   result=root.DianaSpriteRepair.repack(source,columns,rows,{rects:detected.rects,masks:detected.masks,cellWidth,cellHeight,padding,threshold,allowUpscale:folder!=='characters'});
   status.textContent=columns*rows+' quadros reconstruídos com escala única. '+detected.warnings.length+' avisos de detecção. Revise cada posição; efeitos desconectados podem precisar de recorte manual.';save.disabled=false;draw();
  }catch(error){result=null;save.disabled=true;fail(error);}}
  choices.append(button('Detectar e reconstruir quadros',repair),button('Restaurar prévia',()=>{playing=false;invalidate();}));
  const frameControls=el('div'),cropControls=el('div');frameControls.className=cropControls.className='diana-grid-controls';body.append(frameControls,cropControls);
  const counter=el('strong');frameControls.append(button('Quadro anterior',()=>{playing=false;index=(index+columns*rows-1)%(columns*rows);draw();}),counter,button('Próximo quadro',()=>{playing=false;index=(index+1)%(columns*rows);draw();}),button('Reproduzir / pausar',()=>{playing=!playing;tick=0;}));
  let direction=2;for(const [d,label] of [[2,'Frente'],[4,'Esquerda'],[6,'Direita'],[8,'Costas']])frameControls.append(button(label,()=>{direction=d;index=[2,4,6,8].indexOf(d)*columns;playing=false;draw();}));
  function imageCanvas(data){const c=el('canvas');c.width=data.width;c.height=data.height;const ctx=c.getContext('2d'),rgba=ctx.createImageData(data.width,data.height);rgba.data.set(data.data);ctx.putImageData(rgba,0,0);return c;}
  function draw(){if(!source)return;
   const src=imageCanvas(source),rect=detected?.rects[index]||{x:Math.floor(index%columns*source.width/columns),y:Math.floor(Math.floor(index/columns)*source.height/rows),width:Math.floor(source.width/columns),height:Math.floor(source.height/rows)};
   const context=sourceCanvas.getContext('2d'),scale=Math.min(sourceCanvas.width/source.width,sourceCanvas.height/source.height);context.clearRect(0,0,sourceCanvas.width,sourceCanvas.height);context.imageSmoothingEnabled=false;context.drawImage(src,0,0,source.width*scale,source.height*scale);context.strokeStyle='#ffe09a';context.lineWidth=2;context.strokeRect(rect.x*scale,rect.y*scale,rect.width*scale,rect.height*scale);
   const c=preview.getContext('2d'),out=result?imageCanvas(result):src,box=result?{x:index%columns*cellWidth,y:Math.floor(index/columns)*cellHeight,width:cellWidth,height:cellHeight}:rect,s=Math.min((preview.width-16)/box.width,(preview.height-16)/box.height,5);c.clearRect(0,0,preview.width,preview.height);c.imageSmoothingEnabled=false;c.drawImage(out,box.x,box.y,box.width,box.height,(preview.width-box.width*s)/2,preview.height-8-box.height*s,box.width*s,box.height*s);
   counter.textContent='Quadro '+(index+1)+' / '+columns*rows+' · linha '+(Math.floor(index/columns)+1)+' · coluna '+(index%columns+1);
   cropControls.replaceChildren();for(const [key,label] of [['x','Recorte X'],['y','Recorte Y'],['width','Largura do recorte'],['height','Altura do recorte']])numeric(cropControls,label,rect[key],n=>{detected||=root.DianaSpriteRepair.detect(source,columns,rows,{threshold,isolate});detected.rects[index]={...rect,[key]:n};if(detected.masks)detected.masks[index]=null;repair();},key==='width'||key==='height'?1:0,key==='x'||key==='width'?source.width:source.height);
   gallery.replaceChildren();gallery.style.gridTemplateColumns='repeat('+columns+', 48px)';for(let i=0;i<columns*rows;i++){const b=button('',()=>{playing=false;index=i;draw();});b.setAttribute('aria-label','Inspecionar quadro '+(i+1));b.dataset.selected=String(i===index);
    const thumb=el('canvas');thumb.width=44;thumb.height=44;const r=result?{x:i%columns*cellWidth,y:Math.floor(i/columns)*cellHeight,width:cellWidth,height:cellHeight}:detected?.rects[i]||{x:Math.floor(i%columns*source.width/columns),y:Math.floor(Math.floor(i/columns)*source.height/rows),width:Math.floor(source.width/columns),height:Math.floor(source.height/rows)},t=thumb.getContext('2d'),s=Math.min(44/r.width,44/r.height);t.imageSmoothingEnabled=false;t.drawImage(out,r.x,r.y,r.width,r.height,(44-r.width*s)/2,(44-r.height*s)/2,r.width*s,r.height*s);b.append(thumb,el('small',String(i+1)));gallery.append(b);}
  }
  const save=button('Salvar cópia e usar nos personagens',async()=>{if(!result)return;save.disabled=true;try{
   if(folder==='characters'&&rows!==4)throw Error('A caminhada precisa das quatro linhas: frente, esquerda, direita e costas.');
   if(folder!=='characters'&&(columns!==grid.columns||rows!==grid.rows))throw Error('Para combate, mantenha a grade da animação ou ajuste-a no compositor antes de aplicar.');
   const canvas=imageCanvas(result),blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Não foi possível gerar o PNG.');
   const newName=await root.DianaBattle2D.saveAlignedSheet(blob,{projectRoot:project.path,folder,name});
   if(folder==='characters'&&(grid.columns!==columns||grid.rows!==rows||!grid.animations?.walk))grid=walkGrid(columns,rows);
   apply(db.data,folder,name,newName,grid);db.mutationGeneration++;app.uiManager?.updateStatus?.('Folha corrigida: '+newName);await root.RPGReactorHost?.flush?.();
   status.textContent='Cópia criada: '+newName+'.png. Personagens atualizados em memória; salve o projeto. Eventos que usam a folha antiga podem selecionar a cópia no seletor de gráficos.';
  }catch(error){fail(error);}finally{save.disabled=!result;}});save.disabled=true;
  const close=()=>{closed=true;cancelAnimationFrame(raf);overlay.remove();};footer.append(save,button('Fechar',close));
  function animate(){if(closed)return;if(playing&&source&&++tick%8===0){const row=folder==='characters'?[2,4,6,8].indexOf(direction):Math.floor(index/columns);index=row*columns+(index%columns+1)%columns;draw();}raf=requestAnimationFrame(animate);}chooseAsset();raf=requestAnimationFrame(animate);
  return {close};
 }
 root.DianaSpriteRepairUI={open,walkGrid,apply};if(typeof module!=='undefined')module.exports=root.DianaSpriteRepairUI;
})(typeof window!=='undefined'?window:globalThis);
