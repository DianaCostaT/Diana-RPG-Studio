'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const CombatModes = require('../src/DianaCombatModes.js');

const skills = [{ id: 1, name: 'Corte' }, { id: 2, name: 'Estocada' }, { id: 3, name: 'Ciclone' }];
const settings = () => ({
    version: 1,
    mode: 'field',
    combos: [{ id: 'corte-em-dupla', skillIds: [1, 2], resultSkillId: 3 }],
    tacticalPreparation: { enabled: true, columns: 4, rows: 3, movementRange: 4, attackRange: 1, obstacles: [{ x: 1, y: 1 }] }
});

test('valida contrato side/field, IDs de habilidades e limites de combo', () => {
    assert.deepEqual(CombatModes.validateSettings(settings(), skills), []);
    const invalid = settings();
    invalid.combos[0].skillIds = [1, 1, 99, 3, 2];
    assert.match(CombatModes.validateSettings(invalid, skills).join('\n'), /2 a 4 IDs únicos/);
    invalid.mode = 'chrono';
    assert.match(CombatModes.validateSettings(invalid, skills).join('\n'), /mode "side" ou "field"/);
    const automatic=settings();automatic.combos[0].autoExecute=true;delete automatic.combos[0].resultSkillId;
    assert.match(CombatModes.validateSettings(automatic,skills).join('\n'),/golpe final autom.*habilidade de resultado/);
});

test('prévia tática encontra caminho ao redor de obstáculo e respeita alcance', () => {
    const preview = CombatModes.previewTactical(settings(), { x: 0, y: 1 }, { x: 3, y: 1 });
    assert.equal(preview.valid, true);
    assert.equal(preview.reachable, false);
    assert.equal(preview.distance, 5);
    assert.equal(preview.inAttackRange, true);
    assert.deepEqual(preview.path[0], { x: 0, y: 1 });
    assert.deepEqual(preview.path.at(-1), { x: 3, y: 1 });
});

test('combo reconhece a sequência sem injetar ações ou repetir golpes', () => {
    const tracker = new CombatModes.ComboTracker(settings());
    const subject = { actorId: () => 7 };
    assert.equal(tracker.record(subject, 1), null);
    assert.deepEqual(tracker.record(subject, 2), { id: 'corte-em-dupla', resultSkillId: 3, autoExecute:false, skillIds: [1, 2] });
    assert.equal(tracker.history.length, 2);
    assert.deepEqual(tracker.history.map(entry => entry.skillId), [1, 2]);
});

test('combos usam IDs distintos para ator/inimigo e reiniciam a cada batalha', () => {
    const tracker = new CombatModes.ComboTracker(settings());
    const actor = { actorId: () => 7 };
    const enemy = { enemyId: () => 7 };
    tracker.record(actor, 1);
    assert.equal(tracker.record(enemy, 2), null);
    assert.deepEqual(tracker.record(actor, 2), { id: 'corte-em-dupla', resultSkillId: 3, autoExecute:false, skillIds: [1, 2] });
    assert.equal(tracker.history[0].subjectId, 'actor:7');
    assert.equal(tracker.history[1].subjectId, 'enemy:7');
});

test('combo opcional executa a habilidade final uma vez depois da sequência sem recursão',()=>{
    const config=settings();config.combos[0].autoExecute=true;assert.deepEqual(CombatModes.validateSettings(config,skills),[]);
    const forced=[],actor={actorId:()=>1,isActor:()=>true,isAlive:()=>true,forceAction:(id,target)=>forced.push(['skill',id,target])};
    const enemy={isAlive:()=>true},actions=[1,2,3].map(id=>({item:()=>({id}),isSkill:()=>true,targetIndex:()=>0}));
    const manager={_subject:actor,_logWindow:{addText(){}},startBattle(){},startAction(){this._action=actions.shift();},endAction(){this._subject=null;},forceAction(subject){forced.push(['manager',subject===actor]);}};
    function SceneBattle(){}SceneBattle.prototype.createSpriteset=function(){};
    const globals={Scene_Battle:SceneBattle,BattleManager:manager,$dataSystem:{dianaCombat:config},$dataSkills:[null,...skills],$gameParty:{members:()=>[actor],battleMembers:()=>[actor]},$gameTroop:{aliveMembers:()=>[enemy]}};
    CombatModes.installRuntime(globals);manager.startBattle();manager._subject=actor;
    manager.startAction();manager.endAction();manager._subject=actor;manager.startAction();
    assert.deepEqual(manager._dianaPendingComboAction,{subject:actor,skillId:3,targetIndex:0});manager.endAction();
    assert.deepEqual(forced,[['skill',3,0],['manager',true]]);
    manager._subject=actor;manager.startAction();assert.equal(manager._dianaComboTracker.history.length,2,'finisher is excluded from combo recognition');
});

