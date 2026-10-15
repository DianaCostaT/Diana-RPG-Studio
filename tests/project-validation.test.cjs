const test=require('node:test'),assert=require('node:assert/strict');
const {validate}=require('../src/DianaProjectValidation.js');
const {validateAssets}=require('../src/DianaProjectValidation.js');
function fixture(){return {system:{partyMembers:[1]},actors:[null,{name:'Diana',classId:1,initialLevel:1}],classes:[null,{name:'Classe',params:Array.from({length:8},()=>[0,100])}],skills:[null,{id:1},{id:2}],states:[null,{restriction:4}]};}
test('prévia aceita dados essenciais e não altera o projeto',()=>{const data=fixture(),before=JSON.stringify(data);assert.deepEqual(validate(data),[]);assert.equal(JSON.stringify(data),before);});
test('prévia identifica grupo, personagem e classe ausentes sem lançar erro',()=>{
    assert.match(validate({}).join('\n'),/grupo inicial/);
    assert.match(validate({system:{partyMembers:{invalid:true}}}).join('\n'),/grupo inicial/);
    const data=fixture();data.system.partyMembers=[99];assert.match(validate(data).join('\n'),/personagem inexistente #99/);
    data.system.partyMembers=[1];data.actors[1].classId=9;assert.match(validate(data).join('\n'),/classe válida/);
});
test('imagens ausentes são identificadas sem alterar dados; nomes repetidos geram um aviso',()=>{
    const data=fixture();data.actors[1].characterName='$Diana';data.tilesets=[null,{tilesetNames:['Piso']}];
    const map={tilesetId:1,events:[null,{pages:[{image:{characterName:'$Diana'}}]}],parallaxName:'Névoa',rrImageLayers:[{name:'Névoa'}]};
    const before=JSON.stringify({data,map}),found=new Set(['characters/$Diana','tilesets/Piso']);
    const errors=validateAssets(data,map,(folder,name)=>found.has(folder+'/'+name));
    assert.equal(errors.length,1);assert.match(errors[0],/img\/parallaxes\/Névoa/);
    assert.equal(JSON.stringify({data,map}),before);
    found.add('parallaxes/Névoa');assert.deepEqual(validateAssets(data,map,(folder,name)=>found.has(folder+'/'+name)),[]);
});
test('prévia impede PV inválido, nível sem parâmetros e contratos de batalha incompletos',()=>{
    const data=fixture();data.classes[1].params[0][1]=0;assert.match(validate(data).join('\n'),/PV iniciais/);
    data.actors[1].initialLevel=20;assert.match(validate(data).join('\n'),/oito parâmetros/);
    data.skills=[null];data.states[1].restriction=0;const messages=validate(data).join('\n');
    assert.match(messages,/habilidade #1/);assert.match(messages,/habilidade #2/);assert.match(messages,/Nocaute/);
});
