'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const starter = require('../src/DianaStarterData.js');
function data() {
    const source = fs.readFileSync(path.join(__dirname,'../upstream/RPGReactor/editor/src/ProjectManager.js'),'utf8');
    const Manager = vm.runInNewContext(source + '\nProjectManager;', {console});
    return Manager.prototype.getStarterData.call({getStarterTileset:Manager.prototype.getStarterTileset,getStarterSystem:Manager.prototype.getStarterSystem}, 'Meu jogo');
}
test('projeto inicial possui contratos essenciais de batalha e progressão válidos', () => {
    const result = starter.populate(data());
    assert.equal(result['System.json'].partyMembers[0],1);
    assert.equal(result['System.json'].optSideView,true);
    const actor = result['Actors.json'][1], klass = result['Classes.json'][actor.classId];
    for (const values of klass.params) {
        assert.equal(values.length,100);
        assert.ok(values.slice(1).every(Number.isFinite));
    }
    assert.equal(result['States.json'][1].restriction,4);
    assert.equal(result['States.json'][2].traits[0].code,62);
    assert.equal(result['Skills.json'][1].requiredWtypeId1,0);
    assert.equal(result['Skills.json'][2].effects[0].dataId,2);
    const enemy=result['Enemies.json'][result['Troops.json'][1].members[0].enemyId];
    assert.ok(result['Skills.json'][enemy.actions[0].skillId]);
    assert.equal(result['BattlePresentation.json'].actors[1].graphic.mode,result['BattlePresentation.json'].enemies[1].graphic.mode);
});
test('mapa inicial tem piso transitável e evento de treino por ação do jogador', () => {
    const result = starter.populate(data()), map=result['Map001.json'];
    assert.equal(map.data[6*map.width+8],2);
    assert.equal(map.data[3*map.width+3],3);
    assert.equal(result['Tilesets.json'][1].flags[3],15);
    assert.equal(result['Tilesets.json'][1].flags[8],15);
    assert.equal(result['Tilesets.json'][1].flags[1],0);
    const event=map.events[1], list=event.pages[0].list;
    assert.equal(event.pages[0].trigger,0);
    assert.deepEqual([event.x,event.y],[8,7]);
    assert.equal(list.find(command=>command.code===301).parameters[1],1);
    assert.equal(result['System.json'].terms.commands[18],'Novo jogo');
});
test('recursos originais incluem transparência, direção e cores distintas', () => {
    const sheets = [];
    starter.writeAssets({path,writePng(file,width,height,pixel){
        const colours = new Set();
        for(let y=0;y<height;y++)for(let x=0;x<width;x++)colours.add(pixel(x,y).join(','));
        assert.ok(colours.size>2);
        assert.ok(colours.has('0,0,0,0'));
        sheets.push({file,width,height,colours});
    }}, 'project');
    assert.equal(sheets.length,4);
    assert.equal(sheets[0].width/3,48);
    assert.equal(sheets[0].height/4,48);
    assert.notDeepEqual(sheets[0].colours,sheets[1].colours);
});
