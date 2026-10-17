/* Diana's original desktop workspace; existing editor commands remain authoritative. */
document.addEventListener('DOMContentLoaded',()=>{
    // Open an available sheet instead of leaving a new author on an empty A tab.
    if(typeof TilesetPaletteViewer!=='undefined'){
        const load=TilesetPaletteViewer.prototype.loadTilesetForMap;
        TilesetPaletteViewer.prototype.loadTilesetForMap=async function(...args){
            const request=this._dianaPaletteRequest=(this._dianaPaletteRequest||0)+1;
            const result=await load.apply(this,args);
            if(request!==this._dianaPaletteRequest)return result;
            const textures=this.tilesetTextures||{};
            const available=layer=>layer==='A'?['A1','A2','A3','A4','A5'].some(key=>!!textures[key]):!!textures[layer];
            if(['A','B','C','D','E'].includes(this.currentLayer)&&!available(this.currentLayer)){
                const first=['A','B','C','D','E'].find(available);if(first)this.selectLayer(first);
            }
            document.getElementById('diana-tile-guide')?.remove();
            if(this.currentTileset?.tilesetNames?.[5]==='DianaChao'&&this.currentTileset.flags?.[3]===15){
                const guide=document.createElement('div');guide.id='diana-tile-guide';
                guide.textContent='Escolha um tile e pinte no mapa. Água, paredes, árvores e pedras bloqueiam a passagem.';
                document.getElementById('tileset-palette-container')?.append(guide);
            }
            return result;
        };
    }
    const toolbar=document.getElementById('toolbar');
    if(!toolbar)return;
    const bar=document.createElement('nav');bar.id='diana-workspace';bar.setAttribute('aria-label','Áreas de trabalho do Diana');
    const brand=document.createElement('div');brand.className='diana-brand';brand.innerHTML='<strong>LUAE</strong><span>RPG</span>';bar.append(brand);
    const button=(id,label,title,action)=>{
        const node=document.createElement('button');node.type='button';node.dataset.dianaAction=id;node.textContent=label;node.title=title;
        node.addEventListener('click',()=>{if(!window.reactor?.projectController?.getCurrentProject())return;action(window.reactor);sync();});bar.append(node);return node;
    };
    const openResources=app=>{
        if(document.getElementById('diana-resource-library'))return;
        const project=app.projectController?.getCurrentProject?.()||app.projectController?.currentProject;
        const overlay=document.createElement('div');overlay.id='diana-resource-library';overlay.className='rr-modal-overlay';overlay.style.zIndex=23000;
        const modal=document.createElement('section');modal.className='rr-modal diana-resource-library-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Recursos e biblioteca de exemplos');
        const header=document.createElement('div');header.className='rr-modal-header';header.textContent='Recursos e biblioteca de exemplos';
        const body=document.createElement('div');body.className='rr-modal-body';
        const footer=document.createElement('div');footer.className='rr-modal-footer';
        const close=document.createElement('button');close.type='button';close.className='rr-btn-secondary';close.textContent='Fechar';
        const importButton=document.createElement('button');importButton.type='button';importButton.className='rr-button-primary';importButton.textContent='Importar arquivos…';
        const dismiss=()=>{keys?.dispose();overlay.remove();};close.onclick=dismiss;importButton.onclick=()=>{dismiss();document.getElementById('toolbar-resource-manager-btn')?.click();};
        if(globalThis.DianaRTPExpansion)globalThis.DianaRTPExpansion.mountLibrary(body,{projectPath:project?.path,openDatabase:type=>app.openDatabase(type),openMap:id=>{dismiss();mode(false);app.projectController.loadMap(id);}});
        const recipes=document.createElement('button');recipes.type='button';recipes.className='rr-btn-secondary';recipes.textContent='Modelos de eventos';recipes.onclick=()=>{dismiss();globalThis.DianaEventRecipes?.open(app);};
        const references=document.createElement('button');references.type='button';references.className='rr-btn-secondary';references.textContent='Pesquisar referências';references.onclick=()=>{dismiss();globalThis.DianaReferenceLibrary?.open();};
        footer.append(recipes,references,importButton,close);modal.append(header,body,footer);overlay.append(modal);document.body.append(overlay);
        const keys=globalThis.RRKeyboardNavigation?.modal?.(overlay,{container:()=>modal,onEscape:dismiss});keys?.enter(importButton);
    };
    const mode=event=>{if(!!window.reactor?.eventManager?.eventMode!==event)document.getElementById('toolbar-event-manager-btn')?.click();};
    button('maps','Mapas','Pintar e organizar mapas',()=>mode(false));
    button('events','Eventos','Criar interações no mapa',()=>mode(true));
    button('event-search','⌕ Buscar','Buscar eventos por nome, switch ou variável em todos os mapas',app=>globalThis.DianaEventSearch?.open(app));
    button('database','Banco de dados','Personagens, classes, habilidades e itens',app=>app.openDatabase('actors'));
    button('battle','Batalha','Poses, sequências e apresentação do combate',app=>app.openDatabase('dianaBattleScreen'));
    button('resources','Recursos','Biblioteca de exemplos e importação de arquivos',openResources);
    button('sprite-repair','Corrigir sprites','Inspecionar caminhada e combate, recuperar recortes e corrigir folhas',app=>globalThis.DianaSpriteRepairUI?.open(app));
    const play=button('play','▶ Testar jogo','Salvar e executar o jogo',()=>toolbar.querySelector('[data-action="playtest"]')?.click());play.className='diana-play';
    toolbar.before(bar);
    function sync(){
        const loaded=!!window.reactor?.projectController?.getCurrentProject();
        bar.querySelectorAll('button').forEach(node=>{
            node.disabled=!loaded;
            const selected=loaded&&node.dataset.dianaAction===(window.reactor.eventManager.eventMode?'events':'maps');
            if(node.getAttribute('aria-pressed')!==String(selected))node.setAttribute('aria-pressed',String(selected));
        });
    }
    new MutationObserver(sync).observe(toolbar,{attributes:true,subtree:true,attributeFilter:['style','class','disabled']});sync();
    const welcome=document.querySelector('.welcome-content');
    if(welcome){
        welcome.querySelector('.welcome-logo')?.remove();
        const heading=document.createElement('h1');heading.className='diana-welcome-title';heading.textContent='Luae RPG';welcome.prepend(heading);
        const tagline=welcome.querySelector('.welcome-tagline');if(tagline){tagline.removeAttribute('data-i18n');tagline.textContent='Comece pela Vila da Clareira: explore casas, converse com moradores e enfrente seus primeiros inimigos.';}
        const startAction=welcome.querySelector('.welcome-button[data-action="new-project"] span');if(startAction){startAction.removeAttribute('data-i18n');startAction.textContent='Come\u00e7ar pela Vila da Clareira';}
        const openAction=welcome.querySelector('.welcome-button[data-action="open-project"] span');if(openAction){openAction.removeAttribute('data-i18n');openAction.textContent='Abrir meu projeto';}
        const steps=welcome.querySelectorAll?.('.welcome-getting-started li')||[];
        const stepText=['Explore mapas, casas e caminhos da Vila da Clareira.','Converse com moradores e encontre itens pelo cen\u00e1rio.','Edite her\u00f3is, inimigos, poses, armas e sons por status.','Teste o combate e ajuste cada anima\u00e7\u00e3o quadro a quadro.'];
        [...steps].forEach((step,index)=>{step.removeAttribute('data-i18n');if(stepText[index])step.textContent=stepText[index];});
        const tips=welcome.querySelector('.welcome-getting-started h2');if(tips){tips.removeAttribute('data-i18n');tips.textContent='Seu RPG come\u00e7a em um mundo pronto';}
        const cards=welcome.querySelector('.welcome-cards');
        if(cards){const village=document.createElement('section');village.className='welcome-card diana-welcome-village';village.setAttribute('aria-label','Projeto inicial Vila da Clareira');
            const title=document.createElement('h2');title.textContent='Vila da Clareira';
            const description=document.createElement('p');description.textContent='Her\u00f3is, inimigos, po\u00e7\u00f5es, moradores, casas explor\u00e1veis e combate lateral j\u00e1 prontos para editar.';
            const note=document.createElement('small');note.textContent='Ao criar, escolha a pasta onde deseja guardar seu projeto.';
            village.append(title,description,note);welcome.insertBefore(village,cards);
        }
        welcome.querySelector('.welcome-community')?.remove();
    }
});
