const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = process.env.DIANA_BATTLE_SOURCE ? path.resolve(process.env.DIANA_BATTLE_SOURCE) : path.resolve(__dirname, '../../upstream/RPGReactor');
assert.ok(fs.existsSync(path.join(root, 'editor/src/battle/BattleData.js')), 'battle source exists');

for (const dataFile of ['editor/src/battle/BattleData.js', 'runtime/reactor_battle_data.js', ...(process.env.DIANA_BATTLE_SOURCE ? [] : ['template/Demo/js/reactor_battle_data.js'])]) {
    const B = require(path.join(root, dataFile));
    test(`${dataFile}: held poses select exact columns and preserve walking playback`, () => {
        const graphic = {type:'character', name:'$Diana', frames:3, speed:12, motions:{walk:{speed:5, loop:true}}};
        assert.equal(B.graphicFrame(graphic, 90, 160, 'walk', 15, 90).x, 30);
        for (let frame = 0; frame < 3; frame++) {
            assert.equal(B.graphicFrame(graphic, 90, 160, 'walk', 999, 90, frame).x, frame * 30);
        }
        assert.equal(B.graphicFrame(graphic, 90, 160, 'walk', 0, 90, 99).x, 60);
        assert.equal(B.graphicFrame(graphic, 90, 160, 'walk', 0, 90, -1).x, 0);
    });
}

for (const runtime of ['runtime', ...(process.env.DIANA_BATTLE_SOURCE ? [] : ['template/Demo/js'])]) {
    const B = require(path.join(root, runtime, 'reactor_battle_data.js'));
    const context = {ReactorBattleData:B, DataManager:{isDatabaseLoaded:()=>true}};
    vm.runInNewContext(fs.readFileSync(path.join(root, runtime, 'reactor_battle_presentation.js'), 'utf8'), context);
    for (const side of ['actor', 'enemy']) {
        test(`${runtime}: ${side} holds requested pose despite custom speed and resumes on clear`, () => {
            const graphic = {type:'sv', frames:3, speed:12, motions:{walk:{index:0, speed:5, loop:true}}};
            let actual;
            const sprite = {
                ['_' + side]:{}, _rrGraphicFrame:15, _rrGraphicMotion:{name:'walk', start:0},
                _rrHeldPose:{motion:'walk', frame:2}, _reactorRoomPosition:{facing:90},
                bitmap:{width:270, height:360, isReady:()=>true},
                setFrame:(...args)=>{actual=args;}
            };
            context.ReactorBattlePresentation.updateGraphicFrame(sprite, graphic);
            assert.deepEqual(actual, [60, 0, 30, 60]);
            sprite._rrHeldPose = null;
            context.ReactorBattlePresentation.updateGraphicFrame(sprite, graphic);
            assert.deepEqual(actual, [0, 0, 30, 60]);
        });
    }
}
