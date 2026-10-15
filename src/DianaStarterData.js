/* Original Diana starter data and geometric pixel assets, licensed under MIT. */
(function (root) {
    'use strict';
    const clear = [0, 0, 0, 0];
    function tilePixel(x,y) {
        if(x>=384)return clear;
        const id=Math.floor(x/48)+Math.floor(y/48)*8;
        x=Math.floor((x%48)/3);y=Math.floor((y%48)/3);
        const grass=(x*7+y*11)%19<3?[88,137,82,255]:[68,114,72,255];
        switch(id){
            case 0:return clear;
            case 1:return grass;
            case 2:return (x*3+y*5)%17<3?[180,151,103,255]:[158,128,86,255];
            case 3:return y%5===0&&(x+y)%9<5?[113,190,213,255]:[50,112,163,255];
            case 4:return y%5===0||(x+(Math.floor(y/5)%2)*4)%8===0?[66,68,82,255]:[126,126,143,255];
            case 5:return x%5===0?[90,61,46,255]:[150,109,71,255];
            case 6:return y%8===0||x%8===0?[70,78,91,255]:[126,138,147,255];
            case 7:return (x+y*3)%13===0?[227,210,151,255]:[202,181,121,255];
            case 8:if(y>11&&x>6&&x<10)return [115,78,50,255];return ((x-8)*(x-8)+(y-6)*(y-6)<43)?[39,76+(x+y)%3*10,56,255]:grass;
            case 9:return ((x===4&&y===5)||(x===11&&y===10))?[239,171,187,255]:grass;
            case 10:return y%4===0||x%6===0?[92,50,65,255]:[157,79,86,255];
            case 11:return x<2||x>13?[73,53,43,255]:(y%4===0?[107,75,49,255]:[176,130,76,255]);
            case 12:return x%8===0||y%8===0?[41,48,63,255]:[76,86,103,255];
            case 13:return (x*5+y*3)%19<2?[195,216,228,255]:[226,238,242,255];
            case 14:return (x-8)*(x-8)+(y-8)*(y-8)<40?[131+(x<7?20:0),139,151,255]:grass;
            case 15:return [26,31,44,255];
            default:return clear;
        }
    }
    const sheet = (colour) => (x, y) => {
        const frame = Math.floor(x / 48), row = Math.floor(y / 48);
        x %= 48; y %= 48;
        const step = frame === 0 ? -2 : frame === 2 ? 2 : 0;
        if (y >= 39 && y < 43 && x >= 12 && x < 36) return [20, 28, 38, 100];
        if (y >= 8 && y < 21 && x >= 17 && x < 31) {
            if (y < 12) return [43, 38, 63, 255];
            if (row === 3) return [43, 38, 63, 255];
            if (y === 16 && (x === 20 || x === 27)) return [28, 30, 40, 255];
            return [237, 194, 146, 255];
        }
        if (y >= 21 && y < 34 && x >= 14 && x < 34) return colour;
        if (y >= 34 && y < 41 && ((x >= 16 + step && x < 23 + step) || (x >= 26 - step && x < 33 - step))) return [48, 45, 69, 255];
        return clear;
    };
    function populate(data) {
        const system = data['System.json'];
        system.locale = 'pt_BR';
        system.battleSystem = 0;
        system.partyMembers = [1];
        system.terms.commands = ['Lutar', 'Fugir', 'Atacar', 'Defender', 'Item', 'Habilidade', 'Equipamento', 'Estado', 'Formação', 'Salvar', 'Encerrar', 'Opções', 'Arma', 'Armadura', 'Item-chave', 'Equipar', 'Otimizar', 'Remover', 'Novo jogo', 'Continuar', null, 'Título', 'Cancelar', null, 'Comprar', 'Vender'];
        system.terms.basic = ['Nível', 'Nv', 'PV', 'PV', 'PM', 'PM', 'PT', 'PT', 'Experiência', 'EXP'];
        system.terms.params = ['PV máximo', 'PM máximo', 'Ataque', 'Defesa', 'Ataque mágico', 'Defesa mágica', 'Agilidade', 'Sorte', 'Acerto', 'Esquiva'];
        system.terms.messages = {
            alwaysDash:'Correr sempre',commandRemember:'Lembrar comandos',touchUI:'Controles de toque',bgmVolume:'Volume da música',bgsVolume:'Volume ambiente',meVolume:'Volume de temas',seVolume:'Volume de efeitos',possession:'Quantidade',
            expTotal:'Experiência total',expNext:'Próximo nível: %1',saveMessage:'Escolha um arquivo para salvar.',loadMessage:'Escolha um arquivo para carregar.',file:'Arquivo',autosave:'Salvamento automático',partyName:'Grupo de %1',
            emerge:'%1 está pronto para o combate!',preemptive:'%1 age primeiro!',surprise:'%1 foi surpreendido!',escapeStart:'%1 tenta fugir!',escapeFailure:'Não foi possível fugir.',victory:'%1 venceu!',defeat:'%1 foi derrotado.',
            obtainExp:'Recebeu %1 de %2.',obtainGold:'Recebeu %1 moedas.',obtainItem:'Recebeu %1.',levelUp:'%1 alcançou %2 %3!',obtainSkill:'Aprendeu %1.',useItem:'%1 usa %2!',criticalToEnemy:'Golpe crítico!',criticalToActor:'Golpe crítico recebido!',
            actorDamage:'%1 sofreu %2 de dano.',actorRecovery:'%1 recuperou %3 de %2.',actorGain:'%1 ganhou %3 de %2.',actorLoss:'%1 perdeu %3 de %2.',actorDrain:'%1 perdeu %3 de %2 por absorção.',actorNoDamage:'%1 não sofreu dano.',actorNoHit:'%1 não foi atingido.',
            enemyDamage:'%1 sofreu %2 de dano.',enemyRecovery:'%1 recuperou %3 de %2.',enemyGain:'%1 ganhou %3 de %2.',enemyLoss:'%1 perdeu %3 de %2.',enemyDrain:'%1 perdeu %3 de %2 por absorção.',enemyNoDamage:'%1 não sofreu dano.',enemyNoHit:'%1 não foi atingido.',
            evasion:'%1 desviou!',magicEvasion:'%1 evitou a magia!',magicReflection:'%1 refletiu a magia!',counterAttack:'%1 contra-ataca!',substitute:'%1 protege %2!',buffAdd:'%2 de %1 aumentou!',debuffAdd:'%2 de %1 diminuiu!',buffRemove:'%2 de %1 voltou ao normal.',actionFailure:'A ação não afetou %1.'
        };
        const actor = {id:1, name:'Diana', nickname:'', classId:1, initialLevel:1, maxLevel:99, profile:'Personagem inicial editável.', characterName:'$Diana', characterIndex:0, faceName:'', faceIndex:0, battlerName:'', equips:[0,0,0,0,0], traits:[{code:22,dataId:0,value:1}], note:''};
        data['Actors.json'] = [null, actor];
        data['Classes.json'] = [null, {id:1, name:'Aventureiro', expParams:[30,20,30,30], params:[120,30,24,16,16,16,20,10].map(base => Array.from({length:100}, (_,level) => base + Math.max(0,level-1)*2)), learnings:[], traits:[], note:''}];
        const skill = {iconIndex:0, description:'', stypeId:0, scope:1, occasion:1, mpCost:0, tpCost:0, tpGain:0, hitType:1, animationId:0, speed:0, successRate:100, repeats:1, requiredWtypeId1:0, requiredWtypeId2:0, messageType:1, message1:'', message2:'', effects:[], note:''};
        data['Skills.json'] = [null, {...skill,id:1,name:'Atacar',damage:{type:1,elementId:0,formula:'Math.max(1, a.atk * 2 - b.def)',variance:0,critical:false}}, {...skill,id:2,name:'Defender',scope:11,hitType:0,damage:{type:0,elementId:0,formula:'0',variance:0,critical:false},effects:[{code:21,dataId:2,value1:1,value2:0}]}];
        const state = {description:'',iconIndex:0,priority:50,motion:0,overlay:0,restriction:0,removeAtBattleEnd:false,removeByRestriction:false,autoRemovalTiming:0,minTurns:1,maxTurns:1,removeByDamage:false,chanceByDamage:100,removeByWalking:false,stepsToRemove:100,traits:[],note:'',messageType:1,message1:'',message2:'',message3:'',message4:''};
        data['States.json'] = [null, {...state,id:1,name:'Nocaute',restriction:4,priority:100,motion:3}, {...state,id:2,name:'Defesa',removeAtBattleEnd:true,autoRemovalTiming:1,traits:[{code:62,dataId:1,value:1}]}];
        data['Enemies.json'] = [null, {id:1,name:'Parceiro de treino',battlerName:'',battlerHue:0,params:[60,0,8,8,8,8,8,8],exp:5,gold:0,dropItems:[],actions:[{skillId:1,conditionType:0,conditionParam1:0,conditionParam2:0,rating:5}],traits:[{code:22,dataId:0,value:1}],note:''}];
        data['Troops.json'] = [null, {id:1,name:'Treino',members:[{enemyId:1,x:280,y:360,hidden:false}],pages:[],note:''}];
        data['BattlePresentation.json'] = {version:1,troops:{},skills:{},items:{},weapons:{},classes:{},actors:{1:{graphic:{mode:'character',name:'$Diana',folder:'characters',scale:2}}},enemies:{1:{graphic:{mode:'character',name:'$Treinador',folder:'characters',scale:2}}}};
        data['MapInfos.json'][1].name = 'Mapa inicial';
        const map = data['Map001.json'];
        map.displayName = 'Mapa inicial';
        map.data.fill(1, 0, map.width * map.height);
        const paint=(x,y,id)=>map.data[y*map.width+x]=id;
        for(let y=0;y<map.height;y++)paint(8,y,2);
        for(let x=0;x<map.width;x++)paint(x,6,2);
        for(let y=2;y<=4;y++)for(let x=2;x<=4;x++)paint(x,y,3);
        for(const [x,y] of [[2,9],[3,9],[13,3],[14,3]])paint(x,y,8);
        data['Tilesets.json'][1].name = 'Diana — terreno básico';
        data['Tilesets.json'][1].tilesetNames[5] = 'DianaChao';
        for(const id of [3,4,8,10,14,15])data['Tilesets.json'][1].flags[id]=15;
        map.events[1] = {id:1,name:'Treino de batalha',x:8,y:7,note:'',pages:[{conditions:{actorId:1,actorValid:false,itemId:1,itemValid:false,selfSwitchCh:'A',selfSwitchValid:false,switch1Id:1,switch1Valid:false,switch2Id:1,switch2Valid:false,variableId:1,variableValid:false,variableValue:0},directionFix:false,image:{tileId:0,characterName:'$Treinador',characterIndex:0,direction:8,pattern:1},moveFrequency:3,moveRoute:{list:[{code:0,parameters:[]}],repeat:true,skippable:false,wait:false},moveSpeed:3,moveType:0,priorityType:1,stepAnime:true,through:false,trigger:0,walkAnime:true,list:[{code:101,indent:0,parameters:['',0,0,2]},{code:401,indent:0,parameters:['Bem-vindo! Use as setas para andar e Enter para interagir.']},{code:401,indent:0,parameters:['Vamos treinar uma batalha. Escolha Lutar e Atacar.']},{code:301,indent:0,parameters:[0,1,true,true]},{code:0,indent:0,parameters:[]}]}]};
        return data;
    }
    function writeAssets(manager, target) {
        const file = (folder, name) => manager.path.join(target, 'img', folder, name + '.png');
        manager.writePng(file('characters', '$Diana'), 144, 192, sheet([111,88,198,255]));
        manager.writePng(file('characters', '$Treinador'), 144, 192, sheet([66,156,128,255]));
        manager.writePng(file('tilesets', 'DianaChao'), 768, 96, tilePixel);
        // Runtime samples the 32 text colours from this exact windowskin region.
        const palette = [[242,240,255,255],[142,179,255,255],[255,144,144,255],[143,224,175,255],
            [143,218,255,255],[211,174,255,255],[255,224,146,255],[198,197,214,255]];
        manager.writePng(file('system', 'Window'), 192, 192, (x,y) => {
            if (x >= 96 && y >= 144) return palette[(Math.floor((y-144)/12)*8+Math.floor((x-96)/12))%8];
            if (x < 96) return [30,29,46,255];
            if (y < 96) return x < 100 || x >= 188 || y < 4 || y >= 92 ? [145,132,199,255] : clear;
            if (x < 144 && y < 144) return [118,96,190,180];
            return clear;
        });
    }
    const api = {populate, writeAssets, tilePixel};
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.DianaStarterData = api;
})(globalThis);
