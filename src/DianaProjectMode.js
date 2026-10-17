/* Project-scoped authoring profiles. Hiding tools never rewrites game data. */
(function(root){
 'use strict';
 const modeOf=project=>project?.diana?.mode==='2d'?'2d':'hybrid';
 function install(){
  const dialog=UIManager.prototype.showNewProjectDialog;
  UIManager.prototype.showNewProjectDialog=function(options){
   const result=dialog.call(this,options),body=document.querySelector('#rr-new-project-dialog .rr-modal-body');
   if(!body)return result;
   const advanced=document.createElement('details');advanced.className='diana-project-mode-choice';
   const summary=document.createElement('summary');summary.textContent='Opções avançadas de modo';
   const label=document.createElement('label');label.htmlFor='diana-project-mode';label.textContent='Ferramentas do projeto';
   const select=document.createElement('select');select.id='diana-project-mode';select.className='database-field-value';
   for(const [value,text] of [['2d','Inteiramente 2D — padrão'],['hybrid','2D + 3D — avançado']]){const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);}
   const help=document.createElement('p');help.className='diana-help';help.textContent='Novos projetos usam o modo 2D por padrão. O modo avançado mantém as ferramentas 3D disponíveis; mudar a interface não converte nem remove dados.';
   advanced.append(summary,label,select,help);
   const defaultMode=document.createElement('p');defaultMode.className='diana-help';defaultMode.textContent='Novo projeto: Inteiramente 2D (padrão).';
   body.prepend(defaultMode,advanced);
   return result.then(choice=>choice?{...choice,mode:select.value}:null);
  };
  const open=ProjectController.prototype.openProjectAtPath;
  ProjectController.prototype.openProjectAtPath=async function(...args){const result=await open.apply(this,args);apply(this.currentProject);return result;};
  const setProject=DatabaseEditorUI.prototype.setCurrentProject;
  DatabaseEditorUI.prototype.setCurrentProject=function(project){const result=setProject.call(this,project);apply(project);return result;};
  const createSection=EventCommandPicker.prototype.createSection;
  EventCommandPicker.prototype.createSection=function(section){const node=createSection.call(this,section);if(section.title==='3D')node.dataset.diana3d='true';return node;};
  const nav=DatabaseEditorUI.prototype.openDatabase;
  DatabaseEditorUI.prototype.openDatabase=function(type,...args){if(document.documentElement.dataset.dianaMode==='2d'&&['reactor3d','structures'].includes(type))return;return nav.call(this,type,...args);};
  const prefs=DatabaseActionSequenceEditor.prototype.loadPrefs;
  DatabaseActionSequenceEditor.prototype.loadPrefs=function(...args){const result=prefs.apply(this,args);if(document.documentElement.dataset.dianaMode==='2d'){if(this.previewProjection!=='2d-vertical')this.previewProjection='2d';if(this.scene?.kind==='troop')this.scene={kind:'grid'};}return result;};
  const disabledOptions=new WeakMap();
  const mark=()=>{
   for(const selector of ['#map-3d-checkbox','#map-3d-physics'])document.querySelector(selector)?.closest('.map-props-card')?.setAttribute('data-diana3d','true');
   for(const option of document.querySelectorAll('option[value=model],option[value="3d"],option[value=room],.rr-sequence-editor option[value^="troop:"]')){
    if(document.documentElement.dataset.dianaMode==='2d'){if(!disabledOptions.has(option))disabledOptions.set(option,option.disabled);option.hidden=true;option.disabled=true;}
    else if(disabledOptions.has(option)){option.hidden=false;option.disabled=disabledOptions.get(option);disabledOptions.delete(option);}
   }
   for(const box of document.querySelectorAll('.graphic-preview-box')){const corner=box._rr3dSlot?.corner;if(corner)corner.dataset.diana3d='true';}
   for(const section of document.querySelectorAll('.rr-battle-room-settings'))section.parentElement.dataset.diana3d='true';
   for(const head of document.querySelectorAll('[data-section-key="physics-3d-maps"],[data-section-key="swimming-3d-maps"]'))head.closest('.database-section')?.setAttribute('data-diana3d','true');
   for(const input of document.querySelectorAll('.image-3d-checkbox'))input.closest('label')?.setAttribute('data-diana3d','true');
   document.querySelector('#effekseer-rotation-sphere')?.parentElement?.parentElement?.setAttribute('data-diana3d','true');
  };
  new MutationObserver(mark).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('diana-mode-changed',mark);
  const workspace=document.getElementById('diana-workspace');
  if(workspace){const options=document.createElement('details');options.id='diana-mode-options';options.className='diana-mode-options';
   const summary=document.createElement('summary');summary.textContent='Projeto 2D';summary.title='Opções avançadas de ferramentas do projeto';
   const badge=document.createElement('select');badge.id='diana-mode-badge';badge.setAttribute('aria-label','Modo de edição do projeto');badge.title='Troca as ferramentas visíveis; não converte nem remove dados do jogo.';
   for(const [value,text] of [['2d','Projeto 2D'],['hybrid','Projeto 2D + 3D — avançado']]){const option=document.createElement('option');option.value=value;option.textContent=text;badge.append(option);}
   options.append(summary,badge);workspace.append(options);
   badge.onchange=async()=>{const project=window.reactor?.projectController?.currentProject;if(!project)return;
    try{const manager=window.reactor.projectManager,file=manager.path.join(project.path,'project.rpgreactor'),data=JSON.parse(manager.fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
     data.diana={...data.diana,mode:badge.value};manager._writeFileAtomic(manager.fs,file,JSON.stringify(data,null,2),'utf8');project.diana=data.diana;apply(project);
    }catch(error){apply(project);await RRDialog.alert('Não foi possível salvar o modo do projeto.\n'+error.message,{title:'Modo de edição',kind:'error'});}
   };
  }
  apply(null);mark();
 }
 function apply(project){
  const mode=project?modeOf(project):'2d';document.documentElement.dataset.dianaMode=mode;
  const badge=document.getElementById('diana-mode-badge');if(badge){badge.value=mode;badge.disabled=!project;}
  const summary=document.querySelector('#diana-mode-options summary');if(summary)summary.textContent=mode==='hybrid'?'Projeto 2D + 3D — avançado':'Projeto 2D';
  document.dispatchEvent(new Event('diana-mode-changed'));
 }
 const api={modeOf,apply};root.DianaProjectMode=api;if(typeof module!=='undefined')module.exports=api;
 if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',install);
})(globalThis);
