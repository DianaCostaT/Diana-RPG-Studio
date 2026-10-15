/* Validation reads editor data without modifying the user's project. */
(function(root) {
    'use strict';
    function validate(data) {
        const errors=[], party=Array.isArray(data?.system?.partyMembers)?data.system.partyMembers:[];
        if(party.length===0)errors.push('Defina pelo menos um personagem no grupo inicial em Banco de dados → Sistema.');
        for(const id of party) {
            const actor=data?.actors?.[id];
            if(!actor) {errors.push('O grupo inicial referencia o personagem inexistente #'+id+'.');continue;}
            const klass=data?.classes?.[actor.classId];
            if(!klass){errors.push('Defina uma classe válida para '+actor.name+' (#'+id+').');continue;}
            const level=Number(actor.initialLevel);
            if(!Number.isInteger(level)||level<1||level>99)errors.push('O nível inicial de '+actor.name+' deve estar entre 1 e 99.');
            if(!Array.isArray(klass.params)||klass.params.length!==8||klass.params.some(values=>!Array.isArray(values)||!Number.isFinite(values[level])))
                errors.push('Preencha os oito parâmetros da classe '+klass.name+' no nível inicial de '+actor.name+'.');
            else if(klass.params[0][level]<=0)errors.push('Os PV iniciais de '+actor.name+' devem ser maiores que zero.');
        }
        if((party||[]).length) {
            for(const [id,label] of [[1,'Atacar'],[2,'Defender']])if(!data?.skills?.[id])errors.push('Crie a habilidade #'+id+' ('+label+') no Banco de dados.');
            if(!data?.states?.[1]||data.states[1].restriction!==4)errors.push('Configure o estado #1 como Nocaute, com restrição de incapacidade de agir.');
        }
        return errors;
    }
    function validateAssets(data, map, exists) {
        const missing=new Set();
        const check=(folder,name)=>{
            if(typeof name==='string'&&name.trim()&&!exists(folder,name))missing.add('img/'+folder+'/'+name);
        };
        for(const id of Array.isArray(data?.system?.partyMembers)?data.system.partyMembers:[]) {
            const actor=data?.actors?.[id];
            check('characters',actor?.characterName);check('faces',actor?.faceName);
        }
        for(const page of (map?.events||[]).filter(Boolean).flatMap(event=>event.pages||[]))check('characters',page.image?.characterName);
        for(const name of data?.tilesets?.[map?.tilesetId]?.tilesetNames||[])check('tilesets',name);
        check('parallaxes',map?.parallaxName);
        for(const layer of map?.rrImageLayers||[])check('parallaxes',layer?.name);
        return [...missing].map(file=>'Imagem ausente: '+file+'. Importe o recurso ou altere a referência antes de testar.');
    }
    const api={validate,validateAssets};
    if(typeof module!=='undefined'&&module.exports)module.exports=api;
    root.DianaProjectValidation=api;
})(globalThis);