test('hook registra a habilidade escolhida após a ação, libera resultado só na batalha e restaura ao terminar', () => {
    const calls = [];
    function SceneBattle() { this._spriteset = { _blackScreen: {}, _backgroundSprite: {}, _back1Sprite: {}, _back2Sprite: {}, _actorSprites: [], _enemySprites: [] }; }
    SceneBattle.prototype.createSpriteset = function() { calls.push('base sprites'); };
    SceneBattle.prototype.getChildIndex = () => 0;
    SceneBattle.prototype.addChildAt = function(layer) { this.layer = layer; };
    function SpritesetMap() {
        this._characterSprites = [
            { _character: player, visible: true },
            { _character: follower, visible: true },
            { _character: event, visible: true },
            { _character: npc, visible: true }
        ];
    }
    SpritesetMap.prototype.update = function() { this._characterSprites.forEach(sprite => { sprite.visible = true; }); };
    function GameActor() { this._skillIds = [1, 2]; }
    GameActor.prototype.skills = function() { return this._skillIds.map(id => skills.find(skill => skill.id === id)); };
    GameActor.prototype.isLearnedSkill = function(skillId) { return this._skillIds.includes(skillId); };
    const player = { screenX: () => 120, screenY: () => 500, followers: () => ({ visibleFollowers: () => [follower] }) };
    const follower = { screenX: () => 180, screenY: () => 480 };
    const event = { screenX: () => 640, screenY: () => 300 };
    const npc = { screenX: () => 400, screenY: () => 300 };
    const actor = new GameActor();
    actor.actorId = () => 1;
    const actions = [1, 2].map(id => ({ item: () => ({ id }), isSkill: () => true }));
    const manager = {
        startBattle() { calls.push('battle'); },
        startAction() { this._action = actions.shift(); calls.push('action'); },
        endBattle() { calls.push('end'); },
        _action: { item: () => ({ id: 99 }), isSkill: () => true },
        _subject: actor,
        _logWindow: { addText: text => calls.push(text) }
    };
    const globals = {
        Scene_Battle: SceneBattle, Spriteset_Map: SpritesetMap, Game_Actor: GameActor, BattleManager: manager,
        $dataSystem: { dianaCombat: settings() }, $dataSkills: [null, ...skills], $gamePlayer: player,
        $gameParty: { members: () => [actor] }, $gameMap: { _interpreter: { eventId: () => 4 }, event: () => event },
        Graphics: { boxWidth: 816, boxHeight: 624 }
    };
    assert.equal(CombatModes.installRuntime(globals), true);
    const scene = new SceneBattle();
    scene.createSpriteset();
    assert.equal(scene.layer._characterSprites[0].visible, false);
    assert.equal(scene.layer._characterSprites[1].visible, false);
    assert.equal(scene.layer._characterSprites[2].visible, false);
    assert.equal(scene.layer._characterSprites[3].visible, true);
    scene.layer.update();
    assert.equal(scene.layer._characterSprites[0].visible, false);
    assert.equal(scene.layer._characterSprites[3].visible, true);
    assert.equal(scene._spriteset._back1Sprite.visible, false);
    assert.equal(scene._spriteset._backgroundSprite.visible, false);
    assert.equal(scene._spriteset._blackScreen.visible, false);
    const homes = [];
    scene._spriteset._actorSprites = [{ setHome: (x, y) => homes.push([x, y]) }];
    scene._spriteset._enemySprites = [{ setHome: (x, y) => homes.push([x, y]) }];
    scene.createSpriteset();
    assert.deepEqual(homes, [[120, 500], [640, 300]]);
    manager.startBattle();
    manager.startAction();
    manager.startAction();
    assert.deepEqual(actor.skills().map(skill => skill.id), [1, 2, 3]);
    assert.equal(actor.isLearnedSkill(3), true);
    manager.endBattle();
    assert.deepEqual(actor.skills().map(skill => skill.id), [1, 2]);
    assert.equal(actor.isLearnedSkill(3), false);
    assert.deepEqual(calls, ['base sprites', 'base sprites', 'battle', 'action', 'action', 'Combo: corte-em-dupla. Nova habilidade disponível nesta batalha.', 'end']);
});

test('editor permite ativar preparação, pré-visualizar rota e administrar combos', () => {
    const previousDocument = global.document;
    const document = {
        createElement(tag) {
            return {
                tag, children: [], textContent: '', style: {}, attributes:{}, append(...nodes) { this.children.push(...nodes); },
                replaceChildren(...nodes) { this.children = nodes; }, setAttribute(name,value) { this.attributes[name]=value; },getAttribute(name){return this.attributes[name]??null;}
            };
        },
        createTextNode(text) { return { textContent: text }; }
    };
    const find = (node, predicate) => {
        if (predicate(node)) return node;
        for (const child of node.children || []) {
            const found = find(child, predicate);
            if (found) return found;
        }
        return null;
    };
    global.document = document;
    try {
        const system = { dianaCombat: { ...settings(), combos: [] } };
        const host = document.createElement('div');
        CombatModes.mountEditor(host, { system, skills });
        const tactical=find(host,node=>node.tag==='details');
        assert.ok(tactical,'preparação tática fica recolhida por padrão');
        assert.match(find(tactical,node=>node.tag==='summary').textContent,/planejamento experimental/);
        assert.match(find(tactical,node=>node.tag==='p').textContent,/ainda não iniciam nem controlam batalhas táticas/);
        const enabled = find(host, node => node.tag === 'input' && node.type === 'checkbox');
        enabled.checked = false;
        enabled.onchange();
        assert.equal(system.dianaCombat.tacticalPreparation.enabled, false);
        assert.match(find(host, node => node.tag === 'output' && node.textContent.startsWith('Rota:')).textContent, /Rota:/);
        find(host, node => node.tag === 'button' && node.textContent === 'Adicionar combo').onclick();
        assert.equal(system.dianaCombat.combos.length, 1);
        const auto=find(host,node=>node.tag==='input'&&node.getAttribute('aria-label')==='Executar habilidade de resultado automaticamente');
        assert.ok(auto);auto.checked=true;auto.onchange();assert.equal(system.dianaCombat.combos[0].autoExecute,true);
        find(host, node => node.tag === 'button' && node.textContent === 'Remover').onclick();
        assert.deepEqual(system.dianaCombat.combos, []);
    } finally {
        global.document = previousDocument;
    }
});
