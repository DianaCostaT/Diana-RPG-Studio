/* Project folders use an editor-owned browser, never the crashing NW.js native chooser. */
(function(root){
    'use strict';
    async function listFolders(fs,directory){
        const entries=await fs.promises.readdir(directory,{withFileTypes:true});
        return entries.filter(entry=>entry.isDirectory()).map(entry=>entry.name).sort((a,b)=>a.localeCompare(b,'pt-BR',{numeric:true}));
    }
    function createFolderService({fs,path,document,home}){
        return {pickFolder({title='Escolha a pasta do projeto',initialDirectory=''}={}){
            return new Promise(resolve=>{
                const previous=document.activeElement;
                const overlay=document.createElement('div');overlay.id='diana-folder-dialog';overlay.className='rr-modal-overlay';overlay.style.zIndex='20000';
                const modal=document.createElement('div');modal.className='rr-modal';modal.style.cssText='width:min(680px,94vw);height:min(520px,85vh);display:flex;flex-direction:column';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label',title);
                const heading=document.createElement('div');heading.className='rr-modal-header';heading.textContent=title;
                const body=document.createElement('div');body.className='rr-modal-body';body.style.cssText='display:flex;flex-direction:column;gap:10px;flex:1;min-height:0';
                const row=document.createElement('div');row.style.cssText='display:flex;gap:8px';
                const input=document.createElement('input');input.id='diana-folder-path';input.className='database-field-value';input.style.flex='1';input.setAttribute('aria-label','Caminho da pasta');
                const button=(id,text,action)=>{const node=document.createElement('button');node.id=id;node.type='button';node.className='rr-btn-secondary';node.textContent=text;node.addEventListener('click',action);return node;};
                let current='',settled=false,generation=0;
                const up=button('diana-folder-up','↑ Pasta acima',()=>navigate(path.dirname(current||home)));
                const go=button('diana-folder-go','Ir',()=>navigate(input.value));row.append(input,go);
                const navigation=document.createElement('div');navigation.style.cssText='display:flex;gap:8px';navigation.append(up,button('diana-folder-home','Minha pasta',()=>navigate(home)));
                const status=document.createElement('div');status.id='diana-folder-status';status.setAttribute('role','status');status.style.cssText='font-size:12px;word-break:break-all';
                const list=document.createElement('div');list.id='diana-folder-list';list.style.cssText='display:flex;flex-direction:column;gap:3px;flex:1;min-height:100px;overflow:auto';list.setAttribute('aria-label','Subpastas');
                const footer=document.createElement('div');footer.className='rr-modal-footer';
                const choose=button('diana-folder-choose','Usar esta pasta',()=>finish(current));choose.className='rr-button-primary';choose.disabled=true;
                footer.append(button('diana-folder-cancel','Cancelar',()=>finish(null)),choose);body.append(row,navigation,status,list);modal.append(heading,body,footer);overlay.append(modal);document.body.append(overlay);
                const keyTarget=document.defaultView||document;
                const escape=event=>{if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();finish(null);}};
                keyTarget.addEventListener('keydown',escape,true);
                const modalKeys=root.RRKeyboardNavigation?.modal?.(overlay,{container:()=>modal});
                modalKeys?.enter(input);
                function finish(value){if(settled)return;settled=true;keyTarget.removeEventListener('keydown',escape,true);modalKeys?.dispose();overlay.remove();previous?.focus?.();resolve(value);}
                async function navigate(value){
                    const request=++generation;choose.disabled=true;
                    try{
                        const target=String(value||'').trim();if(!path.isAbsolute(target))throw new Error('Informe um caminho absoluto.');
                        const folder=path.resolve(target),names=await listFolders(fs,folder);
                        if(settled||request!==generation)return;
                        current=folder;input.value=folder;status.textContent=folder;choose.disabled=false;up.disabled=path.dirname(folder)===folder;
                        list.replaceChildren();
                        for(const name of names){const item=button('',name,()=>navigate(path.join(folder,name)));item.style.textAlign='left';list.append(item);}
                        if(!names.length){const empty=document.createElement('span');empty.textContent='Esta pasta não contém subpastas.';list.append(empty);}
                    }catch(error){if(!settled&&request===generation)status.textContent='Não foi possível ler esta pasta: '+error.message;}
                }
                input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();event.stopPropagation();navigate(input.value);}});
                input.value=initialDirectory||home;
                navigate(fs.existsSync(input.value)?input.value:home);input.focus();
            });
        }};
    }
    function install({ProjectController,UIManager,service,fs,path,home,document,alert}){
        const originalDialog=UIManager.prototype.showNewProjectDialog;
        UIManager.prototype.showNewProjectDialog=function(options){
            const answer=originalDialog.call(this,options);
            const host=document.getElementById('rr-new-project-dialog'),body=host?.querySelector('.rr-modal-body');
            if(!body)return answer;
            const label=document.createElement('label');label.htmlFor='diana-project-folder';label.textContent='Salvar o projeto em';
            const row=document.createElement('div');row.style.cssText='display:flex;gap:8px;align-items:center';
            const input=document.createElement('input');input.id='diana-project-folder';input.type='text';input.className='database-field-value';input.style.flex='1';input.value=path.join(home,'Documents','Diana Projects');
            const browse=document.createElement('button');browse.id='diana-project-browse';browse.type='button';browse.className='rr-btn-secondary';browse.textContent='Procurar…';
            const hint=document.createElement('div');hint.id='diana-project-folder-hint';hint.style.cssText='font-size:12px;color:var(--color-text-muted);margin-top:6px';hint.textContent='Uma subpasta com o nome do projeto será criada neste local.';hint.setAttribute('role','status');
            browse.addEventListener('click',async()=>{
                browse.disabled=true;
                try{const chosen=await service.pickFolder({title:'Onde salvar o projeto Diana?',initialDirectory:input.value});if(chosen)input.value=chosen;}
                catch(error){hint.textContent='Não foi possível selecionar a pasta: '+error.message+'. Você pode digitar o caminho acima.';}
                finally{browse.disabled=false;}
            });
            row.append(input,browse);body.append(label,row,hint);
            return answer.then(choice=>choice?{...choice,parentPath:input.value.trim()}:null);
        };
        ProjectController.prototype.newProject=async function(){
            if(this._dianaProjectBusy)return false;
            this._dianaProjectBusy=true;
            try{
                if(!await this.confirmUnsavedChanges())return false;
                const choice=await this.uiManager.showNewProjectDialog({validate:name=>this.projectManager.isSafeProjectName(name)?'':'Use um nome de projeto válido, sem separadores de pasta.'});
                if(!choice)return false;
                const parent=choice.parentPath;
                if(!parent||!path.isAbsolute(parent))throw new Error('Informe um caminho absoluto para a pasta do projeto.');
                fs.mkdirSync(parent,{recursive:true});
                const target=path.join(parent,choice.name);
                this.uiManager.updateStatus('Criando projeto…');
                if(!await this.projectManager.createNewProject(target,choice.name,{blank:true}))throw new Error(this.projectManager.lastCreateError||'Não foi possível criar os arquivos do projeto.');
                await this.openProjectAtPath(target);
                return this.currentProject?.path===target;
            }catch(error){
                this.uiManager.updateStatus('Não foi possível criar o projeto.');
                await alert('Não foi possível criar o projeto.\n\n'+error.message,{title:'Criar projeto',kind:'error'});return false;
            }finally{this._dianaProjectBusy=false;}
        };
        ProjectController.prototype.openProject=async function(){
            if(this._dianaProjectBusy)return false;
            this._dianaProjectBusy=true;
            try{
                if(!await this.confirmUnsavedChanges())return false;
                const selected=await service.pickFolder({title:'Abrir projeto Diana',initialDirectory:this.currentProject?.path||home});
                if(!selected)return false;
                await this.openProjectAtPath(selected);return this.currentProject?.path===selected;
            }catch(error){await alert('Não foi possível abrir o projeto.\n\n'+error.message,{title:'Abrir projeto',kind:'error'});return false;}
            finally{this._dianaProjectBusy=false;}
        };
    }
    const api={createFolderService,install,listFolders};if(typeof module!=='undefined'&&module.exports)module.exports=api;
    root.DianaWindowsFolders=api;
    if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{
        if(typeof process==='undefined'||process.platform!=='win32')return;
        const fs=require('fs'),path=require('path');
        const service=createFolderService({fs,path,document,home:require('os').homedir()});
        install({ProjectController,UIManager,service,fs,path,home:require('os').homedir(),document,alert:(...args)=>RRDialog.alert(...args)});
    });
})(globalThis);
