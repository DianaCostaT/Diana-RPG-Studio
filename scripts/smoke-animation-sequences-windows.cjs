'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {main}=require('./smoke-battle-windows.cjs');
async function authoring(driver,project,authored,run){
 const results=[];
 for(const [kind,id] of [['actors',authored.actorId],['enemies',authored.enemyId]]){
  const result=await driver.execute(`const [kind,id]=arguments,ui=reactor.databaseEditorUI,db=reactor.databaseManager,B=ReactorBattleData;
   const records=db.data.actionSequences||=[null],sid=records.length;
   const sequence={id:sid,name:'Animation smoke',version:1,purpose:'action',steps:[B.step('motion',{motion:'idle',duration:20,concurrent:true}),B.step('impact',{role:'allTargets'})]};records.push(sequence);
   ui.openDatabase(kind,{select:id});ui.showDatabaseDetail(db.data[kind][id],kind);
   const card=document.querySelector('details.rr-rectangle-poses');card.open=true;card.closest('.rr-battler-graphic-card').open=true;
   const before=JSON.stringify(db.data.battlePresentation[kind][id].graphic.poses);
   const button=name=>[...card.querySelectorAll('button')].find(b=>b.getAttribute('data-i18n-text-source')===name).click();
   button('Remove Pose');const rejected=JSON.stringify(db.data.battlePresentation[kind][id].graphic.poses)===before;
   card.querySelector('textarea').value='{}';button('Apply JSON');const jsonRejected=JSON.stringify(db.data.battlePresentation[kind][id].graphic.poses)===before;
   ui.openDatabase('actionSequences',{select:sid});ui.showDatabaseDetail(sequence,'actionSequences');
   const checkbox=document.querySelector('[data-sequence-concurrent]');if(!checkbox)throw Error('Concurrent missing from prepared build');
   const initially=checkbox.checked;checkbox.checked=false;checkbox.dispatchEvent(new Event('change',{bubbles:true}));
   const sequential=B.timeline(sequence)[1].start===20;
   const current=document.querySelector('[data-sequence-concurrent]');current.checked=true;current.dispatchEvent(new Event('change',{bubbles:true}));
   const overlapping=B.timeline(sequence)[1].start===0;
   ui.actionSequenceEditor.dispose();records.pop();return {kind,rejected,jsonRejected,initially,sequential,overlapping};
  `,[kind,id]);
  assert.deepEqual(result,{kind,rejected:true,jsonRejected:true,initially:true,sequential:true,overlapping:true});results.push(result);
 }
 // Keep this fixture deterministic when the starter already supplies skill 1.
 // The shared harness only creates its fixed-damage skill when none exists.
 assert.equal(await driver.executeAsync(`const done=arguments[arguments.length-1];
  reactor.databaseManager.data.skills[1].damage={type:1,elementId:0,formula:'100',variance:0,critical:false};
  reactor.projectController.saveProject().then(done,e=>done({failure:String(e)}));`),true);
 fs.writeFileSync(path.join(run,'animation-sequences.json'),JSON.stringify({results,limits:'DOM controls in native NW.js; timeline via API; attack via existing harness; no audible sound or visual trajectory assertion.'},null,2));
 return {results};
}
main({authoring}).catch(error=>{console.error(error.stack||error);process.exitCode=1;});
