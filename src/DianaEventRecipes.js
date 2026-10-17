/* Original Diana recipes compiled to the existing RPGReactor event contract. */
(function(root){
 'use strict';
 const recipes=[
  {id:'delivery',label:'Entrega de itens com recompensa',help:'Confere os itens, consome a quantidade e entrega ouro uma única vez. A conclusão fica no switch local A deste evento.'},
  {id:'craft',label:'Fabricação de um item',help:'Troca uma quantidade de material por um produto, com verificação do estoque. Pode ser repetida.'},
  {id:'gather',label:'Coleta única',help:'Entrega itens uma vez; depois mostra que o recurso está esgotado. Não é um sistema de crescimento.'},
  {id:'choices',label:'Conversa com duas escolhas',help:'Cria duas respostas editáveis usando escolhas e ramificações nativas.'},
  {id:'light',label:'Alternar iluminação',help:'Alterna a tonalidade da tela entre noite e normal ao interagir. Não cria um relógio; a tonalidade afeta a tela inteira.'}
 ];
 const cmd=(code,parameters=[],indent=0)=>({code,indent,parameters});
 function message(text,indent=0){
  const lines=[];for(const paragraph of String(text).split('\n')){let line='';for(const word of paragraph.split(/\s+/).filter(Boolean)){const chars=Array.from(word);while(chars.length>32){if(line){lines.push(line);line='';}lines.push(chars.splice(0,32).join(''));}const rest=chars.join('');if(Array.from(line+(line?' ':'')+rest).length>32){lines.push(line);line='';}line+=(line?' ':'')+rest;}lines.push(line);}
  const commands=[];for(let i=0;i<lines.length;i+=4)commands.push(cmd(101,['',0,0,2],indent),...lines.slice(i,i+4).map(line=>cmd(401,[line],indent)));return commands;
 }
 function integer(value,min,max,label){if(!Number.isInteger(value)||value<min||value>max)throw Error(`${label}: use um inteiro entre ${min} e ${max}.`);return value;}
 function record(data,table,id){if(!Number.isInteger(id)||id<1||!data[table]?.[id])throw Error('Selecione um item existente.');return data[table][id];}
 function compile(id,options,data){
  if(!recipes.some(r=>r.id===id))throw Error('Modelo desconhecido.');
  const page=list=>({priorityType:0,trigger:0,list:[...list,cmd(0)]}),done=list=>({...page(list),conditions:{selfSwitchValid:true,selfSwitchCh:'A'}});
  if(id==='choices'){
   const texts=[options.first,options.second,options.firstReply,options.secondReply];
   if(texts.some(t=>typeof t!=='string'||!t.trim()||t.length>120))throw Error('Preencha as opções e respostas com até 120 caracteres.');
   if([options.first,options.second].some(t=>Array.from(t).length>32))throw Error('Use até 32 caracteres em cada opção.');
   return [page([cmd(102,[[options.first,options.second],-2,0,2,0]),cmd(402,[0,options.first]),...message(options.firstReply,1),cmd(402,[1,options.second]),...message(options.secondReply,1),cmd(404)])];
  }
  if(id==='light')return [page([cmd(223,[[-68,-68,0,68],60,true]),cmd(123,['A',0])]),done([cmd(223,[[0,0,0,0],60,true]),cmd(123,['A',1])])];
  const item=record(data,'items',options.itemId),amount=integer(options.amount,1,99,'Quantidade');
  if(id==='gather')return [page([cmd(126,[options.itemId,0,0,amount]),...message(`Você coletou ${amount} × ${item.name}.`),cmd(123,['A',0])]),done(message('Este recurso já foi coletado.'))];
  const v=options.variableId;
  if(!Number.isInteger(v)||v<1||v>=(data.system?.variables?.length||0))throw Error('Selecione uma variável auxiliar existente. Seu valor será substituído pela contagem do material.');
  const reward=id==='craft'?record(data,'items',options.productId):null;
  if(id==='craft'&&options.productId===options.itemId)throw Error('Escolha um produto diferente do material.');
  const gold=id==='delivery'?integer(options.gold,1,999999,'Recompensa em ouro'):0;
  const list=[cmd(122,[v,v,0,3,0,options.itemId,0]),cmd(111,[1,v,0,amount,1]),cmd(126,[options.itemId,1,0,amount],1)];
  if(id==='craft')list.push(cmd(126,[options.productId,0,0,1],1),...message(`Você fabricou ${reward.name}.`,1));
  else list.push(cmd(125,[0,0,gold],1),cmd(123,['A',0],1),...message(`Entrega concluída! Recompensa: ${gold} de ouro.`,1));
  list.push(cmd(411),...message(`Você precisa de ${amount} × ${item.name}.`,1),cmd(412));
  return id==='craft'?[page(list)]:[page(list),done(message('Obrigado! A entrega já foi recompensada.'))];
 }
 function insert(app,map,id,options){
  const manager=app.eventManager;
  if(!map||manager.currentMap!==map||app.projectController?.tilemapManager?.currentMap!==map)throw Error('O mapa mudou. Abra os modelos novamente.');
  integer(options.x,0,map.width-1,'Posição X');integer(options.y,0,map.height-1,'Posição Y');
  if(manager.getEventAt(options.x,options.y))throw Error('Já existe um evento nessa posição.');
  if(typeof options.name!=='string'||!options.name.trim()||options.name.length>64)throw Error('Informe um nome de até 64 caracteres.');
  const pages=compile(id,options,app.databaseManager.data).map(p=>manager.makeDefaultEventPage(p));
  const event=manager.makeQuickEvent(options.x,options.y,options.name.trim(),pages);
  if(!manager.commitQuickEvent(event,map))throw Error('Não foi possível inserir o modelo. Nenhum evento foi substituído.');
  return event;
 }
 function open(app){
  if(root.document.getElementById('diana-event-recipes'))return;
  const map=app.eventManager?.currentMap,project=app.projectController?.getCurrentProject?.();if(!map||!project)return;
  const doc=root.document,el=(tag,text)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
  const overlay=el('div');overlay.id='diana-event-recipes';overlay.className='rr-modal-overlay diana-creation-modal';
  const modal=el('section');modal.className='rr-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Modelos de eventos');overlay.append(modal);
  const header=el('div','Modelos de eventos');header.className='rr-modal-header';const body=el('div');body.className='rr-modal-body';const footer=el('div');footer.className='rr-modal-footer';modal.append(header,body,footer);
  const kind=el('select');kind.setAttribute('aria-label','Modelo');for(const r of recipes){const o=el('option',r.label);o.value=r.id;kind.append(o);}kind.value='delivery';body.append(kind);
  const form=el('div'),preview=el('div'),error=el('p');error.setAttribute('role','alert');preview.setAttribute('aria-live','polite');body.append(form,preview,error);
  let values,previewed=null,keys;const fields={};
  const row=(label,node,key,value)=>{node.value=value;node.setAttribute('aria-label',label);const wrap=el('label');wrap.className='diana-classic-field';wrap.append(el('span',label),node);form.append(wrap);fields[key]=node;return node;};
  const input=(label,key,value,type='text')=>{const n=el('input');n.type=type;return row(label,n,key,value);};
  const choose=(label,key,items)=>{const n=el('select'),blank=el('option','Selecione…');blank.value='';n.append(blank);for(const [id,name] of items){const o=el('option',`#${id} · ${name||'Sem nome'}`);o.value=id;n.append(o);}return row(label,n,key,'');};
  const read=()=>Object.fromEntries(Object.entries(fields).map(([k,n])=>[k,['x','y','itemId','amount','variableId','productId','gold'].includes(k)?(String(n.value).trim()===''?NaN:Number(n.value)):n.value]));
  const invalidate=()=>{previewed=null;apply.disabled=true;preview.replaceChildren();error.textContent='';};
  const render=()=>{form.replaceChildren();for(const k of Object.keys(fields))delete fields[k];invalidate();const recipe=recipes.find(r=>r.id===kind.value);form.append(el('p',recipe.help));
   const position=root.DianaClassicEditor?.initialPosition(app.eventManager,map,app.databaseManager.data.system)||{x:0,y:0};
   input('Nome','name',recipe.label).maxLength=64;for(const [key,max] of [['x',map.width-1],['y',map.height-1]]){const n=input(`Posição ${key.toUpperCase()}`,key,position[key],'number');n.min=0;n.max=max;n.step=1;}
   if(['delivery','craft','gather'].includes(kind.value)){const items=app.databaseManager.data.items.map((e,i)=>e?[i,e.name]:null).filter(Boolean);choose('Item / material','itemId',items);const n=input('Quantidade','amount',1,'number');n.min=1;n.max=99;n.step=1;if(kind.value==='craft')choose('Produto (1 unidade)','productId',items);}
   if(['delivery','craft'].includes(kind.value)){choose('Variável auxiliar','variableId',app.databaseManager.data.system.variables.map((name,i)=>i?[i,name]:null).filter(Boolean));form.append(el('p','Escolha uma variável reservada para esta operação: ela receberá a contagem atual de itens. Os switches locais pertencem apenas ao evento criado.'));}
   if(kind.value==='delivery'){const n=input('Ouro da recompensa','gold',20,'number');n.min=1;n.max=999999;n.step=1;}
   if(kind.value==='choices')for(const [label,key,value] of [['Primeira opção','first','Sobre a vila'],['Segunda opção','second','Até logo'],['Primeira resposta','firstReply','A Clareira guarda muitas histórias.'],['Segunda resposta','secondReply','Volte quando quiser!']])input(label,key,value).maxLength=120;
   form.append(el('p','O modelo será um evento invisível, acionado por Enter no chão. Depois você pode editar sua imagem, páginas e comandos no editor de eventos.'));
  };
  const btn=(label,action)=>{const b=el('button',label);b.type='button';b.className='rr-btn-secondary';b.onclick=action;footer.append(b);return b;};
  const close=()=>{keys?.dispose();overlay.remove();};btn('Cancelar',close);
  btn('Visualizar modelo',()=>{try{values=read();const pages=compile(kind.value,values,app.databaseManager.data);integer(values.x,0,map.width-1,'Posição X');integer(values.y,0,map.height-1,'Posição Y');if(!values.name.trim())throw Error('Informe o nome.');if(app.eventManager.getEventAt(values.x,values.y))throw Error('Já existe um evento nessa posição.');previewed=JSON.stringify({id:kind.value,values});preview.replaceChildren(el('p',`${pages.length} página(s), ${pages.reduce((n,p)=>n+p.list.length,0)} comandos. Posição (${values.x}, ${values.y}). O original do mapa é preservado até você inserir.`));const details=el('details'),summary=el('summary','Ver comandos gerados'),code=el('pre',JSON.stringify(pages,null,2));details.append(summary,code);preview.append(details);error.textContent='';apply.disabled=false;}catch(e){invalidate();error.textContent=e.message;}});
  const apply=btn('Inserir no mapa',()=>{try{const current=read();if(previewed!==JSON.stringify({id:kind.value,values:current}))throw Error('Visualize novamente o modelo antes de inserir.');if(app.projectController.getCurrentProject()!==project)throw Error('O projeto mudou. Abra os modelos novamente.');const event=insert(app,map,kind.value,current);app.uiManager?.updateStatus?.(`Evento ${event.name} criado. Desfazer remove a criação; salve para gravar.`);close();}catch(e){error.textContent=e.message;}});apply.disabled=true;
  form.addEventListener('input',invalidate);form.addEventListener('change',invalidate);kind.onchange=render;render();doc.body.append(overlay);keys=root.RRKeyboardNavigation?.modal?.(overlay,{container:()=>modal,onEscape:close});keys?.enter(kind);
 }
 const api={recipes,compile,insert,open};root.DianaEventRecipes=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
