'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { audit, findings, decodeMojibake } = require('../scripts/audit-encoding.cjs');
test('versioned text is valid UTF-8 without common mojibake', () => {
    const report = audit();
    assert.ok(report.files > 100);
    assert.deepEqual(report.issues, [], JSON.stringify(report.issues, null, 2));
});
test('encoding audit distinguishes damaged prose from valid accents and JS operators', () => {
    assert.equal(decodeMojibake('a\u00c3\u00a7\u00c3\u00a3o'), 'ação');
    assert.equal(findings('quadro \ufffd').length, 1);
    assert.equal(findings('execu' + '??' + 'o').length, 1);
    assert.deepEqual(findings('Âncora, ação, café, São Paulo. Tudo bem??'), []);
    assert.deepEqual(findings('const loop=pose.loop??true; const x=a??b;', 'test.js'), []);
});
