/* Search map events by title, switch or variable without changing project data. */
(function(root){
 'use strict';
 const eventsOf=map=>(map?.events||[]).filter(Boolean);
 function conditions(event){return (event.pages||[]).flatMap(page=>{
  const c=page?.conditions||{},out=[];
  if(c.switch1Valid)out.push({type:'switch',id:Number(c.switch1Id)});
  if(c.switch2Valid)out.push({type:'switch',id:Number(c.switch2Id)});
  if(c.variableValid)out.push({type:'variable',id:Number(c.variableId)});
  return out;
 });}
 function search(maps,{type='name',query=''}={}){
  const needle=String(query).trim().toLocaleLowerCase();if(!needle)return [];
  return (maps||[]).flatMap(({mapId,mapName,map})=>eventsOf(map).flatMap(event=>{
   const refs=conditions(event),matched=type==='name'?String(event.name||'').toLocaleLowerCase().includes(needle):refs.some(ref=>ref.type===type&&String(ref.id)===needle);
   return matched?[{mapId,mapName,eventId:event.id,eventName:event.name||`Evento ${event.id}`,x:event.x,y:event.y,conditions:refs}]:[];
  }));
 }
 function projectMaps(app){
  const pc=app?.projectController,project=pc?.getCurrentProject?.()||pc?.currentProject;if(!project?.path)return [];
  const fs=require('fs'),path=require('path'),current=app.eventManager?.currentMap;
  return (project.maps||[]).filter(Boolean).flatMap(entry=>{
   const id=Number(entry.id);let map=current?.id===id?current:null;
   if(!map){const filename=`Map${String(id).padStart(3,'0')}.json`,file=path.join(project.path,'data',filename);try{map=JSON.parse(fs.readFileSync(file,'utf8'));}catch{return [];}}
   return [{mapId:id,mapName:entry.name||`Mapa ${id}`,map}];
  });
 }
 function open(app){
  if(document.getElementById('diana-event-search'))return;
  const overlay=document.createElement('div');overlay.id='diana-event-search';overlay.className='rr-modal-overlay';overlay.style.zIndex=24000;
  const modal=document.createElement('section');modal.className='rr-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Buscar eventos');
  const head=document.createElement('div');head.className='rr-modal-header';head.textContent='Buscar eventos em todos os mapas';
  const body=document.createElement('div');body.className='rr-modal-body';
  const controls=document.createElement('div');controls.style.cssText='display:grid;grid-template-columns:180px 1fr;gap:8px;margin-bottom:12px';
  const select=document.createElement('select');select.setAttribute('aria-label','Buscar por');for(const [value,label] of [['name','Nome do evento'],['switch','ID do switch'],['variable','ID da variável']]){const o=document.createElement('option');o.value=value;o.textContent=label;select.append(o);}
  const input=document.createElement('input');input.type='search';input.placeholder='Digite um nome ou ID';input.setAttribute('aria-label','Termo de busca');controls.append(select,input);
  const results=document.createElement('div');results.setAttribute('aria-live','polite');body.append(controls,results);
  const foot=document.createElement('div');foot.className='rr-modal-footer';const close=document.createElement('button');close.className='rr-btn-secondary';close.textContent='Fechar';foot.append(close);modal.append(head,body,foot);overlay.append(modal);document.body.append(overlay);
  const dispose=()=>{keys?.dispose();overlay.remove();},keys=root.RRKeyboardNavigation?.modal?.(overlay,{container:()=>modal,onEscape:dispose});close.onclick=dispose;overlay.addEventListener('mousedown',e=>{if(e.target===overlay)dispose();});
  const render=()=>{
   results.replaceChildren();const found=search(projectMaps(app),{type:select.value,query:input.value});
   if(!input.value.trim()){results.textContent='Pesquise pelo nome do evento ou pelo ID de um switch/variável usado em suas páginas.';return;}
   if(!found.length){results.textContent='Nenhum evento encontrado.';return;}
   for(const result of found){const row=document.createElement('button');row.type='button';row.className='rr-btn-secondary';row.style.cssText='display:flex;justify-content:space-between;width:100%;margin:4px 0;text-align:left';
    const title=document.createElement('span');title.textContent=`${result.mapName} · ${result.eventName}`;
    const detail=document.createElement('small');detail.textContent=`#${result.eventId} · (${result.x}, ${result.y}) · ${result.conditions.map(c=>`${c.type==='switch'?'S':'V'}${c.id}`).join(', ')||'sem condição'}`;
    row.append(title,detail);row.onclick=async()=>{const ok=await app.projectController.loadMap(result.mapId);if(!ok)return;app.eventManager?.selectEventFromList(result.eventId);dispose();};results.append(row);
   }
  };
  input.addEventListener('input',render);select.addEventListener('change',render);input.focus();
 }
 const api={search,conditions,open};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.DianaEventSearch=api;
})(globalThis);
