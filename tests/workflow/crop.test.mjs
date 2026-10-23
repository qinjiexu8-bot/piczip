import test from 'node:test';
import assert from 'node:assert/strict';
import {cropRectangle,cropOutput,defaultCrop,validCrop} from '../../src/lib/image-tools/crop.ts';
import {parsePresets} from '../../src/lib/workflow/settings.ts';
test('crop bounds, fixed ratios and clockwise dimensions are deterministic',()=>{
 const input={width:400,height:200};
 assert.deepEqual(cropRectangle(input,defaultCrop),{x:0,y:0,width:400,height:200});
 const square={...defaultCrop,ratio:'1:1'};
 assert.deepEqual(cropRectangle(input,square),{x:100,y:0,width:200,height:200});
 const free={...defaultCrop,ratio:'free',x:25,y:25,width:50,height:50};
 assert.deepEqual(cropRectangle(input,free),{x:100,y:50,width:200,height:100});
 assert.deepEqual(cropOutput(input,{...free,rotation:90}),{width:100,height:200});
 assert.equal(cropOutput({width:10000,height:10000},{...free,width:1,height:1}).width,100);
 assert.throws(()=>cropOutput({width:10000,height:10000},defaultCrop),/output-limit/);
 for(const patch of [{x:-1},{width:0},{x:50,width:100},{rotation:45},{ratio:'bad'},{flipX:1},{height:NaN}]) assert.equal(validCrop({...defaultCrop,...patch}),false);
});
test('rounding small fixed-ratio selections keeps pixels inside the original image',()=>{
 for(const width of [1,7,123,1024]) for(const height of [1,9,127,600]) for(const ratio of ['free','original','1:1','16:9','9:16']){
  const rect=cropRectangle({width,height},{...defaultCrop,ratio,x:99,y:99,width:1,height:1});
  assert(rect.width>=1 && rect.height>=1 && rect.x+rect.width<=width && rect.y+rect.height<=height);
 }
});
test('old presets survive adding crop presets without a storage migration',()=>{
 const old={id:'old',name:'Old resize',tool:'resize',settings:{tool:'resize',resize:{mode:'pixels',width:800,height:0,percent:50,lock:true},format:'original',quality:90,background:'#ffffff',transparent:false,direction:'vertical',edge:800,gap:16}};
 const added={id:'new',name:'Square',tool:'crop',settings:{...old.settings,tool:'crop',crop:{...defaultCrop,ratio:'1:1'}}};
 assert.equal(parsePresets(JSON.stringify([old,added])).length,2);
 assert.throws(()=>parsePresets(JSON.stringify([{...added,settings:{...added.settings,crop:{...defaultCrop,rotation:45}}}])));
});
