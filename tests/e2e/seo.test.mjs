import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.PICZIP_TEST_URL||'http://127.0.0.1:3100';
const production='https://piczip.app';
test('sitemap languages match HTML, all alternate URLs exist, and lastmod is stable content data',async t=>{
 const browser=await chromium.launch();t.after(()=>browser.close());const page=await browser.newPage();
 const xml=await(await fetch(base+'/sitemap.xml')).text();
 const entries=await page.evaluate(xml=>Array.from(new DOMParser().parseFromString(xml,'application/xml').querySelectorAll('url')).map(e=>({url:e.querySelector('loc').textContent,date:e.querySelector('lastmod')?.textContent,alternates:Object.fromEntries(Array.from(e.getElementsByTagNameNS('*','link')).map(a=>[a.getAttribute('hreflang'),a.getAttribute('href')]))})),xml);
 const urls=new Set(entries.map(e=>e.url));assert.equal(urls.size,entries.length);assert.ok(entries.length>=124);
 for(let start=0;start<entries.length;start+=4)await Promise.all(entries.slice(start,start+4).map(async entry=>{
  const response=await fetch(base+new URL(entry.url).pathname);assert.equal(response.status,200,entry.url);
  const html=await response.text();const data=await page.evaluate(html=>{const d=new DOMParser().parseFromString(html,'text/html');return {alternates:Object.fromEntries(Array.from(d.querySelectorAll('link[hreflang]')).map(a=>[a.getAttribute('hreflang'),a.getAttribute('href')])),canonical:d.querySelector('link[rel=canonical]')?.getAttribute('href')}},html);
  const normalized = values => Object.fromEntries(Object.entries(values).map(([lang,url])=>[lang,new URL(url).href]));
  assert.deepEqual(normalized(entry.alternates),normalized(data.alternates),entry.url);
  for(const url of Object.values(entry.alternates))assert.ok(urls.has(url),`${entry.url} → ${url}`);
  assert.equal(new URL(data.canonical).href,new URL(entry.url).href);
  if(entry.date)assert.match(entry.date,/T00:00:00\.000Z$/);
 }));
 assert.equal(entries.find(e=>e.url===production+'/about').date,undefined);
 assert.equal(entries.find(e=>e.url===production+'/guides/compress-image-to-100kb-without-uploading').date,'2026-07-29T00:00:00.000Z');
 for(const prefix of ['', '/zh','/es','/pt-br','/ja']){
  assert.equal(entries.find(e=>e.url===production+prefix+'/guide').date,'2026-10-29T00:00:00.000Z');
  for(const slug of ['add-image-padding-and-expand-canvas','pixelate-and-redact-images'])assert.equal(entries.find(e=>e.url===production+prefix+'/guides/'+slug).date,'2026-10-29T00:00:00.000Z');
  for(const slug of ['crop-rotate-flip-images','batch-watermark-and-rename-images'])assert.equal(entries.find(e=>e.url===production+prefix+'/guides/'+slug).date,'2026-10-23T00:00:00.000Z');
 }
});
test('ten new guide Articles match visible text, dates, language and canonical; watermark descriptions are distinct',async t=>{
 const browser=await chromium.launch();t.after(()=>browser.close());const p=await browser.newPage();
 for(const [prefix,lang] of [['','en'],['/zh','zh-CN'],['/es','es'],['/pt-br','pt-BR'],['/ja','ja']]){
  await p.goto(base+prefix+'/watermark-image');const toolDescription=await p.locator('meta[name=description]').getAttribute('content');
  for(const slug of ['crop-rotate-flip-images','batch-watermark-and-rename-images']){
   const path=prefix+'/guides/'+slug;await p.goto(base+path);
   const data=await p.evaluate(()=>({title:document.querySelector('h1').textContent,description:document.querySelector('meta[name=description]').content,og:document.querySelector('meta[property="og:description"]').content,twitter:document.querySelector('meta[name="twitter:description"]').content,canonical:document.querySelector('link[rel=canonical]').href,dates:Array.from(document.querySelectorAll('[data-guide-publication] time')).map(e=>e.dateTime),schemas:Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(e=>JSON.parse(e.textContent))}));
   const articles=data.schemas.filter(s=>s['@type']==='Article');assert.equal(articles.length,1);const a=articles[0];
   assert.equal(a.headline,data.title);assert.equal(a.description,data.description);assert.equal(a.description,data.og);assert.equal(a.description,data.twitter);assert.equal(a.url,data.canonical);assert.equal(a.mainEntityOfPage['@id'],a.url);assert.equal(a.inLanguage,lang);assert.deepEqual(data.dates,[a.datePublished,a.dateModified]);assert.equal(a.author.name,'PicZip');assert.equal(a.dateModified,'2026-10-23');
   assert.ok(await p.locator('main').innerText().then(text=>text.includes(a.description)));
   if(slug.startsWith('batch-'))assert.notEqual(a.description,toolDescription);
   await p.locator('.language-menu summary').click();assert.equal(await p.locator('.language-options a').count(),5);
  }
 }
});
