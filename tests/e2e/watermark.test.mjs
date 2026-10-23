import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {unzipSync} from 'fflate';
import {chromium,webkit} from 'playwright';
const base=process.env.PICZIP_TEST_URL||'http://127.0.0.1:3100';
const engine=process.env.PICZIP_TEST_BROWSER==='webkit'?webkit:chromium;
async function setup(t,path='/watermark-image'){
 const browser=await engine.launch();t.after(()=>browser.close());const page=await browser.newPage({reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>{if(engine===webkit&&/_rsc=.*due to access control checks/.test(e.message))return;errors.push(e.message)});t.after(()=>assert.deepEqual(errors,[]));await page.goto(base+path);await page.locator('input[type=file]:enabled').first().waitFor({state:'attached'});
 const file=async(name='source.png',color='#000000',width=200,height=100)=>({name,mimeType:'image/png',buffer:Buffer.from(await page.evaluate(({color,width,height})=>{const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,width,height);return c.toDataURL().split(',')[1]},{color,width,height}),'base64')});return {page,file};
}
async function run(page,count=1){await page.locator('.tool-settings .primary-button').click();await page.waitForFunction(n=>document.querySelectorAll('.tool-output').length===n,count);await page.locator('.continue-processing .primary-button:enabled').waitFor()}
async function pixels(page){return page.locator('.tool-output-preview').first().evaluate(async a=>{const b=await createImageBitmap(await(await fetch(a.href)).blob());const c=document.createElement('canvas');c.width=b.width;c.height=b.height;const x=c.getContext('2d');x.drawImage(b,0,0);b.close();return {width:c.width,height:c.height,data:Array.from(x.getImageData(0,0,c.width,c.height).data)}})}
test('text and logo render pixels; logo preset restores; renamed ZIP and transfers agree',async t=>{
 const {page,file}=await setup(t);await page.locator('.tool-source input[type=file]').setInputFiles([await file(),await file('source.png')]);
 await page.getByLabel('Watermark text',{exact:true}).fill('TEST');await run(page,2);let p=await pixels(page);assert.ok(p.data.some((v,i)=>i%4!==3&&v>0));
 await page.getByLabel('Watermark type',{exact:true}).selectOption('logo');await page.getByLabel('Choose logo',{exact:true}).setInputFiles(await file('logo.png','#ff0000',20,10));
 await page.locator('.watermark-controls input[type=file]:enabled').waitFor();
 await page.getByLabel('Position',{exact:true}).selectOption('4');await page.getByLabel('Opacity (%)',{exact:true}).press('End');await run(page,2);
 p=await pixels(page);const i=(50*200+100)*4;assert.deepEqual(p.data.slice(i,i+4),[255,0,0,255]);assert.deepEqual(p.data.slice(0,4),[0,0,0,255]);
 await page.locator('.export-settings summary').click();await page.getByLabel('Rename exports',{exact:true}).check();await page.getByLabel('Base name (blank keeps name)',{exact:true}).fill('product');await page.getByLabel('Prefix',{exact:true}).fill('shop-');
 assert.deepEqual(await page.locator('.tool-output a[download]').evaluateAll(a=>a.map(x=>x.download)),['shop-product-001.png','shop-product-002.png']);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download ZIP',exact:true}).click();const zip=unzipSync(new Uint8Array(await readFile(await(await download).path())));assert.deepEqual(Object.keys(zip),['shop-product-001.png','shop-product-002.png']);
 await page.locator('.batch-presets[data-tool] summary').click();await page.locator('.batch-presets[data-tool] input[maxlength="60"]').fill('Brand');await page.locator('.preset-save').click();
 await page.reload();await page.locator('.batch-presets[data-tool] summary').click();await page.locator('.batch-presets[data-tool] select').selectOption({label:'Brand'});await page.locator('.preset-row .secondary-button').first().click();
 assert.equal(await page.getByLabel('Watermark type',{exact:true}).inputValue(),'logo');await page.locator('.tool-source input[type=file]').setInputFiles(await file());await run(page);p=await pixels(page);assert.deepEqual(p.data.slice(i,i+4),[255,0,0,255]);
 await page.locator('.continue-processing select').selectOption('compress');await page.locator('.continue-processing .primary-button').click();await page.waitForURL(url=>url.pathname==='/');await page.locator('.result-name').waitFor();assert.equal(await page.locator('.result-name').first().innerText(),'shop-product-001.png');
});
test('compression export names update without reprocessing and reach watermark tool',async t=>{
 const {page,file}=await setup(t,'/');await page.evaluate(()=>{window.showSaveFilePicker=undefined});await page.locator('input[type=file]').setInputFiles([await file('a.png'),await file('a.png')]);await page.locator('.compressor-actions .primary-button').click();await page.waitForFunction(()=>document.querySelectorAll('[data-state="done"]').length===2);
 await page.locator('.export-settings summary').click();await page.getByLabel('Rename exports',{exact:true}).check();await page.getByLabel('Base name (blank keeps name)',{exact:true}).fill('final');await page.getByLabel('Add sequence number',{exact:true}).uncheck();
 const names=await page.locator('.result-name').allTextContents();assert.match(names[0],/^final\./);assert.match(names[1],/^final \(2\)\./);
 const single=page.waitForEvent('download');await page.locator('.result-buttons button').first().click();assert.equal((await single).suggestedFilename(),names[0]);
 const download=page.waitForEvent('download');await page.locator('.compressor-actions .secondary-button').click();const zip=unzipSync(new Uint8Array(await readFile(await(await download).path())));assert.deepEqual(Object.keys(zip),names);
 await page.locator('.continue-processing select').selectOption('watermark');await page.locator('.continue-processing .primary-button').click();await page.waitForURL('**/watermark-image*');await page.locator('[data-input-name]').first().waitFor();assert.deepEqual(await page.locator('[data-input-name]').evaluateAll(a=>a.map(x=>x.dataset.inputName)),names);
});
test('all five locales expose tool, guide backlinks, language routes and mobile export settings',async t=>{
 const {page}=await setup(t);const slug='/guides/batch-watermark-and-rename-images';
 for(const prefix of ['', '/zh','/es','/pt-br','/ja']){
  assert.equal((await page.goto(base+prefix+'/guide')).status(),200);await page.locator('main a[href="'+prefix+slug+'"]').click();await page.waitForURL('**'+prefix+slug);
  await page.locator('main a[href="'+prefix+'/watermark-image"]').first().click();await page.waitForURL('**'+prefix+'/watermark-image');await page.locator('.export-settings summary').click();assert.ok(await page.locator('.export-settings input[type=checkbox]').count());
  await page.locator('main > aside a[href="'+prefix+slug+'"]').click();await page.waitForURL('**'+prefix+slug);
  await page.locator('.language-menu summary').click();assert.equal(await page.locator('.language-options a').count(),5);
 }
 await page.setViewportSize({width:375,height:812});await page.goto(base+'/zh/watermark-image');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
});
