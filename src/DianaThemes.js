/* Diana appearance: one persisted preference, shared with the existing settings. */
(function(root){
 'use strict';
 const presets=[{id:'dark',name:'Grafite',mode:'dark',accent:'#b7adff'},{id:'light',name:'Claro',mode:'light',accent:'#5845a8'},
  {id:'bubblegum-light',name:'Rosa claro',mode:'light',accent:'#97385f',surface:'#fff4f7',base:'#f4e6ec'},
  {id:'cascadia-light',name:'Verde oliva',mode:'light',accent:'#52652b',surface:'#f7f8ef',base:'#e9eddd'},
  {id:'ocean-light',name:'Azul névoa',mode:'light',accent:'#20638e',surface:'#f2f8fc',base:'#e2edf5'},
  {id:'royalty-dark',name:'Ametista',mode:'dark',accent:'#d0acff',surface:'#252031',base:'#1a1722'}];
 const rgb=hex=>hex.slice(1).match(/../g).map(n=>parseInt(n,16));
 function tokens(id){
  const legacy={bubblegum:['#97385f','#ffb5d6'],cascadia:['#52652b','#c0ce93'],ocean:['#20638e','#9ed7ff'],royalty:['#633c9c','#d0acff'],underworld:['#a12d40','#ffadb9'],creamsicle:['#8b4c07','#ffc98d']},isLight=id?.endsWith('-light'),pair=legacy[id?.split('-')[0]];
  const p=presets.find(p=>p.id===id)||{id,mode:isLight?'light':'dark',accent:pair?.[isLight?0:1]||(isLight?'#5845a8':'#b7adff')},light=p.mode==='light';
  const t={};const set=(role,value)=>t['--color-'+role]=value;
  const surface=p.surface||(light?'#ffffff':'#222630'),base=p.base||(light?'#eef0f5':'#171a21');
  for(const role of ['bg-base','bg-deep'])set(role,base);
  for(const role of ['bg-surface','bg-panel','bg-list-item'])set(role,surface);
  for(const role of ['bg-toolbar','bg-menubar','bg-button','bg-list-item-alt','bg-input-alt'])set(role,light?base:'#2b303c');
  set('bg-input',light?'#ffffff':'#1b1f28');
  for(const role of ['bg-hover','bg-button-hover'])set(role,light?'#e0e4ed':'#373e4d');
  for(const role of ['bg-selected','bg-button-active'])set(role,light?'#dce0f0':'#444b64');
  set('text',light?'#252c3a':'#e8ebf3');set('text-strong',light?'#141c2b':'#ffffff');set('text-muted',light?'#505c6c':'#b0bacb');set('text-dim',light?'#606b79':'#a3aec0');
  for(const role of ['border','border-subtle'])set(role,light?'#c1c9d5':'#424b5e');set('border-input',light?'#8a97ab':'#69758b');
  for(const role of ['accent','accent-bright','accent-hover','accent-muted','accent-deep','link','link-bright','text-link','accent-border','accent-border-mid','accent-border-strong'])set(role,p.accent);
  set('accent-on',light?'#ffffff':'#181426');set('accent-hover-on',light?'#ffffff':'#181426');set('accent-shadow',base);
  for(const value of [10,15,25,30,35,40])set('accent-tint-'+value,`rgba(${rgb(p.accent).join(',')},${value/100})`);
  set('warning-text',light?'#785000':'#ffd083');set('danger-bright',light?'#ae243c':'#ff929f');set('danger-light',light?'#ae243c':'#ff929f');set('danger-bg-deep',light?'#ffe8ed':'#422630');
  t['--shadow-popup']=light?'0 8px 24px rgba(32,40,60,.14)':'0 8px 24px rgba(0,0,0,.35)';t['--shadow-modal']=light?'0 20px 64px rgba(32,40,60,.2)':'0 20px 64px rgba(0,0,0,.5)';
  return {values:t,mode:p.mode};
 }
 function apply(id){const theme=tokens(id);for(const [key,value] of Object.entries(theme.values))document.documentElement.style.setProperty(key,value,'important');document.documentElement.style.colorScheme=theme.mode;document.documentElement.dataset.dianaTheme=id||'dark';document.dispatchEvent(new Event('diana-theme-changed'));}
 function install(){
  const original=OptionsManager.prototype.applyTheme;
  OptionsManager.prototype.applyTheme=function(id){original.call(this,id);apply(id||'dark');};
  let saved='dark';try{saved=JSON.parse(localStorage.getItem('rr-settings')||'{}').theme||'dark';}catch{}apply(saved);
  document.addEventListener('DOMContentLoaded',()=>{
   const trigger=document.createElement('button');trigger.id='diana-appearance';trigger.type='button';trigger.textContent='Aparência';trigger.setAttribute('aria-haspopup','dialog');document.getElementById('html-menu-bar').insertBefore(trigger,document.getElementById('language-button'));
   trigger.onclick=()=>{
    if(document.getElementById('diana-appearance-dialog'))return;
    const overlay=document.createElement('div');overlay.id='diana-appearance-dialog';overlay.className='rr-modal-overlay';overlay.style.zIndex=24000;
    const modal=document.createElement('section');modal.className='rr-modal diana-appearance-panel';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Aparência do Diana');
    const title=document.createElement('div');title.className='rr-modal-header';title.textContent='Aparência do Diana';
    const body=document.createElement('div');body.className='rr-modal-body';const help=document.createElement('p');help.className='diana-help';help.textContent='Escolha seu ambiente de trabalho. A preferência é salva neste computador e não altera seu jogo.';body.append(help);
    const grid=document.createElement('div');grid.className='diana-theme-grid';body.append(grid);const status=document.createElement('p');status.setAttribute('role','status');status.className='diana-help';body.append(status);
    for(const p of presets){const b=document.createElement('button');b.type='button';b.dataset.dianaTheme=p.id;b.className='diana-theme-choice';
     const swatch=document.createElement('span');swatch.className='diana-theme-swatch';swatch.style.background=p.surface||(p.mode==='light'?'#ffffff':'#222630');swatch.style.borderLeft='18px solid '+p.accent;
     const text=document.createElement('span');text.textContent=p.name;const mode=document.createElement('small');mode.textContent=p.mode==='light'?'Modo claro':'Modo escuro';b.append(swatch,text,mode);grid.append(b);
     b.onclick=()=>{const manager=window.reactor?.optionsManager;if(!manager){status.textContent='Aguarde o editor terminar de iniciar.';return;}manager.applyTheme(p.id);sync();try{if(JSON.parse(localStorage.getItem('rr-settings')||'{}').theme!==p.id)throw Error();status.textContent=p.name+' aplicado e salvo.';}catch{status.textContent='Tema aplicado nesta sessão. Não foi possível salvar a preferência.';}};
    }
    const sync=()=>grid.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dianaTheme===document.documentElement.dataset.dianaTheme)));
    const footer=document.createElement('div');footer.className='rr-modal-footer';const close=document.createElement('button');close.type='button';close.className='rr-button-primary';close.textContent='Concluir';footer.append(close);modal.append(title,body,footer);overlay.append(modal);document.body.append(overlay);
    const finish=()=>{keys?.dispose();overlay.remove();trigger.focus();};close.onclick=finish;const keys=root.RRKeyboardNavigation?.modal?.(overlay,{container:()=>modal,onEscape:finish});sync();keys?.enter(grid.querySelector('button[aria-pressed=true]')||close);
   };
  });
 }
 root.DianaThemes={presets,tokens};if(typeof module!=='undefined')module.exports=root.DianaThemes;
 if(typeof document!=='undefined')install();
})(globalThis);
