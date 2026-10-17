'use strict';
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
function buildLauncher(destination){
 if(process.platform!=='win32')throw Error('Compilação do launcher exige Windows com .NET Framework local.');
 const system=process.env.WINDIR||'C:\\Windows';
 const compiler=['Framework64','Framework'].map(dir=>path.join(system,'Microsoft.NET',dir,'v4.0.30319','csc.exe')).find(file=>fs.existsSync(file));
 if(!compiler)throw Error('Compilador C# local não encontrado; nenhuma instalação foi realizada.');
 const icon=require('./diana-icons.cjs').generate(path.dirname(destination));
 execFileSync(compiler,['/nologo','/target:winexe','/optimize+','/codepage:65001','/win32icon:'+icon,'/reference:System.Windows.Forms.dll','/out:'+destination,path.resolve(__dirname,'../src/windows/DianaLauncher.cs')],{stdio:'pipe',windowsHide:true});
 if(!fs.existsSync(destination))throw Error('Compilador não produziu o executável do Luae RPG.');
 return destination;
}
module.exports={buildLauncher};
if(require.main===module)buildLauncher(path.resolve(process.argv[2]||'artifacts/Luae RPG.exe'));
