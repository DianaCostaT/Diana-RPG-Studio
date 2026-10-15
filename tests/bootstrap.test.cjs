'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname,'../src/DianaBootstrap.js'),'utf8');
function context(saved) {
    class I18nManager { _readSavedLanguage(){return 'en';} t(key){return 'translated:' + key;} }
    class ProjectManager {
        getTemplateProjectPath(){return 'demo';}
        getRuntimePath(){return 'runtime';}
        async createNewProject(target,name,options){this.options=options;return true;}
        _writeFileAtomic(_fs,_file,data){this.written=JSON.parse(data);}
    }
    class UIManager {showNewProjectDialog(options){return options;}}
    const window={I18n:new I18nManager()};
    const document={documentElement:{},addEventListener(_name,cb){cb();}};
    vm.runInNewContext(source,{window,I18nManager,ProjectManager,UIManager,document,
        localStorage:{getItem(){return saved;}}});
    return {I18nManager,ProjectManager,UIManager,document,window};
}
test('português padrão e escolha existente respeitada',()=>{
    for (const saved of [null,'{}','corrompido']) {
        const result = context(saved);
        assert.equal(result.window.I18n.language,'pt');
        assert.equal(new result.I18nManager()._readSavedLanguage(),'pt');
    }
    assert.equal(new (context('{"language":"en"}').I18nManager)()._readSavedLanguage(),'en');
});
test('novo projeto vazio persiste identificação Diana',async()=>{
    const {ProjectManager,UIManager}=context(null);
    const manager=new ProjectManager();
    manager.path={join(){return 'project.rpgreactor';}};
    const copied = [];
    manager.fs={readFileSync(){return '{"name":"Teste"}';},copyFileSync(...args){copied.push(args);}};
    assert.equal(await manager.createNewProject('target','Teste',{blank:false}),true);
    assert.equal(manager.options.blank,true);
    assert.equal(manager.getTemplateProjectPath(),null);
    assert.equal(manager.written.name,'Teste');
    assert.equal(manager.written.diana.schemaVersion,1);
    assert.equal(copied.length,2);
    const options=new UIManager().showNewProjectDialog({hasTemplate:true});
    assert.equal(options.hasTemplate,false);
    assert.equal(options.defaultName,'Meu jogo');
});

test('marca Diana permanece no título ao abrir projeto e traduz outros textos',()=>{
    const {window} = context(null);
    assert.equal(window.I18n.t('app.title'),'Diana RPG Studio');
    assert.equal(window.I18n.t('menu.openProject'),'translated:menu.openProject');
});

test('falha na cópia de licenças retorna erro ao criar projeto',async()=>{
    const {ProjectManager}=context(null);
    const manager=new ProjectManager();
    manager.path=require('node:path');
    manager.fs={readFileSync(){return '{}';},copyFileSync(){throw new Error('aviso ausente');}};
    assert.equal(await manager.createNewProject('target','Teste'),false);
    assert.match(manager.lastCreateError,/aviso ausente/);
});
test('falha ao persistir metadata não é declarada sucesso',async()=>{
    const {ProjectManager}=context(null);
    const manager=new ProjectManager();
    manager.path={join(){return 'file';}};
    manager.fs={readFileSync(){throw new Error('disco indisponível');}};
    assert.equal(await manager.createNewProject('target','Teste'),false);
    assert.match(manager.lastCreateError,/disco indisponível/);
});
