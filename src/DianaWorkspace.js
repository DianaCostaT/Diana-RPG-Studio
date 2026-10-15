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
    const brand=document.createElement('div');brand.className='diana-brand';brand.innerHTML='<strong>DIANA</strong><span>RPG STUDIO</span>';bar.append(brand);
    const button=(id,label,title,action)=>{
        const node=document.createElement('button');node.type='button';node.dataset.dianaAction=id;node.textContent=label;node.title=title;
        node.addEventListener('click',()=>{if(!window.reactor?.projectController?.getCurrentProject())return;action(window.reactor);sync();});bar.append(node);return node;
    };
    const mode=event=>{if(!!window.reactor?.eventManager?.eventMode!==event)document.getElementById('toolbar-event-manager-btn')?.click();};
    button('maps','Mapas','Pintar e organizar mapas',()=>mode(false));
    button('events','Eventos','Criar interações no mapa',()=>mode(true));
    button('database','Banco de dados','Personagens, classes, habilidades e itens',app=>app.openDatabase('actors'));
    button('enemies','Inimigos','Configurar inimigos e suas animações',app=>app.openDatabase('enemies'));
    button('animations','Sequências','Editar movimentos, efeitos e impactos de batalha',app=>app.openDatabase('actionSequences'));
    button('assets','Recursos','Importar tilesets, sprites e imagens',()=>document.getElementById('toolbar-resource-manager-btn')?.click());
    button('parallax','Parallax','Camadas de fundo e primeiro plano',()=>toolbar.querySelector('[data-action="image-layers"]')?.click());
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
        const heading=document.createElement('h1');heading.className='diana-welcome-title';heading.textContent='Diana RPG Studio';welcome.prepend(heading);
        const tagline=welcome.querySelector('.welcome-tagline');if(tagline){tagline.removeAttribute('data-i18n');tagline.textContent='Crie seu mundo. Conte sua história. Jogue.';}
        welcome.querySelector('.welcome-community')?.remove();
    }
});
