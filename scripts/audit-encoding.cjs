'use strict';
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const extensions = /\.(?:json|ndjson|js|cjs|mjs|ts|tsx|jsx|rs|md|toml|html|css|yml|yaml|txt|patch|cmd|bat|ps1|sh|svg|xml|lock|ini|cfg|conf|properties|csv)$/i;
const decoder = new TextDecoder('utf-8', { fatal: true });
const cp = new TextDecoder('windows-1252');
const bytes = new Map(Array.from({ length: 256 }, (_, n) => [cp.decode(Uint8Array.of(n)), n]));
function decodeMojibake(text) {
    let result = '';
    const chars = Array.from(text);
    for (let i = 0; i < chars.length; i++) {
        const first = bytes.get(chars[i]);
        const count = first >= 0xc2 && first <= 0xdf ? 2 : first >= 0xe0 && first <= 0xef ? 3 : first >= 0xf0 && first <= 0xf4 ? 4 : 0;
        const sequence = chars.slice(i, i + count).map(c => bytes.get(c));
        if (count && sequence.length === count && sequence.slice(1).every(n => n >= 0x80 && n <= 0xbf)) {
            try { result += decoder.decode(Uint8Array.from(sequence)); i += count - 1; continue; } catch {}
        }
        result += chars[i];
    }
    return result;
}
function findings(text, file = 'text.md') {
    const issues = [];
    text.split(/\r?\n/).forEach((line, index) => {
        if (decodeMojibake(line) !== line || line.includes('\ufffd')) issues.push({ line: index + 1, text: line.slice(0, 220), reason: 'mojibake ou caractere de substituição' });
        // Question marks inside a Portuguese word indicate irreversible loss;
        // do not confuse JS nullish operators or punctuation with damaged prose.
        const prose = /\.(?:md|json|ndjson|txt)$/i.test(file);
        const damagedWord = /(?:anima\?\?es|dire\?\?o|cria\?\?o|execu\?\?o|n\?o|pr\?via|c\?lula|inv\?lida|s\? \? gravado)/iu;
        if ((prose && /[\p{L}]{2}\?{2,}[\p{L}]{2}/u.test(line)) || damagedWord.test(line)) {
            issues.push({ line: index + 1, text: line.slice(0, 220), reason: 'possível palavra danificada' });
        }
    });
    return issues;
}
function audit({ fix = false } = {}) {
    const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(file => file && (extensions.test(file) || /(?:^|\/)(?:\.gitignore|\.gitattributes|\.editorconfig|LICENSE|NOTICE|COPYING|Makefile|Dockerfile)$/.test(file)));
    const issues = [];
    for (const file of files) {
        const target = path.join(root, file);
        if (!fs.existsSync(target)) continue;
        let text;
        try { text = decoder.decode(fs.readFileSync(target)); }
        catch { issues.push({ file, reason: 'UTF-8 inválido' }); continue; }
        if (fix) {
            let next = text;
            for (let pass = 0; pass < 4; pass++) { const decoded = decodeMojibake(next); if (decoded === next) break; next = decoded; }
            if (next !== text) fs.writeFileSync(target, next, 'utf8');
            text = next;
        }
        for (const issue of findings(text, file)) issues.push({ file, ...issue });
    }
    return { files: files.length, issues };
}
module.exports = { audit, findings, decodeMojibake };
if (require.main === module) {
    const report = audit({ fix: process.argv.includes('--fix') });
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.issues.length ? 1 : 0;
}
