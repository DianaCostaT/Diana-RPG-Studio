'use strict';
const path=require('node:path'),os=require('node:os'),fs=require('node:fs');
const identifier='br.luaerpg.studio';
function appPaths({platform=process.platform,env=process.env,home=os.homedir()}={}){
 let config,data,cache;
 if(platform==='win32'){config=path.join(env.APPDATA||path.join(home,'AppData','Roaming'),identifier);data=path.join(env.LOCALAPPDATA||path.join(home,'AppData','Local'),identifier);cache=path.join(data,'cache');}
 else if(platform==='darwin'){data=path.join(home,'Library','Application Support',identifier);config=data;cache=path.join(home,'Library','Caches',identifier);}
 else{config=path.join(env.XDG_CONFIG_HOME||path.join(home,'.config'),identifier);data=path.join(env.XDG_DATA_HOME||path.join(home,'.local','share'),identifier);cache=path.join(env.XDG_CACHE_HOME||path.join(home,'.cache'),identifier);}
 return {config,data,cache,logs:path.join(data,'logs'),legacyProfile:path.join(data,'profiles','nw-legacy')};
}
function prepareLegacyProfile(workspace,locations=appPaths()){
 const destination=path.resolve(locations.legacyProfile),legacy=path.resolve(workspace,'artifacts','profile');
 fs.mkdirSync(path.dirname(destination),{recursive:true});fs.mkdirSync(locations.logs,{recursive:true});
 if(!fs.existsSync(destination)){
  if(fs.existsSync(legacy)){
   const staging=fs.mkdtempSync(path.join(path.dirname(destination),'nw-migration-'));
   // Preserve the old profile; only regular files/directories are copied.
   fs.cpSync(legacy,staging,{recursive:true,filter:source=>!fs.lstatSync(source).isSymbolicLink()});
   fs.renameSync(staging,destination);
  }else fs.mkdirSync(destination,{recursive:true});
 }
 return {...locations,legacyProfile:destination};
}
module.exports={identifier,appPaths,prepareLegacyProfile};
