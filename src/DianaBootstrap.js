/* Diana integration. Reactor remains the single editor and game runtime. */
(function () {
    'use strict';
    const readLanguage = I18nManager.prototype._readSavedLanguage;
    I18nManager.prototype._readSavedLanguage = function () {
        try {
            const saved = JSON.parse(localStorage.getItem(this.SETTINGS_KEY) || '{}');
            if (!saved.language) return 'pt';
        } catch { return 'pt'; }
        return readLanguage.call(this);
    };
    const translate = I18nManager.prototype.t;
    I18nManager.prototype.t = function (key, ...args) {
        const labels={'app.title':'Diana RPG Studio','menu.about':'Sobre o Diana','about.title':'Sobre o Diana RPG Studio','about.version':'Diana RPG Studio 0.2.6','about.description':'Crie JRPGs com mapas, personagens, eventos e combate editáveis.','about.compatibility':'Versão local em desenvolvimento. Licenças e avisos de terceiros acompanham o aplicativo.'};
        if(Object.prototype.hasOwnProperty.call(labels,key))return labels[key];
        const value=translate.call(this,key,...args);return typeof value==='string'?value.replace(/RPG Reactor/g,'Diana RPG Studio'):value;
    };
    if (typeof window !== 'undefined' && window.I18n) window.I18n.language = window.I18n._readSavedLanguage();
    ProjectManager.prototype.getTemplateProjectPath = function () { return null; };
    const starter = ProjectManager.prototype.getStarterData;
    if (starter && typeof DianaStarterData !== 'undefined') {
        ProjectManager.prototype.getStarterData = function (name) {
            return DianaStarterData.populate(starter.call(this, name));
        };
    }
    const create = ProjectManager.prototype.createNewProject;
    ProjectManager.prototype.createNewProject = async function (target, name, options = {}) {
        const ok = await create.call(this, target, name, {...options, blank:true});
        if (!ok) return false;
        try {
            const illustrated = true;
            if (typeof DianaStarterData !== 'undefined') DianaStarterData.writeAssets(this, target, {illustrated});
            if (illustrated && typeof DianaJRPGSample !== 'undefined') DianaJRPGSample.installProject(this,target);
            const file = this.path.join(target, 'project.rpgreactor');
            const data = JSON.parse(this.fs.readFileSync(file, 'utf8'));
            const distribution = this.path.join(this.getRuntimePath(), '..');
            for (const notice of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) {
                this.fs.copyFileSync(this.path.join(distribution, notice), this.path.join(target, notice));
            }
            data.diana = {schemaVersion:1, studioVersion:'0.2.6',mode:options.dianaMode==='hybrid'?'hybrid':'2d',sample:'vila-da-clareira'};
            this._writeFileAtomic(this.fs, file, JSON.stringify(data,null,2), 'utf8');
            return true;
        } catch (error) {
            this.lastCreateError = String(error.message || error);
            return false;
        }
    };
    const dialog = UIManager.prototype.showNewProjectDialog;
    UIManager.prototype.showNewProjectDialog = function (options = {}) {
        const result=dialog.call(this, {...options, defaultName:'Meu jogo', hasTemplate:false});
        document.getElementById?.('rr-new-project-template-demo')?.closest('label')?.remove();
        const choice=document.getElementById?.('rr-new-project-template-blank')?.closest('label');
        const description=choice?.lastElementChild;
        if(description?.children.length>=2){
            description.children[0].textContent='Projeto inicial Diana';
            description.children[1].textContent='Vila da Clareira, RTP Medieval nativo e batalha prontos para editar. Este é o ponto de partida obrigatório; após criar, substitua qualquer asset livremente.';
            description.setAttribute('data-rr-i18n-skip','');
        }
        return result;
    };
    document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.lang = 'pt-BR';
        document.title = 'Diana RPG Studio';
        if (typeof RPGReactor !== 'undefined' && typeof DianaProjectValidation !== 'undefined') {
            const play = RPGReactor.prototype.playtest;
            RPGReactor.prototype.playtest = async function (...args) {
                if (this.projectController.getCurrentProject()) {
                    const errors = DianaProjectValidation.validate(this.databaseManager.data);
                    const project=this.projectController.getCurrentProject(),manager=this.projectManager;
                    if (typeof RRAssetFiles !== 'undefined' && manager?.path) {
                        errors.push(...DianaProjectValidation.validateAssets(this.databaseManager.data,
                            this.projectController.tilemapManager?.currentMap,
                            (folder,name)=>!!RRAssetFiles.findImage(manager.path.join(project.path,'img',folder),name)));
                    }
                    if (errors.length) {
                        const message = 'Corrija estes dados antes de testar o jogo:\n\n' + errors.join('\n');
                        this.uiManager.updateStatus('Teste cancelado: dados essenciais incompletos.');
                        await RRDialog.alert(message, {title:'Verificar projeto',kind:'warning'});
                        return false;
                    }
                }
                return play.apply(this, args);
            };
        }
    });
})();
