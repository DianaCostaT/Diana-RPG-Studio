/* Searchable local research metadata. Never loads or executes third-party plugins. */
(function(root){
 'use strict';
 const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function safeUrl(value){try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)&&!url.username&&!url.password?url.href:null;}catch{return null;}}
 const topics=[
  ['all','Todas as possibilidades',null],
  ['art','Artes e animações',/sprite|animat|effekseer|battler|character art|generator|icon|pixel|portrait/],
  ['maps','Mapas, camadas e iluminação',/tileset|map|lighting|shadow|weather|camera|parallax/],
  ['events','Eventos e sistemas de jogo',/event|quest|craft|farm|gather|fishing|choice|dialog|reputation/],
  ['battle','Combate e progressão',/battle|skill|enemy|battler|combat|class|equipment|tactical/],
  ['comfort','Interface, idiomas e acessibilidade',/localiz|flash|accessib|input|menu|hud|font|interface/],
  ['audio','Áudio e efeitos sonoros',/sound|audio|music|bgm|bgs|chiptone/]
 ];
 function parse(text){return text.split(/\r?\n/).filter(line=>line.trim()).map(line=>JSON.parse(line)).filter(row=>typeof row.title==='string'&&typeof row.category==='string'&&Array.isArray(row.urls)).map(row=>({...row,urls:row.urls.filter(url=>typeof url==='string'&&safeUrl(url)),searchText:fold([row.title,row.category,...row.urls].join(' '))}));}
 function search(rows,{query='',category='',topic='all',offset=0,limit=40}={}){
  const words=fold(query).trim().split(/\s+/).filter(Boolean),pattern=topics.find(t=>t[0]===topic)?.[2];
  const found=rows.filter(row=>(!category||row.category===category)&&(!pattern||pattern.test(row.searchText||fold(row.title+' '+row.category)))&&words.every(word=>(row.searchText||fold(row.title+' '+row.category+' '+row.urls.join(' '))).includes(word)));
  offset=Math.max(0,Math.floor(offset)||0);limit=Math.max(1,Math.min(100,Math.floor(limit)||40));return {total:found.length,rows:found.slice(offset,offset+limit)};
 }
 let pending;
 function load(){
  if(!pending)pending=Promise.all(['catalog.ndjson','additional.ndjson'].map(async name=>{const response=await root.fetch('diana-learning/'+name);if(!response.ok)throw Error('Biblioteca local indisponível. Prepare novamente o editor.');return response.text();})).then(([catalog,additional])=>{
   const rows=parse(catalog);for(const row of additional.split(/\r?\n/).filter(Boolean).map(JSON.parse))if(typeof row.category==='string'&&safeUrl(row.url))rows.push({title:`Hyperlink na célula ${row.cell}`,category:row.category,urls:[row.url],searchText:fold([row.category,row.url].join(' ')),cell:row.cell});return rows;
  }).catch(error=>{pending=null;throw error;});
  return pending;
 }
 function open(){
  const doc=root.document;if(doc.getElementById('diana-reference-library'))return;
  const el=(tag,text)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
  const overlay=el('div');overlay.id='diana-reference-library';overlay.className='rr-modal-overlay diana-creation-modal';const modal=el('section');modal.className='rr-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Biblioteca de criação');overlay.append(modal);
  const header=el('div','Biblioteca de criação');header.className='rr-modal-header';const body=el('div');body.className='rr-modal-body';const footer=el('div');footer.className='rr-modal-footer';modal.append(header,body,footer);
  body.append(el('p','Pesquise as referências de RPG Maker reunidas no estudo. Os nomes e marcadores são históricos: cada autor define a versão e os termos atuais. A presença aqui não confirma compatibilidade com o Diana.'));
  const filters=el('div');filters.className='diana-reference-filters';const query=el('input');query.type='search';query.placeholder='Buscar por nome, assunto ou autor…';query.setAttribute('aria-label','Pesquisar referências');
  const topic=el('select');topic.setAttribute('aria-label','Assunto');for(const [value,label] of topics){const o=el('option',label);o.value=value;topic.append(o);}const category=el('select');category.setAttribute('aria-label','Categoria da planilha');const all=el('option','Todas as categorias');all.value='';category.append(all);filters.append(query,topic,category);body.append(filters);
  const count=el('p','Carregando índice local…');count.setAttribute('role','status');const results=el('div');results.className='diana-reference-results';body.append(count,results);
  let rows=[],offset=0,disposed=false,keys;const btn=(label,action)=>{const b=el('button',label);b.type='button';b.className='rr-btn-secondary';b.onclick=action;return b;};
  const close=()=>{disposed=true;keys?.dispose();overlay.remove();};const previous=btn('Anterior',()=>{offset=Math.max(0,offset-40);render();}),next=btn('Próxima',()=>{offset+=40;render();});footer.append(previous,next,btn('Fechar',close));
  function render(){if(disposed)return;const result=search(rows,{query:query.value,category:category.value,topic:topic.value||'all',offset});results.replaceChildren();count.textContent=`${result.total} referências · ${result.total?offset+1:0}–${Math.min(offset+40,result.total)}`;previous.disabled=offset===0;next.disabled=offset+40>=result.total;
   for(const item of result.rows){const card=el('article');card.className='diana-reference-card';card.append(el('strong',item.title),el('small',item.category+(item.reportedAsListed?' · listado em '+item.reportedAsListed:'')));
    if(item.paidAsListed)card.append(el('small','Marcado como pago na planilha: '+(item.paidAsListed==='TRUE'?'sim':item.paidAsListed==='FALSE'?'não':item.paidAsListed)+' · consulte os termos atuais.'));
    if(!item.urls.length)card.append(el('p','A fonte informa apenas o nome. Autor e endereço ainda precisam ser identificados.'));
    for(const url of item.urls){const line=el('div');line.className='diana-reference-url';const value=el('input');value.type='text';value.readOnly=true;value.value=url;value.setAttribute('aria-label','Endereço da referência');const copy=btn('Copiar link',async()=>{try{await root.navigator.clipboard.writeText(url);copy.textContent='Link copiado';}catch{value.focus();value.select();count.textContent='Selecione o endereço e use Ctrl+C para copiar.';}});line.append(value,copy);card.append(line);}results.append(card);
   }
   if(!result.total)results.append(el('p','Nenhuma referência encontrada. Tente menos palavras ou outra categoria.'));
  }
  const reset=()=>{offset=0;render();};query.oninput=reset;topic.onchange=reset;category.onchange=reset;previous.disabled=next.disabled=true;doc.body.append(overlay);keys=root.RRKeyboardNavigation?.modal?.(overlay,{container:()=>modal,onEscape:close});keys?.enter(query);
  load().then(data=>{if(disposed)return;rows=data;for(const name of [...new Set(rows.map(r=>r.category))].sort()){const o=el('option',name);o.value=name;category.append(o);}render();}).catch(error=>{if(!disposed)count.textContent=error.message;});
 }
 const api={fold,safeUrl,topics,parse,search,load,open};root.DianaReferenceLibrary=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
