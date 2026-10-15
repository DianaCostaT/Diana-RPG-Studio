'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {presets,tokens}=require('../src/DianaThemes.js');const {png,ico}=require('../scripts/diana-icons.cjs');
function luminance(hex){const c=hex.slice(1).match(/../g).map(n=>parseInt(n,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
test('temas têm contraste AA em texto, legenda, campo e ação principal',()=>{
 for(const p of presets){const t=tokens(p.id).values;for(const [text,bg] of [['text','bg-surface'],['text-muted','bg-surface'],['text','bg-input'],['accent-on','accent']])assert.ok(contrast(t['--color-'+text],t['--color-'+bg])>=4.5,p.id+' '+text);}
});
test('marca original produz PNG e ICO multirresolução determinísticos',()=>{
 const image=png(32);assert.deepEqual(image.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]));assert.equal(image.readUInt32BE(16),32);assert.deepEqual(image,png(32));
 const icon=ico();assert.equal(icon.readUInt16LE(2),1);assert.equal(icon.readUInt16LE(4),4);for(let i=0;i<4;i++){const offset=icon.readUInt32LE(6+i*16+12);assert.equal(icon[offset],137);}
});
