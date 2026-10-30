import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {unzipSync} from 'fflate';
import {chromium,webkit} from 'playwright';
const base=process.env.PICZIP_TEST_URL||'http://127.0.0.1:3100';
const engine=process.env.PICZIP_TEST_BROWSER==='webkit'?webkit:chromium;
async function setup(t,path='/crop-image'){
 const browser=await engine.launch();t.after(()=>browser.close());const page=await browser.newPage({reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>{if(engine===webkit&&/_rsc=.*due to access control checks/.test(e.message))return;errors.push(e.message)});t.after(()=>assert.deepEqual(errors,[]));
 await page.goto(base+path);await page.locator('input[type=file]:enabled').waitFor({state:'attached'});
 const file=async(name='quadrants.png',width=200,height=100)=>({name,mimeType:'image/png',buffer:Buffer.from(await page.evaluate(({width,height})=>{const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d');for(const [color,left,top] of [['#ff0000',0,0],['#00ff00',width/2,0],['#0000ff',0,height/2],['#ffff00',width/2,height/2]]){x.fillStyle=color;x.fillRect(left,top,width/2,height/2)}return c.toDataURL().split(',')[1]}, {width,height}),'base64')});
 return {page,file};
}
async function run(page,count=1){await page.locator('.tool-settings .primary-button').click();await page.waitForFunction(n=>document.querySelectorAll('.tool-output').length===n,count);await page.locator('.continue-processing .primary-button:enabled').waitFor();}
async function pixels(page){return page.locator('.tool-output').first().evaluate(async e=>{const img=await createImageBitmap(await(await fetch(e.querySelector('a').href)).blob());const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);img.close();return {width:c.width,height:c.height,corners:[[2,2],[c.width-3,2],[2,c.height-3],[c.width-3,c.height-3]].map(([a,b])=>Array.from(x.getImageData(a,b,1,1).data).slice(0,3))}})}
const red=[255,0,0],green=[0,255,0],blue=[0,0,255],yellow=[255,255,0];
test('rotation and both flips export actual transformed pixels; crop preview agrees',async t=>{
 const {page,file}=await setup(t);await page.locator('input[type=file]').setInputFiles(await file());
 await page.locator('.crop-stage[data-ready=true]').waitFor();
 await page.getByRole('button',{name:'Rotate right 90°',exact:true}).click();await run(page);
 let p=await pixels(page);assert.deepEqual([p.width,p.height],[100,200]);assert.deepEqual(p.corners,[blue,red,yellow,green]);
 await page.getByRole('button',{name:'Flip horizontally',exact:true}).click();await run(page);
 p=await pixels(page);assert.deepEqual(p.corners,[red,blue,green,yellow]);
 await page.getByRole('button',{name:'Flip vertically',exact:true}).click();await run(page);
 p=await pixels(page);assert.deepEqual(p.corners,[green,yellow,red,blue]);
 await page.getByRole('button',{name:'Reset edits',exact:true}).click();
 await page.getByLabel('Crop ratio',{exact:true}).selectOption('free');
 await page.getByLabel('Width (%)',{exact:true}).fill('50');await page.getByLabel('Left (%)',{exact:true}).fill('50');
 await run(page);p=await pixels(page);assert.deepEqual([p.width,p.height],[100,100]);assert.deepEqual(p.corners,[green,green,yellow,yellow]);
 const preview=await page.locator('.crop-result-preview canvas').evaluate(c=>Array.from(c.getContext('2d').getImageData(2,2,1,1).data).slice(0,3));assert.deepEqual(preview,green);
});
test('fixed ratio batches preserve differing source geometry and ZIP contents',async t=>{
 const {page,file}=await setup(t);await page.locator('input[type=file]').setInputFiles([await file('same.png',200,100),await file('same.png',100,200)]);
 await page.getByLabel('Crop ratio',{exact:true}).selectOption('1:1');await run(page,2);
 for(const output of await page.locator('.tool-output').all()){assert.equal(await output.getAttribute('data-output-width'),'100');assert.equal(await output.getAttribute('data-output-height'),'100');}
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download ZIP',exact:true}).click();const entries=unzipSync(await readFile(await(await download).path()));assert.equal(Object.keys(entries).length,2);
});
test('drag selection, move, resize and keyboard adjustment update geometry',async t=>{
 const {page,file}=await setup(t);await page.locator('input[type=file]').setInputFiles(await file());await page.locator('.crop-stage[data-ready=true]').waitFor();
 await page.locator('.crop-stage').scrollIntoViewIfNeeded();
 const b=await page.locator('.crop-stage').boundingBox();
 await page.mouse.move(b.x+b.width*.2,b.y+b.height*.2);await page.mouse.down();await page.mouse.move(b.x+b.width*.8,b.y+b.height*.8,{steps:8});await page.mouse.up();
 assert.equal(await page.getByLabel('Crop ratio',{exact:true}).inputValue(),'free');
 assert(Math.abs(Number(await page.getByLabel('Width (%)',{exact:true}).inputValue())-60)<1);
 const selection=page.locator('.crop-selection');await selection.focus();const before=Number(await page.getByLabel('Left (%)',{exact:true}).inputValue());await page.keyboard.press('ArrowRight');assert(Number(await page.getByLabel('Left (%)',{exact:true}).inputValue())>before);
 const corner=await page.locator('.crop-corner').boundingBox();await page.mouse.move(corner.x+12,corner.y+12);await page.mouse.down();await page.mouse.move(corner.x+25,corner.y+20,{steps:5});await page.mouse.up();
 await page.waitForFunction(input => Number(input.value) > 60, await page.getByLabel('Width (%)',{exact:true}).elementHandle());
 assert(Number(await page.getByLabel('Width (%)',{exact:true}).inputValue())>60);
 await run(page);assert((await pixels(page)).width<200);
});
test('crop presets persist in all five locales and hand off to compression',async t=>{
 const {page,file}=await setup(t);
 await page.getByLabel('Crop ratio',{exact:true}).selectOption('1:1');await page.getByRole('button',{name:'Rotate left 90°',exact:true}).click();await page.getByRole('button',{name:'Flip horizontally',exact:true}).click();
 await page.locator('.batch-presets summary').click();await page.locator('.batch-presets input').fill('Square mirrored');await page.locator('.preset-save').click();
 for(const prefix of ['', '/zh','/es','/pt-br','/ja']){
  await page.goto(base+prefix+'/crop-image');await page.locator('.batch-presets summary').click();await page.locator('.batch-presets select').selectOption({label:'Square mirrored'});await page.locator('.preset-row .secondary-button').click();
  assert.equal(await page.locator('.crop-controls select').inputValue(),'1:1');assert.equal(await page.locator('.crop-transform-buttons [aria-pressed=true]').count(),1);assert.match(await page.locator('.crop-reset').innerText(),/270°/);
  await page.setViewportSize({width:375,height:812});await page.locator('input[type=file]:enabled').setInputFiles(await file());await run(page);assert.equal((await pixels(page)).width,100);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('.continue-processing select').selectOption('compress');await page.locator('.continue-processing .primary-button').click();await page.waitForURL(u=>u.pathname===(prefix||'/'));await page.locator('.result-row').waitFor();
  assert.equal(await page.locator('.result-row').count(),1);
  await page.locator('.compressor-actions .primary-button').click();await page.locator('.continue-processing .primary-button:enabled').waitFor();
  await page.locator('.continue-processing select').selectOption('crop');await page.locator('.continue-processing .primary-button').click();await page.waitForURL(u=>u.pathname===prefix+'/crop-image');await page.locator('[data-input-name]').waitFor();assert.equal(await page.locator('[data-input-name]').count(),1);
 }
});
