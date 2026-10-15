'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {install,listFolders,createFolderService}=require('../src/DianaWindowsFolders.js');
function fixture(choice){
 const parent=fs.mkdtempSync(path.join(os.tmpdir(),'diana-project-controller-'));
 const alerts=[],calls=[];let dialogChoice=choice===undefined?{name:'Projeto com acentuação',parentPath:parent}:choice;
 class UI{showNewProjectDialog(){calls.push('dialog');return Promise.resolve(dialogChoice);}updateStatus(text){calls.push(text);}}
 class Controller{constructor(){this.uiManager=new UI();this.currentProject={path:'projeto-anterior'};this.projectManager={isSafeProjectName:()=>true,createNewProject:async(target)=>{calls.push(target);return true;}};}async confirmUnsavedChanges(){return true;}async openProjectAtPath(target){this.currentProject={path:target};}}
 const service={pickFolder:async()=>parent};
 install({ProjectController:Controller,UIManager:UI,service,fs,path,home:parent,document:{getElementById:()=>null},alert:async(...args)=>alerts.push(args)});
 return {controller:new Controller(),parent,alerts,calls,service,setChoice:choice=>dialogChoice=choice};
}
test('novo projeto cria e abre sem chamar seletor nativo',async()=>{
 const f=fixture();assert.equal(await f.controller.newProject(),true);assert.equal(f.controller.currentProject.path,path.join(f.parent,'Projeto com acentuação'));assert.deepEqual(f.alerts,[]);
});
test('cancelar não cria nem troca projeto',async()=>{
 const f=fixture(null);assert.equal(await f.controller.newProject(),false);assert.equal(f.controller.currentProject.path,'projeto-anterior');assert.deepEqual(f.calls,['dialog']);
});
test('destino inválido apresenta erro e mantém projeto atual',async()=>{
 const f=fixture({name:'Teste',parentPath:'relativo'});assert.equal(await f.controller.newProject(),false);assert.equal(f.controller.currentProject.path,'projeto-anterior');assert.match(f.alerts[0][0],/caminho absoluto/);assert.equal(f.controller._dianaProjectBusy,false);
});
test('falha de criação é apresentada e permite tentar novamente',async()=>{
 const f=fixture();f.controller.projectManager.createNewProject=async()=>false;f.controller.projectManager.lastCreateError='Pasta ocupada';
 assert.equal(await f.controller.newProject(),false);assert.match(f.alerts[0][0],/Pasta ocupada/);assert.equal(f.controller.currentProject.path,'projeto-anterior');
 f.controller.projectManager.createNewProject=async()=>true;assert.equal(await f.controller.newProject(),true);
});
test('reentrada é bloqueada e exceções não deixam a operação travada',async()=>{
 const f=fixture();let release;f.controller.confirmUnsavedChanges=()=>new Promise(resolve=>release=resolve);
 const pending=f.controller.newProject();assert.equal(await f.controller.newProject(),false);release(false);assert.equal(await pending,false);
 f.controller.confirmUnsavedChanges=async()=>{throw Error('Falha de teste');};assert.equal(await f.controller.newProject(),false);assert.equal(f.controller._dianaProjectBusy,false);assert.match(f.alerts[0][0],/Falha de teste/);
});
test('abrir projeto trata cancelamento e falha sem substituir projeto atual',async()=>{
 const f=fixture();f.service.pickFolder=async()=>null;assert.equal(await f.controller.openProject(),false);assert.equal(f.controller.currentProject.path,'projeto-anterior');
 f.service.pickFolder=async()=>{throw Error('Sem acesso');};assert.equal(await f.controller.openProject(),false);assert.match(f.alerts[0][0],/Sem acesso/);
});
test('browser lista apenas pastas, preserva acentos e reporta acesso inválido por rejeição',async()=>{
 const parent=fs.mkdtempSync(path.join(os.tmpdir(),'diana-folder-list-'));for(const name of ['Mapa 10','Mapa 2','Árvore'])fs.mkdirSync(path.join(parent,name));fs.writeFileSync(path.join(parent,'arquivo.txt'),'não é pasta');
 const folders=await listFolders(fs,parent);assert.equal(folders.length,3);assert.ok(folders.includes('Árvore'));assert.ok(folders.indexOf('Mapa 2')<folders.indexOf('Mapa 10'));
 await assert.rejects(listFolders(fs,path.join(parent,'arquivo.txt')));
 assert.equal(typeof createFolderService({fs,path,document:{},home:parent}).pickFolder,'function');
});
