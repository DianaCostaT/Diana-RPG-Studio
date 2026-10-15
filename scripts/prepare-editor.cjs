'use strict';
const path=require('node:path');
const args=process.argv.slice(2);
if(args.length&&(args.length!==2||args[0]!=='--out'))throw Error('Uso: prepare-editor.cjs [--out build/nome]');
require('./prepare-source.cjs').prepareEditor(undefined,args[1]?path.resolve(args[1]):undefined);
