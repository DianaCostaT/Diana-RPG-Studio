/* Diana combat modes: validated authoring and additive RPGReactor runtime hooks. */
(function(root) {
    'use strict';

    const MAX_COMBOS = 24;
    const MAX_COMBO_SKILLS = 4;
    const MAX_GRID_SIDE = 32;
    const clone = value => JSON.parse(JSON.stringify(value));
    const integer = value => Number.isInteger(value);
    const skillIds = skills => new Set((skills || []).filter(Boolean).map(skill => Number(skill.id)).filter(id => integer(id) && id > 0));
    const key = cell => `${cell.x},${cell.y}`;
    const cell = value => value && integer(value.x) && integer(value.y) ? { x: value.x, y: value.y } : null;

    const defaults = () => ({
        version: 1,
        mode: 'side',
        combos: [],
        tacticalPreparation: {
            enabled: false,
            columns: 8,
            rows: 6,
            movementRange: 4,
            attackRange: 1,
            obstacles: []
        }
    });

    function validateSettings(value, skills) {
        const errors = [];
        const ids = skillIds(skills);
        if (!value || value.version !== 1 || !['side', 'field'].includes(value.mode)) {
            return ['dianaCombat requer version 1 e mode "side" ou "field".'];
        }
        if (!Array.isArray(value.combos) || value.combos.length > MAX_COMBOS) {
            errors.push(`combos deve conter no máximo ${MAX_COMBOS} regras.`);
        } else {
            const names = new Set();
            value.combos.forEach((combo, index) => {
                const at = `combo #${index + 1}`;
                if (!combo || typeof combo.id !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,31}$/i.test(combo.id) || names.has(combo.id)) errors.push(`${at}: id inválido ou repetido.`);
                names.add(combo?.id);
                if (!Array.isArray(combo?.skillIds) || combo.skillIds.length < 2 || combo.skillIds.length > MAX_COMBO_SKILLS || new Set(combo.skillIds).size !== combo.skillIds.length || !combo.skillIds.every(id => integer(id) && id > 0)) {
                    errors.push(`${at}: skillIds requer de 2 a ${MAX_COMBO_SKILLS} IDs únicos.`);
                } else if (ids.size && combo.skillIds.some(id => !ids.has(id))) {
                    errors.push(`${at}: referencia habilidade inexistente.`);
                }
                if (combo.resultSkillId !== undefined && (!integer(combo.resultSkillId) || combo.resultSkillId <= 0 || (ids.size && !ids.has(combo.resultSkillId)))) {
                    errors.push(`${at}: resultSkillId deve referenciar uma habilidade existente.`);
                }
                if (combo.autoExecute === true && !combo.resultSkillId) errors.push(`${at}: o golpe final automático requer uma habilidade de resultado.`);
            });
        }
        const tactical = value.tacticalPreparation;
        if (!tactical || typeof tactical.enabled !== 'boolean' || !integer(tactical.columns) || !integer(tactical.rows) ||
            tactical.columns < 2 || tactical.columns > MAX_GRID_SIDE || tactical.rows < 2 || tactical.rows > MAX_GRID_SIDE ||
            !integer(tactical.movementRange) || tactical.movementRange < 0 || tactical.movementRange > MAX_GRID_SIDE ||
            !integer(tactical.attackRange) || tactical.attackRange < 1 || tactical.attackRange > MAX_GRID_SIDE ||
            !Array.isArray(tactical.obstacles)) {
            errors.push('tacticalPreparation requer grade, alcance, movimento e obstáculos válidos.');
        } else {
            const occupied = new Set();
            for (const obstacle of tactical.obstacles) {
                if (!cell(obstacle) || obstacle.x < 0 || obstacle.y < 0 || obstacle.x >= tactical.columns || obstacle.y >= tactical.rows || occupied.has(key(obstacle))) errors.push('tacticalPreparation contém obstáculo inválido ou repetido.');
                if (cell(obstacle)) occupied.add(key(obstacle));
            }
        }
        return errors;
    }

    function shortestPath(tactical, from, to) {
        if (!cell(from) || !cell(to)) return { reachable: false, path: [], distance: null, reason: 'Posição inválida.' };
        const bounds = point => point.x >= 0 && point.y >= 0 && point.x < tactical.columns && point.y < tactical.rows;
        const blocked = new Set(tactical.obstacles.map(key));
        if (!bounds(from) || !bounds(to) || blocked.has(key(from)) || blocked.has(key(to))) return { reachable: false, path: [], distance: null, reason: 'Origem, destino ou obstáculo inválido.' };
        const queue = [from], previous = new Map([[key(from), null]]);
        for (let i = 0; i < queue.length; i++) {
            const current = queue[i];
            if (key(current) === key(to)) break;
            for (const next of [{ x: current.x + 1, y: current.y }, { x: current.x - 1, y: current.y }, { x: current.x, y: current.y + 1 }, { x: current.x, y: current.y - 1 }]) {
                if (bounds(next) && !blocked.has(key(next)) && !previous.has(key(next))) {
                    previous.set(key(next), current);
                    queue.push(next);
                }
            }
        }
        if (!previous.has(key(to))) return { reachable: false, path: [], distance: null, reason: 'Sem caminho pelos obstáculos.' };
        const path = [];
        for (let current = to; current; current = previous.get(key(current))) path.unshift(current);
        return { reachable: true, path, distance: path.length - 1, reason: null };
    }

    function previewTactical(value, from, target) {
        const errors = validateSettings(value, []);
        if (errors.length) return { valid: false, errors, reachable: false, path: [], inAttackRange: false };
        const tactical = value.tacticalPreparation;
        const path = shortestPath(tactical, from, target);
        const inAttackRange = path.reachable && path.distance <= tactical.movementRange + tactical.attackRange;
        return {
            valid: true,
            errors: [],
            reachable: path.reachable && path.distance <= tactical.movementRange,
            inAttackRange,
            path: path.path,
            distance: path.distance,
            reason: path.reason || (inAttackRange ? 'Alvo no alcance.' : 'Alvo fora do alcance configurado.')
        };
    }

    class ComboTracker {
        constructor(settings) {
            this.settings = settings;
            this.history = [];
            this.histories = new Map();
        }

        record(subject, skillId) {
            if (!integer(skillId) || skillId <= 0) return null;
            const actorId = subject?.actorId?.();
            const enemyId = subject?.enemyId?.();
            const subjectId = integer(actorId) && actorId > 0 ? `actor:${actorId}` :
                integer(enemyId) && enemyId > 0 ? `enemy:${enemyId}` : null;
            if (!subjectId) return null;
            const entry = { subjectId, skillId };
            this.history.push(entry);
            if (this.history.length > MAX_COMBO_SKILLS) this.history.shift();
            const subjectHistory = this.histories.get(subjectId) || [];
            subjectHistory.push(entry);
            if (subjectHistory.length > MAX_COMBO_SKILLS) subjectHistory.shift();
            this.histories.set(subjectId, subjectHistory);
            const combo = this.settings.combos.find(candidate => {
                if (candidate.skillIds.length > subjectHistory.length) return false;
                const tail = subjectHistory.slice(-candidate.skillIds.length);
                return tail.every((entry, index) => entry.subjectId === subjectId && entry.skillId === candidate.skillIds[index]);
            });
            return combo ? { id: combo.id, resultSkillId: combo.resultSkillId || null, autoExecute: combo.autoExecute === true, skillIds: [...combo.skillIds] } : null;
        }
    }

    function runtimeSettings(globals) {
        const value = globals.$dataSystem?.dianaCombat;
        return validateSettings(value, globals.$dataSkills).length ? defaults() : value;
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function formationPoint(index, group, width, height) {
        const columns = 3;
        const column = index % columns;
        const row = Math.floor(index / columns);
        const startX = group === 'actors' ? width * .3 : width * .7;
        const direction = group === 'actors' ? 1 : -1;
        return {
            x: clamp(Math.round(startX + direction * column * 56), 32, width - 32),
            y: clamp(Math.round(height * .58 + row * 56), 32, height - 32)
        };
    }

    function fieldHomes(globals) {
        const width = globals.Graphics?.boxWidth || 816;
        const height = globals.Graphics?.boxHeight || 624;
        const point = (character, index, group) => {
            if (character && typeof character.screenX === 'function' && typeof character.screenY === 'function') {
                return {
                    x: clamp(Math.round(character.screenX()), 32, width - 32),
                    y: clamp(Math.round(character.screenY()), 32, height - 32)
                };
            }
            return formationPoint(index, group, width, height);
        };
        return point;
    }

    function partyCharacters(globals) {
        const player = globals.$gamePlayer;
        const followers = player?.followers?.().visibleFollowers?.() || [];
        return player ? [player, ...followers] : [];
    }

    function initiatingEvent(globals) {
        const explicit = globals.BattleManager?._dianaFieldInitiator;
        if (explicit && typeof explicit.screenX === 'function') return explicit;
        const eventId = globals.$gameMap?._interpreter?.eventId?.();
        return eventId > 0 ? globals.$gameMap?.event?.(eventId) : null;
    }

    function hideFieldParticipants(mapLayer, participants) {
        const hidden = new Set(participants.filter(Boolean));
        const hide = () => {
            for (const sprite of mapLayer._characterSprites || []) {
                if (hidden.has(sprite._character)) sprite.visible = false;
            }
        };
        const update = mapLayer.update;
        mapLayer.update = function() {
            update?.apply(this, arguments);
            hide();
        };
        hide();
    }

    function temporarySkills(subject) {
        return subject?._dianaCombatTemporarySkills || [];
    }

    function unlockSkill(subject, skillId) {
        if (!subject?.actorId?.() || !integer(skillId) || skillId <= 0) return false;
        const unlocked = subject._dianaCombatTemporarySkills ||= [];
        if (unlocked.includes(skillId)) return false;
        unlocked.push(skillId);
        return true;
    }

    function resetBattleCombos(globals) {
        globals.BattleManager._dianaComboTracker = null;
        globals.BattleManager._dianaLastCombo = null;
        globals.BattleManager._dianaPendingComboAction = null;
        globals.BattleManager._dianaExecutingComboFinisher = false;
        for (const actor of globals.$gameParty?.members?.() || []) delete actor._dianaCombatTemporarySkills;
    }

    function installRuntime(globals = root) {
        const SceneBattle = globals.Scene_Battle;
        const BattleManager = globals.BattleManager;
        if (!SceneBattle || !BattleManager || SceneBattle.prototype._dianaCombatModesInstalled) return false;
        SceneBattle.prototype._dianaCombatModesInstalled = true;
        const createSpriteset = SceneBattle.prototype.createSpriteset;
        SceneBattle.prototype.createSpriteset = function() {
            createSpriteset.call(this);
            const settings = runtimeSettings(globals);
            if (settings.mode !== 'field' || !globals.Spriteset_Map) return;
            const mapLayer = this._dianaFieldMap = new globals.Spriteset_Map();
            const initiator = initiatingEvent(globals);
            const party = partyCharacters(globals);
            hideFieldParticipants(mapLayer, [...party, initiator]);
            const battleIndex = Math.max(0, this.getChildIndex(this._spriteset));
            this.addChildAt(mapLayer, battleIndex);
            for (const name of ['_blackScreen', '_backgroundSprite', '_back1Sprite', '_back2Sprite']) if (this._spriteset?.[name]) this._spriteset[name].visible = false;
            const home = fieldHomes(globals);
            (this._spriteset?._actorSprites || []).forEach((sprite, index) => { const point = home(party[index], index, 'actors'); sprite._dianaFieldHome=point;sprite.setHome?.(point.x, point.y); });
            (this._spriteset?._enemySprites || []).forEach((sprite, index) => { const point = home(index === 0 ? initiator : null, index, 'enemies'); sprite._dianaFieldHome=point;sprite.setHome?.(point.x, point.y); });
        };
        const updateScene=SceneBattle.prototype.update;
        SceneBattle.prototype.update=function(){
            const result=updateScene?.apply(this,arguments);
            if(this._dianaFieldMap){
                const size=globals.$gameMap?.tileWidth?.()||32,actors=this._spriteset?._actorSprites||[],enemies=this._spriteset?._enemySprites||[];
                for(const sprite of [...actors,...enemies]){
                    const home=sprite._dianaFieldHome;if(home&&(sprite._homeX!==home.x||sprite._homeY!==home.y)){sprite.setHome?.(home.x,home.y);sprite.startMove?.(0,0,0);}
                    const main=sprite._mainSprite||sprite,width=main._frame?.width;
                    if(!width||!main.scale?.set)continue;
                    const battler=sprite._actor||sprite._enemy,graphic=globals.ReactorBattlePresentation?.graphicFor?.(battler);
                    if(graphic?.type==='model')continue;
                    const other=(sprite._actor?enemies:actors).find(s=>s.visible!==false),nativeLeft=!!sprite._actor||graphic?.type==='sv',sourceLeft=graphic?.mirror?!nativeLeft:nativeLeft;
                    const direction=graphic?.type==='character'||!other?1:sourceLeft===(other.x<sprite.x)?1:-1;
                    const scale=(graphic?.scale||1)*Math.min(1,size*1.6/width);
                    main.scale.set(scale*direction,scale);
                }
            }
            return result;
        };
        const SceneMap=globals.Scene_Map;
        if(SceneMap){const encounter=SceneMap.prototype.startEncounterEffect;SceneMap.prototype.startEncounterEffect=function(){if(runtimeSettings(globals).mode==='field'){this._encounterEffectDuration=0;this._mapNameWindow?.hide?.();return;}return encounter?.apply(this,arguments);};}
        const startBattle = BattleManager.startBattle;
        BattleManager.startBattle = function() {
            resetBattleCombos(globals);
            return startBattle.apply(this, arguments);
        };
        const startAction = BattleManager.startAction;
        BattleManager.startAction = function() {
            const result = startAction.apply(this, arguments);
            const action = this._action || this._subject?.currentAction?.();
            const item = action?.item?.();
            const comboFinisher=this._dianaExecutingComboFinisher===true;
            this._dianaExecutingComboFinisher=false;
            if (!comboFinisher && item?.id && action?.isSkill?.()) {
                const settings = runtimeSettings(globals);
                this._dianaComboTracker ||= new ComboTracker(settings);
                const combo = this._dianaComboTracker.record(this._subject, item.id);
                if (combo) {
                    this._dianaLastCombo = combo;
                    const unlocked = combo.resultSkillId && unlockSkill(this._subject, combo.resultSkillId);
                    if(combo.autoExecute&&combo.resultSkillId){const opponents=this._subject?.isActor?.()?globals.$gameTroop?.aliveMembers?.():globals.$gameParty?.battleMembers?.();
                        if(this._subject?.forceAction&&typeof this.forceAction==='function'&&opponents?.length){this._dianaPendingComboAction={subject:this._subject,skillId:combo.resultSkillId,targetIndex:Number.isInteger(action?.targetIndex?.())?action.targetIndex():-1};}
                    }
                    this._logWindow?.addText?.(unlocked ? `Combo: ${combo.id}. Nova habilidade disponível nesta batalha.` : `Combo: ${combo.id}.`);
                }
            }
            return result;
        };
        const endAction=BattleManager.endAction;
        BattleManager.endAction=function(){
            const result=endAction.apply(this,arguments),pending=this._dianaPendingComboAction;this._dianaPendingComboAction=null;
            if(pending&&pending.subject?.isAlive?.()!==false){const opponents=pending.subject?.isActor?.()?globals.$gameTroop?.aliveMembers?.():globals.$gameParty?.battleMembers?.();
                if(opponents?.length&&typeof this.forceAction==='function'){pending.subject.forceAction(pending.skillId,pending.targetIndex);this._dianaExecutingComboFinisher=true;this.forceAction(pending.subject);}
            }
            return result;
        };
        const endBattle = BattleManager.endBattle;
        BattleManager.endBattle = function() {
            try {
                return endBattle.apply(this, arguments);
            } finally {
                resetBattleCombos(globals);
            }
        };
        const GameActor = globals.Game_Actor;
        if (GameActor?.prototype && !GameActor.prototype._dianaCombatModesInstalled) {
            GameActor.prototype._dianaCombatModesInstalled = true;
            const skills = GameActor.prototype.skills;
            GameActor.prototype.skills = function() {
                const known = skills.apply(this, arguments);
                const ids = new Set(known.map(skill => skill.id));
                return [...known, ...temporarySkills(this).filter(id => !ids.has(id)).map(id => globals.$dataSkills?.[id]).filter(Boolean)];
            };
            const isLearnedSkill = GameActor.prototype.isLearnedSkill;
            if (isLearnedSkill) GameActor.prototype.isLearnedSkill = function(skillId) {
                return temporarySkills(this).includes(skillId) || isLearnedSkill.apply(this, arguments);
            };
        }
        return true;
    }

    function mountEditor(host, { system, skills = [], onChange } = {}) {
        if (!host || !system || !root.document) throw new Error('mountEditor requer host DOM e System.json.');
        const config = system.dianaCombat ? clone(system.dianaCombat) : defaults();
        const commit = () => { system.dianaCombat = clone(config); onChange?.(clone(config), validateSettings(config, skills)); };
        const make = (tag, text) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; return node; };
        const render = () => {
            host.replaceChildren();
            const title = make('h3', 'Modos de combate');
            const mode = make('select');
            mode.setAttribute('aria-label','Modo de combate');
            for (const [value, label] of [['side', 'Batalha lateral'], ['field', 'No cenário (experimental)']]) { const option = make('option', label); option.value = value; mode.append(option); }
            mode.value = config.mode;
            mode.onchange = () => { config.mode = mode.value; commit(); render(); };
            const row = make('label', 'Modo: '); row.append(mode); host.append(title, row);
            const tacticalDetails = make('details'); tacticalDetails.className = 'diana-tactical-planned';
            tacticalDetails.append(make('summary', 'Preparação tática — planejamento experimental'), make('p', 'A grade e a rota são apenas uma prévia de planejamento; ainda não iniciam nem controlam batalhas táticas.'));
            const tactical = config.tacticalPreparation;
            const controls = make('div');
            const enabled = make('input'); enabled.type = 'checkbox'; enabled.checked = tactical.enabled;
            enabled.onchange = () => { tactical.enabled = enabled.checked; commit(); render(); };
            const enabledLabel = make('label', 'Preparação tática: '); enabledLabel.append(enabled, document.createTextNode(' Ativada'));
            controls.append(enabledLabel);
            for (const [field, label, minimum, maximum] of [['columns', 'Colunas', 2, MAX_GRID_SIDE], ['rows', 'Linhas', 2, MAX_GRID_SIDE], ['movementRange', 'Movimento', 0, MAX_GRID_SIDE], ['attackRange', 'Alcance', 1, MAX_GRID_SIDE]]) {
                const input = make('input'); input.type = 'number'; input.min = minimum; input.max = maximum; input.value = tactical[field];
                input.onchange = () => { tactical[field] = Math.max(minimum, Math.min(maximum, Number(input.value) || minimum)); commit(); render(); };
                const labelNode = make('label', `${label}: `); labelNode.append(input); controls.append(labelNode);
            }
            tacticalDetails.append(make('h4', 'Parâmetros'), controls, make('p', 'Clique nas células para alternar obstáculos.'));
            const grid = make('div'); grid.setAttribute('role', 'grid'); grid.style.display = 'grid'; grid.style.gridTemplateColumns = `repeat(${tactical.columns}, 28px)`;
            const obstacles = new Set(tactical.obstacles.map(key));
            for (let y = 0; y < tactical.rows; y++) for (let x = 0; x < tactical.columns; x++) {
                const point = { x, y }, button = make('button', obstacles.has(key(point)) ? '■' : '·');
                button.type = 'button'; button.setAttribute('aria-label', `Célula ${x}, ${y}`);
                button.onclick = () => { tactical.obstacles = obstacles.has(key(point)) ? tactical.obstacles.filter(item => key(item) !== key(point)) : [...tactical.obstacles, point]; commit(); render(); };
                grid.append(button);
            }
            tacticalDetails.append(grid);
            const preview = { from: { x: 0, y: 0 }, target: { x: tactical.columns - 1, y: tactical.rows - 1 } };
            const previewControls = make('div');
            for (const [name, point, label] of [['from', preview.from, 'Origem'], ['target', preview.target, 'Alvo']]) {
                for (const axis of ['x', 'y']) {
                    const input = make('input'); input.type = 'number'; input.min = 0; input.max = axis === 'x' ? tactical.columns - 1 : tactical.rows - 1; input.value = point[axis];
                    input.onchange = () => { preview[name][axis] = Math.max(0, Math.min(Number(input.max), Number(input.value) || 0)); showPreview(); };
                    const labelNode = make('label', `${label} ${axis.toUpperCase()}: `); labelNode.append(input); previewControls.append(labelNode);
                }
            }
            const previewOutput = make('output');
            const showPreview = () => {
                const result = previewTactical(config, preview.from, preview.target);
                previewOutput.textContent = result.valid ? `Rota: ${result.path.map(key).join(' -> ') || 'sem rota'} (${result.reason})` : result.errors.join(' ');
            };
            tacticalDetails.append(make('h4', 'Prévia de caminho'), previewControls, previewOutput); showPreview();
            host.append(tacticalDetails);
            host.append(make('h4', 'Combos'), make('p', `Cada regra aceita de 2 a ${MAX_COMBO_SKILLS} habilidades existentes e somente registra/libera o resultado: nunca repete golpes automaticamente.`));
            const skillOptions = () => skills.filter(Boolean).map(skill => ({ id: Number(skill.id), name: skill.name || `Habilidade ${skill.id}` })).filter(skill => integer(skill.id) && skill.id > 0);
            for (const combo of config.combos) {
                const row = make('div');
                const id = make('input'); id.value = combo.id; id.setAttribute('aria-label', 'Identificador do combo');
                id.onchange = () => { combo.id = id.value.trim(); commit(); render(); };
                const sequence = make('input'); sequence.value = combo.skillIds.join(', '); sequence.setAttribute('aria-label', 'IDs das habilidades');
                sequence.onchange = () => { combo.skillIds = sequence.value.split(',').map(value => Number(value.trim())).filter(Number.isInteger); commit(); render(); };
                const result = make('select'); result.setAttribute('aria-label', 'Habilidade liberada');
                result.append(make('option', 'Sem habilidade liberada'));
                for (const skill of skillOptions()) { const option = make('option', `#${skill.id} ${skill.name}`); option.value = skill.id; result.append(option); }
                result.value = combo.resultSkillId || '';
                result.onchange = () => { if (result.value) combo.resultSkillId = Number(result.value); else delete combo.resultSkillId; commit(); render(); };
                const auto=make('input');auto.type='checkbox';auto.checked=combo.autoExecute===true;auto.setAttribute('aria-label','Executar habilidade de resultado automaticamente');
                auto.onchange=()=>{combo.autoExecute=auto.checked;commit();render();};
                const remove = make('button', 'Remover'); remove.type = 'button'; remove.onclick = () => { config.combos = config.combos.filter(item => item !== combo); commit(); render(); };
                row.append(make('label', 'Nome: '),id);
                combo.skillIds.forEach((selected,index)=>{
                    const choose=make('select');choose.setAttribute('aria-label',`Habilidade ${index+1} do combo`);
                    for(const skill of skillOptions()){const option=make('option',skill.name);option.value=skill.id;option.disabled=combo.skillIds.includes(skill.id)&&skill.id!==selected;choose.append(option);}
                    choose.value=selected;choose.onchange=()=>{combo.skillIds[index]=Number(choose.value);commit();render();};row.append(choose);
                });
                const append=make('button','Mais um passo');append.type='button';append.disabled=combo.skillIds.length>=MAX_COMBO_SKILLS||!skillOptions().some(s=>!combo.skillIds.includes(s.id));append.onclick=()=>{combo.skillIds.push(skillOptions().find(s=>!combo.skillIds.includes(s.id)).id);commit();render();};
                const trim=make('button','Remover último passo');trim.type='button';trim.disabled=combo.skillIds.length<=2;trim.onclick=()=>{combo.skillIds.pop();commit();render();};
                const advanced=make('details');advanced.append(make('summary','IDs — avançado'),sequence);
                row.append(append,trim,make('label','Habilidade final: '),result,make('label','Executar automaticamente'),auto,remove,advanced);host.append(row);
            }
            const add = make('button', 'Adicionar combo'); add.type = 'button'; add.disabled = config.combos.length >= MAX_COMBOS;
            add.onclick = () => { config.combos.push({ id: `combo-${config.combos.length + 1}`, skillIds: skillOptions().slice(0, 2).map(skill => skill.id) }); commit(); render(); };
            host.append(add);
            const errors = validateSettings(config, skills);
            host.append(make('output', errors.length ? errors.join(' ') : 'Configuração válida.'));
        };
        render();
        return { value: () => clone(config), validate: () => validateSettings(config, skills), refresh: render };
    }

    const api = { MAX_COMBOS, MAX_COMBO_SKILLS, defaults, validateSettings, runtimeSettings, shortestPath, previewTactical, ComboTracker, fieldHomes, hideFieldParticipants, unlockSkill, resetBattleCombos, installRuntime, mountEditor };
    root.DianaCombatModes = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root.Scene_Battle && root.BattleManager) installRuntime(root);
})(globalThis);
