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
        const checkAny=(folders,name)=>{
            if(typeof name==='string'&&name.trim()&&!folders.some(folder=>exists(folder,name)))missing.add(folders.map(folder=>'img/'+folder+'/'+name).join(' ou '));
        };
        const all=(value)=>Array.isArray(value)?value.filter(Boolean):[];
        const actors=all(data?.actors), enemies=all(data?.enemies);
        for(const actor of actors) {
            check('characters',actor.characterName);check('faces',actor.faceName);check('sv_actors',actor.battlerName);
        }
        for(const enemy of enemies)checkAny(['sv_enemies','enemies','characters'],enemy.battlerName);
        for(const troop of all(data?.troops))for(const member of all(troop.members)){
            if(!data?.enemies?.[member.enemyId])missing.add('referência para inimigo inexistente #'+member.enemyId+' na tropa '+(troop.name||'?'));
        }
        const presentation=data?.battlePresentation||{};
        const graphics=[...Object.values(presentation.actors||{}),...Object.values(presentation.enemies||{})];
        for(const entry of graphics){const graphic=entry?.graphic||entry;if(graphic?.name&&graphic?.folder)check(graphic.folder,graphic.name);}
        for(const entry of Object.values(presentation.troops||{}))for(const key of ['battleback1','battleback2'])check(key==='battleback1'?'battlebacks1':'battlebacks2',entry?.[key]);
        const maps=Array.isArray(map)?map.filter(Boolean):map?[map]:[];
        for(const entry of maps){
            for(const page of (entry?.events||[]).filter(Boolean).flatMap(event=>event.pages||[]))check('characters',page.image?.characterName);
            for(const name of data?.tilesets?.[entry?.tilesetId]?.tilesetNames||[])check('tilesets',name);
            check('parallaxes',entry?.parallaxName);
            for(const layer of entry?.rrImageLayers||[])check('parallaxes',layer?.name);
        }
        return [...missing].map(file=>'Imagem ausente: '+file+'. Importe o recurso ou altere a referência antes de testar.');
    }
    function validateReferences(data) {
        const issues=new Set();
        const records=key=>Array.isArray(data?.[key])?data[key]:[];
        const exists=(key,id)=>Number.isInteger(Number(id))&&Number(id)>0&&!!records(key)[Number(id)];
        for(const [index,actor] of records('actors').entries())if(actor){
            if(actor.classId&&!exists('classes',actor.classId))issues.add('O personagem '+(actor.name||'#'+index)+' referencia a classe inexistente #'+actor.classId+'.');
            for(const equipId of actor.equips||[])if(equipId&&!exists('weapons',equipId)&&!exists('armors',equipId))issues.add('O personagem '+(actor.name||'#'+index)+' referencia um equipamento inexistente #'+equipId+'.');
        }
        for(const [index,enemy] of records('enemies').entries())if(enemy){
            for(const action of enemy.actions||[])if(action.skillId&&!exists('skills',action.skillId))issues.add('O inimigo '+(enemy.name||'#'+index)+' referencia a habilidade inexistente #'+action.skillId+'.');
            for(const drop of enemy.dropItems||[])if(drop.kind===1&&!exists('items',drop.dataId)||drop.kind===2&&!exists('weapons',drop.dataId)||drop.kind===3&&!exists('armors',drop.dataId))issues.add('O inimigo '+(enemy.name||'#'+index)+' tem um item de recompensa inexistente #'+drop.dataId+'.');
        }
        for(const [index,skill] of records('skills').entries())if(skill){
            const animationId=Number(skill.animationId||0);if(animationId>0&&!exists('animations',animationId))issues.add('A habilidade '+(skill.name||'#'+index)+' referencia a animação inexistente #'+animationId+'.');
        }
        for(const id of Array.isArray(data?.system?.partyMembers)?data.system.partyMembers:[])if(!exists('actors',id))issues.add('O grupo inicial referencia o personagem inexistente #'+id+'.');
        return [...issues];
    }
    const api={validate,validateAssets,validateReferences};
    if(typeof module!=='undefined'&&module.exports)module.exports=api;
    root.DianaProjectValidation=api;
})(globalThis);
