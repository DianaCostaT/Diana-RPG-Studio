'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const logPath=path.join(root,'artifacts','upstream-tests-20261015.log');
const bytes=fs.readFileSync(logPath);
const log=bytes.toString(bytes[0]===0xff&&bytes[1]===0xfe?'utf16le':'utf8').replace(/^\uFEFF/,'');
const count=key=>Number(log.match(new RegExp('ℹ '+key+' (\\d+)'))?.[1]||0);
const failures=[...log.matchAll(/test at ([^\r\n]+)\r?\n✖ ([^\r\n]+)\r?\n([\s\S]*?)(?=\r?\ntest at |$)/g)].map(match=>{
    const [_,location,name,details]=match;
    let category='unresolved';
    if(/EPERM[\s\S]*symlink/.test(details))category='environment-symlink-permission';
    else if(/spawnSync (?:unzip|zip)[\s\S]*ENOENT/.test(details))category='environment-missing-archive-tool';
    else if(/supported only on Linux/.test(details))category='environment-linux-only';
    else if(location.includes('i18n.test.cjs'))category='diana-localization-regression';
    else if(/POSIX|file:\/\/\/C:|rr-dbsections|rr-dbselection/.test(details+' '+name))category='platform-assumption-needs-review';
    return {location,name,category,detail:details.slice(0,1400)};
});
const categories={};for(const failure of failures)categories[failure.category]=(categories[failure.category]||0)+1;
const report={at:new Date().toISOString(),log:path.relative(root,logPath),tests:count('tests'),pass:count('pass'),fail:count('fail'),skipped:count('skipped'),
    scope:'Historical full upstream run on Windows after animation-poses.patch, before localization fix. Not a baseline run. Heuristic classifications need review.',categories,failures};
fs.writeFileSync(path.join(root,'artifacts','upstream-test-report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({tests:report.tests,pass:report.pass,fail:report.fail,skipped:report.skipped,categories},null,2));
