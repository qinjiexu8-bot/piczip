import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePresets, validSettings} from '../../src/lib/workflow/settings.ts';
import {transferAllowed} from '../../src/lib/workflow/transfer.ts';
const settings={format:'webp',quality:82,targetKb:200,maxWidth:2400};
test('invalid stored presets fail closed instead of silently replacing existing data',()=>{
 assert.deepEqual(parsePresets(null),[]);
 assert.throws(()=>parsePresets('broken'));
 assert.throws(()=>parsePresets(JSON.stringify([{id:'a',name:'test',tool:'compress',settings:{...settings,quality:999}}])));
 assert.throws(()=>parsePresets(JSON.stringify([{id:'a',name:'test',tool:'resize',settings}])));
 assert.equal(parsePresets(JSON.stringify([{id:'a',name:'商品图',tool:'compress',settings}]))[0].name,'商品图');
 assert.equal(validSettings('compress',{...settings,maxWidth:NaN}),false);
});
test('resize presets require usable bounds, or a valid percentage',()=>{
 const options={tool:'resize',resize:{mode:'pixels',width:0,height:0,percent:50,lock:true},format:'original',quality:90,background:'#ffffff',transparent:false,direction:'vertical',edge:800,gap:16};
 assert.equal(validSettings('resize',options),false);
 assert.equal(validSettings('resize',{...options,resize:{...options.resize,width:1200}}),true);
 assert.equal(validSettings('resize',{...options,resize:{...options.resize,width:1200,lock:false}}),false);
 assert.equal(validSettings('resize',{...options,resize:{...options.resize,mode:'percent'}}),true);
});
test('transfer limits reject entire incompatible batches without truncation',()=>{
 const image={name:'x.png',blob:{size:1024,type:'image/png'}};
 assert.equal(transferAllowed([image],'stitch'),false);
 assert.equal(transferAllowed(Array(20).fill(image),'stitch'),true);
 assert.equal(transferAllowed(Array(21).fill(image),'stitch'),false);
 assert.equal(transferAllowed(Array(50).fill(image),'compress'),true);
 assert.equal(transferAllowed(Array(51).fill(image),'compress'),false);
 const large={name:'x.png',blob:{size:50*1024*1024,type:'image/png'}};
 assert.equal(transferAllowed(Array(4).fill(large),'resize'),true);
 assert.equal(transferAllowed(Array(5).fill(large),'resize'),false);
 assert.equal(transferAllowed([{name:'x.gif',blob:{size:1,type:'image/gif'}}],'convert'),false);
});
