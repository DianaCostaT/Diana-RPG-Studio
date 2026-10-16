const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const root=process.env.DIANA_BATTLE_SOURCE?path.resolve(process.env.DIANA_BATTLE_SOURCE):path.resolve(__dirname,'../upstream/RPGReactor'),B=require(path.join(root,'editor/src/battle/BattleData.js'));
test('contrato Diana aceita sequências grandes e mantém legado',()=>{const frames=Array.from({length:100},(_,i)=>i%80),grid={version:1,columns:10,rows:8,anchor:{x:.5,y:1},animations:{walk:{frames,speed:2,loop:true},attack:{frames:[79,0,79,1],speed:3,loop:'once'}}};assert.deepEqual(B.validateSpriteAnimation(grid),[]);assert.equal(B.spriteGridFrame({spriteAnimation:grid},1000,800,'walk',198).x,900);assert.equal(B.spriteGridFrame({spriteAnimation:grid},1000,800,'attack',999).x,100);assert.equal(B.graphicFrame({type:'static'},100,80,'idle',0).width,100);});
test('atores e inimigos compartilham grade e composição por clique',()=>{const grid={version:1,columns:4,rows:2,anchor:{x:.5,y:1},animations:{idle:{frames:[],speed:6,loop:true}}};[0,3,4,7,4].forEach(cell=>grid.animations.idle.frames.push(cell));for(const kind of ['actors','enemies']){const graphic=B.graphic({[kind]:{1:{graphic:{mode:'static',name:'sheet',spriteAnimation:grid}}}},kind,1,{});assert.deepEqual(B.graphicFrame(graphic,400,200,'idle',18),{x:300,y:100,width:100,height:100,anchor:{x:.5,y:1}});}});
test('patch instala loop depois do decode e antes dos ouvintes de reprodução',()=>{
 const patch=fs.readFileSync(path.resolve(__dirname,'../patches/zzzzzzz-diana-sprite-audio-contract.patch'),'utf8');
 const hunk=patch.slice(patch.indexOf('diff --git a/runtime/reactor_core_io.js'),patch.indexOf('diff --git a/runtime/reactor_managers.js'));
 assert.match(hunk,/WebAudio\.prototype\._onDecode/);assert.match(hunk,/this\._dianaLoop/);assert.match(hunk,/this\._loopStartTime = this\._dianaLoop\.start/);assert.match(hunk,/this\._loopLengthTime = this\._dianaLoop\.end - this\._dianaLoop\.start/);
});
test('patch aplica velocidade, repetição, repouso e preserva actorHomes/[fN]',()=>{
 const patch=fs.readFileSync(path.resolve(__dirname,'../patches/zzzzzzz-diana-sprite-audio-contract.patch'),'utf8'),source=patch,sprites=patch;
 assert.match(source,/dianaWalkAnimation/);assert.match(source,/animation\.loop === true \? 0/);assert.match(source,/dianaWalkAnimation\(\)\?\.speed/);
 assert.match(sprites,/dianaGridForCharacter/);assert.doesNotMatch(sprites,/Sprite_Actor\.prototype\.setActorHome/);
});
test('hunk do runtime declara todas as linhas de grade para não truncar o jogo preparado',()=>{
 const patch=fs.readFileSync(path.resolve(__dirname,'../patches/zzzzzzz-diana-sprite-audio-contract.patch'),'utf8');
 const lines=patch.split(/\r?\n/),start=lines.findIndex(line=>line.startsWith('@@ -465,3 ')),end=lines.findIndex((line,index)=>index>start&&line.startsWith('diff --git '));
 assert.ok(start>=0&&end>start);
 const declared=Number(lines[start].match(/\+465,(\d+)/)[1]),actual=lines.slice(start+1,end).filter(line=>line.startsWith('+')||line.startsWith(' ')).length;
 assert.equal(declared,actual);
});
