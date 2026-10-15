/* Classic, paged 2D battle authoring over the shared Reactor data contract. */
(function(root){
 'use strict';
 const defaults=[['idle','Normal (parado)'],['attack','Ataque — mão direita'],['attackLeft','Ataque — mão esquerda'],['skill','Habilidade'],['dead','Nocaute'],['damage','Dano'],['abnormal','Estado alterado'],['guard','Defesa'],['walk','Caminhar — esquerda'],['walkRight','Caminhar — direita'],['victory','Vitória'],['item','Item']];
 const poseNames=graphic=>[...new Set([...defaults.map(([id])=>id),...Object.keys(graphic?.poses||{})])];
 const label=id=>defaults.find(row=>row[0]===id)?.[1]||id;
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const button=(text,fn)=>{const b=el('button','rr-btn-secondary',text);b.type='button';b.onclick=fn;return b;};
 function field(host,title,input){const row=el('label','diana-classic-field');row.append(el('span','',title),input);host.append(row);return input;}
 function select(values,value,change){const s=el('select','database-field-value');for(const [id,text] of values){const o=el('option','',text);o.value=id;s.append(o);}s.value=value;s.onchange=()=>change(s.value);return s;}
 function number(host,title,value,change,min=0,max=816){const n=el('input','database-field-value');n.type='number';n.step=1;n.min=min;n.max=max;n.value=value;n.onchange=()=>{const v=n.valueAsNumber;if(Number.isInteger(v)&&v>=min&&v<=max){n.setCustomValidity('');change(v);}else{n.setCustomValidity(`Informe um inteiro entre ${min} e ${max}.`);n.reportValidity();}};return field(host,title,n);}
 function install(){
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
  const bar=document.getElementById('diana-workspace');
  if(bar){const sequences=bar.querySelector('[data-diana-action=animations]');
   const poses=button('Animações 2',()=>window.reactor?.openDatabase('dianaPoses'));poses.dataset.dianaAction='poses';
   const screen=button('Tela de batalha',()=>window.reactor?.openDatabase('dianaBattleScreen'));screen.dataset.dianaAction='battle-screen';
   poses.disabled=screen.disabled=!window.reactor?.projectController?.getCurrentProject();
   sequences.before(poses,screen);
  }
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
  preview(canvas,g,motion,kind){const item={canvas,g,motion,kind,image:null};this.previews.push(item);this.image(g).then(img=>{if(!this.dead&&canvas.isConnected)item.image=img;});}
  animate(){if(this.raf||this.dead||document.hidden)return;const draw=now=>{this.raf=0;if(this.dead||!this.host.isConnected||document.hidden)return;const viewport=this.host.getBoundingClientRect();for(const p of this.previews){if(!p.canvas.isConnected)continue;
    const rect=p.canvas.getBoundingClientRect();if(rect.bottom<viewport.top||rect.top>viewport.bottom||rect.right<viewport.left||rect.left>viewport.right)continue;
    const w=p.canvas.width,h=p.canvas.height,f=p.image?ReactorBattleData.graphicFrame(p.g,p.image.width,p.image.height,p.motion,Math.floor(now*60/1000*this.speed),p.kind==='actors'?-90:90):null;
    const stamp=f?[f.x,f.y,f.width,f.height,w,h].join(','):'missing';if(p.stamp===stamp)continue;p.stamp=stamp;
    const c=p.canvas.getContext('2d');c.clearRect(0,0,w,h);c.fillStyle='#26384a';c.fillRect(0,0,w,h);
    if(p.image){const scale=Math.min((w-12)/f.width,(h-12)/f.height,3);c.imageSmoothingEnabled=false;c.drawImage(p.image,f.x,f.y,f.width,f.height,(w-f.width*scale)/2,h-6-f.height*scale,f.width*scale,f.height*scale);}
    else{c.fillStyle='#d3dce7';c.font='12px Segoe UI';c.textAlign='center';c.fillText(p.g.type==='model'?'Modelo 3D':'Sem imagem',w/2,h/2);}
   }this.raf=requestAnimationFrame(draw);};this.raf=requestAnimationFrame(draw);}
  poses(){
   let kind='actors',id=this.db.data.actors.find(Boolean)?.id,page=0;
   const shell=el('div','diana-classic diana-animations2');this.host.append(shell);
   const draw=()=>{this.previews=[];shell.replaceChildren();
    const top=el('div','diana-classic-top');shell.append(top);
    field(top,'Grupo',select([['actors','Aliados'],['enemies','Inimigos']],kind,v=>{kind=v;id=this.db.data[kind].find(Boolean)?.id;page=0;draw();}));
    const records=(this.db.data[kind]||[]).filter(Boolean);if(!records.length){shell.append(el('p','','Nenhum registro. Crie um personagem ou inimigo no banco de dados.'));return;}
    if(!records.some(r=>r.id===id))id=records[0].id;
    field(top,'Nome',select(records.map(r=>[r.id,String(r.id).padStart(4,'0')+' '+r.name]),String(id),v=>{id=Number(v);page=0;draw();}));
    field(top,'Velocidade da prévia',select([['0.5','Lenta'],['1','Normal'],['2','Rápida']],String(this.speed),v=>this.speed=Number(v)));
    const g=this.graphic(kind,id),resources=el('fieldset','diana-classic-resources');resources.append(el('legend','','Gráfico de batalha 2D'));
    const modes=[['sv','Spritesheet de batalha'],['character','Spritesheet de personagem'],['static','Imagem / recortes livres']];
    field(resources,'Formato',select(modes,g.type,v=>{this.setGraphic(kind,id,{mode:v,name:'',folder:v==='character'?'characters':v==='sv'?'sv_actors':kind==='actors'?'sv_actors':'enemies'});draw();}));
    resources.append(el('span','',g.name||'Nenhuma imagem selecionada'),button('Definir gráfico…',()=>{
     const path=require('path'),folder=g.folder||'sv_actors',dir=path.join(this.parent.currentProject.path,'img',folder),files=RRAssetFiles.listNames(dir,['.png']);
     this.parent.showImagePicker('Gráfico de batalha',files,(name,index)=>{if(this.dead)return;this.setGraphic(kind,id,{mode:g.type==='model'?'static':g.type,name,index:index||0,folder});draw();},name=>RRAssetFiles.urlFor(dir,name,['.png']),g.name,{allowNone:true,...(g.type==='character'?{sheetType:'character',currentIndex:g.index||0}:{})});
    }));shell.append(resources);
    const tabs=el('div','diana-classic-tabs');tabs.append(button('Armas',()=>this.parent.openDatabase('weapons')),el('strong','','Poses'),button('Tipos / sequências de animação',()=>this.parent.openDatabase('actionSequences')));shell.append(tabs);
    const names=poseNames(g),pages=el('div','diana-pose-pages');shell.append(pages);page=Math.min(page,Math.floor((names.length-1)/8));
    for(let p=0;p<Math.ceil(names.length/8);p++){const b=button(`${p*8+1}–${Math.min(p*8+8,names.length)}`,()=>{page=p;draw();});b.setAttribute('aria-pressed',String(page===p));pages.append(b);}
    const grid=el('div','diana-pose-grid');shell.append(grid);
    names.slice(page*8,page*8+8).forEach((name,index)=>{const card=el('fieldset','diana-pose-card');card.dataset.pose=name;card.append(el('legend','',String(page*8+index+1)));
     const canvas=el('canvas','');canvas.width=128;canvas.height=92;card.append(canvas);this.preview(canvas,g,name,kind);
     card.append(button('Definir…',()=>this.editPose(kind,id,name,draw)),el('div','diana-pose-name',label(name)),el('small','',g.poses?.[name]?`${g.poses[name].frames.length} quadros`:'Movimento padrão'));grid.append(card);
    });
    const newRow=el('div','diana-classic-top'),name=el('input','database-field-value');name.placeholder='Nome da nova pose';name.setAttribute('aria-label','Nome da nova pose');
    newRow.append(name,button('Adicionar pose…',()=>{const key=name.value.trim();if(!key||names.includes(key)){name.setCustomValidity('Informe um nome novo.');name.reportValidity();return;}name.setCustomValidity('');this.editPose(kind,id,key,()=>{page=Math.floor((poseNames(this.graphic(kind,id)).length-1)/8);draw();});}));shell.append(newRow);
    shell.append(el('p','diana-help','Oito poses por página, sem limite de páginas. Definir permite escolher recortes, ordem, duração, âncoras e repetição. OK/Aplicar do banco salva; Cancelar desfaz a sessão.'));
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
   const body=el('div','rr-modal-body'),canvas=el('canvas','diana-pose-large');canvas.width=240;canvas.height=150;body.append(canvas);modal.append(body);document.body.append(overlay);
   const card=this.presentation.rectanglePoseEditor(body,draft,value=>draft=value,(pose,tick)=>{
    const c=canvas.getContext('2d'),f=ReactorBattleData.graphicFrame({...g,poses:draft},image.width,image.height,pose,tick,kind==='actors'?-90:90),scale=Math.min(220/f.width,130/f.height,3);c.clearRect(0,0,240,150);c.imageSmoothingEnabled=false;c.drawImage(image,f.x,f.y,f.width,f.height,120-f.width*scale/2,145-f.height*scale,f.width*scale,f.height*scale);
   },()=>image);card.open=true;
   const close=()=>{card.posePreview.dispose();keys?.dispose();overlay.remove();};
   const footer=el('div','rr-modal-footer');footer.append(button('Cancelar',close),button('Aplicar pose',async()=>{
    const errors=ReactorBattleData.validateGraphicPoses(draft);
    if(errors.length){await RRDialog.alert('Há quadros inválidos. Corrija os recortes antes de aplicar a pose.',{title:'Pose de combate',kind:'warning'});return;}
    this.setGraphic(kind,id,{mode:g.type,poses:draft});close();refresh();
   }));modal.append(footer);
   const keys=root.RRKeyboardNavigation?.modal?.(overlay,{container:()=>modal,onEscape:close});keys?.enter();
   this.parent.registerDetailModal(overlay,close);
  }
  screen(){
   const shell=el('div','diana-classic diana-battle-screen');this.host.append(shell);const system=this.db.data.system;
   const layout=el('div','diana-screen-columns'),controls=el('div'),right=el('div');layout.append(controls,right);shell.append(layout);
   const group=(host,title)=>{const box=el('fieldset','diana-screen-group');box.append(el('legend','',title));host.append(box);return box;};
   const mode=group(controls,'Sistema de batalha');
   field(mode,'Apresentação',select([['side','Lateral (2D)'],['front','Frontal (2D)']],system.optSideView?'side':'front',v=>{system.optSideView=v==='side';this.changed();draw();}));
   field(mode,'Turnos',select([['0','Por turnos'],['1','Tempo ativo'],['2','Tempo com espera']],String(system.battleSystem||0),v=>{system.battleSystem=Number(v);this.changed();}));
   const options=group(controls,'Mensagens');
   for(const [key,title] of [['startMessages','Anunciar inimigos'],['escapeMessages','Mostrar mensagens de fuga']]){const box=el('input');box.type='checkbox';box.checked=this.settings()[key]!==false;box.onchange=()=>{this.settings()[key]=box.checked;this.changed();};field(options,title,box);}
   const commands=group(controls,'Nomes dos comandos');system.terms||={};system.terms.commands||=[];
   for(const [index,title] of [[0,'Lutar'],[1,'Fugir'],[2,'Atacar'],[3,'Defender'],[4,'Item']]){const input=el('input','database-field-value');input.value=system.terms.commands[index]||title;input.onchange=()=>{system.terms.commands[index]=input.value;this.changed();draw();};field(commands,title,input);}
   const positions=group(controls,'Posição dos aliados — pixels (816 × 624)');
   const settings=this.settings(),stored=settings.screen2d?.actorHomes||{};
   for(let i=0;i<4;i++){const row=el('div','diana-position-row');row.append(el('strong','',String(i+1)));positions.append(row);
    for(const axis of ['x','y'])number(row,axis.toUpperCase(),stored[i]?.[axis]??(axis==='x'?600+i*32:280+i*48),v=>{const screen=settings.screen2d||={};const homes=screen.actorHomes||={};homes[i]={x:600+i*32,y:280+i*48,...homes[i],[axis]:v};this.changed();draw();},0,axis==='x'?816:624);
   }
   const preview=group(right,'Prévia de composição 2D');const canvas=el('canvas','diana-battle-composition');canvas.width=816;canvas.height=624;preview.append(canvas);
   preview.append(el('p','diana-help','Posições de referência em 816 × 624, ajustadas à resolução do jogo. Esta composição esquemática não executa uma batalha.'));
   right.append(button('Grupos de inimigos e fundos…',()=>this.parent.openDatabase('troops')),button('Animações 2 — Poses…',()=>this.parent.openDatabase('dianaPoses')));
   const draw=()=>{const c=canvas.getContext('2d');c.fillStyle='#182538';c.fillRect(0,0,816,624);c.strokeStyle='#344459';for(let x=0;x<816;x+=48){c.beginPath();c.moveTo(x,0);c.lineTo(x,500);c.stroke();}for(let y=0;y<500;y+=48){c.beginPath();c.moveTo(0,y);c.lineTo(816,y);c.stroke();}
    c.font='20px Segoe UI';c.fillStyle='#d7e5f5';c.fillText('Inimigos',100,160);
    if(system.optSideView)for(let i=0;i<4;i++){const p=this.settings().screen2d?.actorHomes?.[i]||{x:600+i*32,y:280+i*48};c.fillStyle='#91a4e8';c.fillRect(p.x-12,p.y-40,24,40);c.fillStyle='#fff';c.fillText(String(i+1),p.x-5,p.y-48);}
    c.fillStyle='#263851';c.fillRect(12,500,792,112);c.strokeStyle='#94a9c8';c.strokeRect(12,500,792,112);c.fillStyle='#fff';
    c.fillText(system.terms.commands[0]||'Lutar',30,535);c.fillText(system.terms.commands[1]||'Fugir',30,575);c.fillText('Aliado       PV 100 / 100       PM 30 / 30',250,550);
   };draw();
  }
  dispose(){this.dead=true;cancelAnimationFrame(this.raf);document.removeEventListener('visibilitychange',this.visibility);this.previews=[];this.images.clear();}
 }
 root.DianaBattle2D={poseNames,defaults};if(typeof module!=='undefined')module.exports=root.DianaBattle2D;
 if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',install);
})(globalThis);
