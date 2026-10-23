import test from 'node:test';
import assert from 'node:assert/strict';
import {exportNames,defaultRename,validRename} from '../../src/lib/export/names.ts';
import {defaultWatermark,validWatermark,drawWatermark} from '../../src/lib/image-tools/watermark.ts';
import {parsePresets,validSettings} from '../../src/lib/workflow/settings.ts';
test('names preserve extensions, neutralize paths, reserve device names and deduplicate case-insensitively',()=>{
 assert.deepEqual(exportNames(['A.png','a.PNG','a (2).png','../CON.jpg']),['A.png','a (2).png','a (2) (2).png','_CON.jpg']);
 const options={...defaultRename,enabled:true,base:'商品',prefix:'shop-',suffix:'-web',start:9};
 assert.deepEqual(exportNames(['photo.jpg','other.webp'],options),['shop-商品-009-web.jpg','shop-商品-010-web.webp']);
 assert.equal(validRename({...options,start:NaN}),false);
 assert.equal(validRename({...options,prefix:'a'.repeat(61)}),false);
});
test('watermark validates input and positions proportional logo without changing aspect ratio',()=>{
 assert.ok(validWatermark(defaultWatermark));assert.equal(validWatermark({...defaultWatermark,text:'  '}),false);
 for(const value of [{opacity:0},{position:9},{size:Infinity},{kind:'logo'},{logo:'https://example.com/logo.png'}])assert.equal(validWatermark({...defaultWatermark,...value}),false);
 const calls=[];const context={save(){},restore(){},drawImage(...a){calls.push(a)}};
 const logo={width:200,height:100};const value={...defaultWatermark,kind:'logo',logo:'data:image/png;base64,AAAA',size:20,margin:10,opacity:50};
 drawWatermark(context,1000,500,value,logo);assert.deepEqual(calls[0],[logo,850,400,100,50]);assert.equal(context.globalAlpha,.5);
});
test('legacy presets remain valid; new presets validate naming and logo configuration',()=>{
 const old={format:'auto',quality:80,targetKb:200,maxWidth:1200};
 assert.equal(parsePresets(JSON.stringify([{id:'old',tool:'compress',name:'old',settings:old}])).length,1);
 assert.equal(validSettings('compress',{...old,rename:{...defaultRename,start:-1}}),false);
 const water={tool:'watermark',watermark:defaultWatermark,rename:defaultRename,format:'original',quality:90,background:'#ffffff',transparent:false,direction:'vertical',edge:800,gap:0,resize:{mode:'pixels',width:1200,height:0,percent:50,lock:true}};
 assert.ok(validSettings('watermark',water));assert.equal(validSettings('watermark',{...water,watermark:{...defaultWatermark,kind:'logo'}}),false);
});
