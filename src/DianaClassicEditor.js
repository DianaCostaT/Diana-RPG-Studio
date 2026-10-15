/* Classic 2D authoring conveniences over the existing event/undo pipeline. */
(function(root){
 'use strict';
 function textCommands(text,face='',faceIndex=0){
  const lines=[];for(const paragraph of String(text).replace(/\r/g,'').split('\n')){let line='';for(const word of paragraph.split(/\s+/).filter(Boolean)){
   const parts=Array.from(word);while(parts.length>32){if(line){lines.push(line);line='';}lines.push(parts.splice(0,32).join(''));}
   const rest=parts.join('');if(Array.from(line+(line?' ':'')+rest).length>32){lines.push(line);line='';}line+=(line?' ':'')+rest;
  }lines.push(line);}
  const commands=[];for(let i=0;i<lines.length;i+=4){commands.push({code:101,indent:0,parameters:[face,faceIndex,0,2]});for(const line of lines.slice(i,i+4))commands.push({code:401,indent:0,parameters:[line]});}commands.push({code:0,indent:0,parameters:[]});return commands;
 }
 function insertDialogue(manager,map,{name,x,y,character='',characterIndex=0,face='',faceIndex=0,text}){
  if(manager.currentMap!==map)throw Error('O mapa mudou. Abra novamente a criação de NPC.');
  if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=map.width||y>=map.height)throw Error('Escolha uma posição dentro do mapa.');
  if(manager.getEventAt(x,y))throw Error('Já existe um evento nessa posição. Escolha outra célula.');
  if(!name.trim()||!text.trim())throw Error('Preencha o nome e o diálogo.');
  const page=manager.makeDefaultEventPage({image:{tileId:0,characterName:character,characterIndex,direction:2,pattern:1},priorityType:character?1:0,trigger:0,list:textCommands(text,face,faceIndex)});
  const event=manager.makeQuickEvent(x,y,name.trim(),[page]);if(!manager.commitQuickEvent(event,map))throw Error('Não foi possível inserir o NPC. Nenhum evento foi substituído.');return event;
 }
 function initialPosition(manager,map,system){
  const sx=manager.selectedTileX??system.startX??0,sy=manager.selectedTileY??((system.startY??0)+1);
  const occupied=new Set((map.events||[]).filter(Boolean).map(e=>e.x+','+e.y));let best=null,distance=Infinity;
  for(let y=0;y<map.height;y++)for(let x=0;x<map.width;x++){if(occupied.has(x+','+y)||x===system.startX&&y===system.startY)continue;const d=Math.abs(x-sx)+Math.abs(y-sy);if(d<distance){best={x,y};distance=d;}}
  return best||{x:0,y:0};
 }
 function openDialogue(app){
  const manager=app.eventManager,map=manager?.currentMap,project=app.projectController?.currentProject;if(!map||!project||document.getElementById('diana-npc-dialog'))return;
  if(!manager.eventMode)document.getElementById('toolbar-event-manager-btn')?.click();
  const overlay=document.createElement('div');overlay.id='diana-npc-dialog';overlay.className='rr-modal-overlay';overlay.style.zIndex=23000;
  const modal=document.createElement('section');modal.className='rr-modal diana-npc-panel';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Criar NPC com diálogo');
  const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
  const header=el('div','Criar NPC com diálogo');header.className='rr-modal-header';const body=el('div');body.className='rr-modal-body';
  const field=(label,id,node)=>{node.id=id;node.className='database-field-value';const row=el('label');row.className='diana-npc-field';row.append(el('span',label),node);body.append(row);return node;};
  const input=(label,id,value,type='text')=>{const n=el('input');n.type=type;n.value=value;return field(label,id,n);};
  const name=input('Nome do NPC','diana-npc-name','Novo personagem');name.maxLength=64;
  const position=initialPosition(manager,map,app.databaseManager.data.system),x=input('Posição X','diana-npc-x',position.x,'number'),y=input('Posição Y','diana-npc-y',position.y,'number');
  for(const [n,max] of [[x,map.width-1],[y,map.height-1]]){n.min=0;n.max=max;n.step=1;}
  const select=(label,id,folder)=>{const n=el('select'),none=el('option','Sem imagem');none.value='';n.append(none);const path=require('path');for(const file of RRAssetFiles.listNames(path.join(project.path,'img',folder),['.png'])){const o=el('option',file);o.value=file;n.append(o);}return field(label,id,n);};
  const character=select('Sprite de personagem','diana-npc-character','characters');character.value=app.databaseManager.data.actors?.find(Boolean)?.characterName||'';
  const characterIndex=input('Personagem na folha (1–8)','diana-npc-character-index',1,'number');characterIndex.min=1;characterIndex.max=8;characterIndex.step=1;
  const face=select('Folha de rostos','diana-npc-face','faces'),faceIndex=input('Rosto na folha (1–8)','diana-npc-face-index',1,'number');faceIndex.min=1;faceIndex.max=8;faceIndex.step=1;
  const text=el('textarea');text.rows=5;text.maxLength=5000;field('Diálogo','diana-npc-text',text);text.value='Olá! Seja bem-vindo à nossa vila.';
  const help=el('p','O texto é dividido em linhas e páginas automaticamente. O jogador conversa usando Enter. Após criar, salve o projeto; Desfazer remove a criação.');help.className='diana-help';body.append(help);
  const error=el('p');error.id='diana-npc-error';error.setAttribute('role','alert');body.append(error);
  const footer=el('div');footer.className='rr-modal-footer';const cancel=el('button','Cancelar'),create=el('button','Criar NPC');cancel.type=create.type='button';cancel.className='rr-btn-secondary';create.className='rr-button-primary';create.id='diana-npc-create';footer.append(cancel,create);modal.append(header,body,footer);overlay.append(modal);document.body.append(overlay);
  const close=()=>{keys?.dispose();overlay.remove();};cancel.onclick=close;
  create.onclick=()=>{try{
   for(const n of [x,y,characterIndex,faceIndex])if(!n.checkValidity()||!Number.isInteger(n.valueAsNumber))throw Error('Revise as posições e os índices: use números inteiros dentro dos limites.');
   const event=insertDialogue(manager,map,{name:name.value,x:x.valueAsNumber,y:y.valueAsNumber,character:character.value,characterIndex:characterIndex.valueAsNumber-1,face:face.value,faceIndex:faceIndex.valueAsNumber-1,text:text.value});
   app.uiManager.updateStatus('NPC '+event.name+' criado. Salve o projeto para gravar.');close();
  }catch(e){error.textContent=e.message;}};
  const keys=root.RRKeyboardNavigation?.modal?.(overlay,{container:()=>modal,onEscape:close});keys?.enter(name);
  body.addEventListener('input',()=>{error.textContent='';});
 }
 function install(){
  for(const [menu,label] of [['forge','Geradores'],['build','Exportar']]){const title=document.querySelector('[data-menu="'+menu+'"]>span');if(title){title.removeAttribute('data-i18n');title.textContent=label;}}
  const bar=document.getElementById('diana-workspace'),events=bar?.querySelector('[data-diana-action=events]');if(!events)return;
  const quick=document.createElement('button');quick.type='button';quick.id='diana-new-npc';quick.dataset.dianaAction='quick-event';quick.title='Criar NPC com diálogo, usando o sistema de eventos do projeto';quick.disabled=true;quick.innerHTML=root.DianaIcons.svg('events')+'<span class="diana-button-label">Novo NPC</span>';quick.onclick=()=>{if(window.reactor)openDialogue(window.reactor);};events.after(quick);
  const advanced=document.createElement('button');advanced.type='button';advanced.id='diana-advanced-tools';advanced.textContent='Ferramentas avançadas';advanced.title='Mostrar ou recolher ferramentas auxiliares da barra';advanced.setAttribute('aria-pressed','false');document.getElementById('toolbar').append(advanced);
  advanced.onclick=()=>{const on=document.documentElement.classList.toggle('diana-advanced-tools');advanced.setAttribute('aria-pressed',String(on));};
 }
 root.DianaClassicEditor={textCommands,insertDialogue,initialPosition};if(typeof module!=='undefined')module.exports=root.DianaClassicEditor;
 if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',install);
})(globalThis);
