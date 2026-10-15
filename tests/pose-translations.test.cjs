'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=process.env.DIANA_BATTLE_SOURCE?path.resolve(process.env.DIANA_BATTLE_SOURCE):path.resolve(__dirname,'../upstream/RPGReactor');
const catalog=vm.runInNewContext(fs.readFileSync(path.join(root,'editor/src/I18nReviewedTranslations.js'),'utf8')+'\nRR_REVIEWED_TRANSLATIONS.text');
const keys=['Cell Width (pixels)','Cell Height (pixels)','Free Rectangle','Spritesheet Picker','Pose Timeline','Play Pose','Pause Pose','Reset Pose','Frame must stay inside the image.','Could not load spritesheet.','Cell size must be a positive integer.'];
test('novos rótulos preservam Unicode e têm tradução nos 17 idiomas',()=>{
    const locales=Object.keys(catalog);assert.equal(locales.length,17);
    for(const locale of locales)for(const key of keys){
        const value=catalog[locale][key];assert.equal(typeof value,'string',locale+': '+key);
        assert.notEqual(value,key,locale+': '+key);
        assert.doesNotMatch(value,/[?\uFFFD]/,locale+': '+key+' Unicode corrompido');
    }
});
test('controles de grade em português preservam célula e retângulo com acentos',()=>{
    assert.equal(catalog.pt['Cell Width (pixels)'],'Largura da célula (pixels)');
    assert.equal(catalog.pt['Free Rectangle'],'Retângulo livre');
    assert.equal(catalog.pt['Could not load spritesheet.'],'Não foi possível carregar a spritesheet.');
});
