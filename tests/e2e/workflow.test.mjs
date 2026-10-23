import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
const base = process.env.PICZIP_TEST_URL || 'http://127.0.0.1:3100';
const engine = process.env.PICZIP_TEST_BROWSER === 'webkit' ? webkit : chromium;
async function setup(t, path = '/resize-image') {
  const browser = await engine.launch(); t.after(() => browser.close());
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => {
    // WebKit reports Next.js prefetches cancelled by full-page navigation as access errors.
    if(engine === webkit && /_rsc=.*due to access control checks/.test(error.message)) return;
    errors.push(error.message);
  });
  t.after(() => assert.deepEqual(errors, []));
  await page.goto(base + path);
  await page.locator('input[type=file]:enabled').waitFor({ state: 'attached' });
  const buffer = Buffer.from(await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 160; c.height = 80;
    const x = c.getContext('2d'); x.fillStyle = '#287a62'; x.fillRect(0, 0, 160, 80);
    return c.toDataURL().split(',')[1];
  }), 'base64');
  return { page, files: [{ name: 'one.png', mimeType: 'image/png', buffer }, { name: 'two.png', mimeType: 'image/png', buffer }] };
}
async function run(page, tool, count) {
  await page.locator(tool === 'compress' ? '.compressor-actions .primary-button' : '.tool-settings .primary-button').click();
  if(tool === 'compress') await page.waitForFunction(n => document.querySelectorAll('[data-compressed-bytes]').length === n, count);
  else await page.waitForFunction(n => document.querySelectorAll('.tool-output').length === n, count);
  await page.locator('.continue-processing .primary-button:enabled').waitFor();
}
async function send(page, target, expectedPath) {
  await page.locator('.continue-processing select').selectOption(target);
  await page.locator('.continue-processing .primary-button').click();
  await page.waitForURL(url => url.pathname === expectedPath);
  await page.locator('input[type=file]:enabled').waitFor({ state: 'attached' });
  await page.waitForFunction(() => !new URL(location.href).searchParams.has('transfer'));
  await page.waitForFunction(async () => {
    const db = await new Promise((resolve, reject) => { const r = indexedDB.open('piczip-workflow'); r.onsuccess = () => resolve(r.result); r.onerror = reject; });
    const count = await new Promise(resolve => { const r = db.transaction('transfers').objectStore('transfers').count(); r.onsuccess = () => resolve(r.result); });
    db.close(); return count === 0;
  });
}
test('results retain actual pixels through resize → convert → compress → stitch', async t => {
  const { page, files } = await setup(t);
  await page.locator('input[type=file]').setInputFiles(files);
  await page.getByLabel('Width (px)', {exact:true}).fill('80');
  await run(page, 'resize', 2);
  await send(page, 'convert', '/convert-image');
  assert.equal(await page.locator('[data-input-name]').count(), 2);
  await page.getByLabel('Output format').selectOption('jpeg');
  await run(page, 'convert', 2);
  assert.equal(await page.locator('.tool-output').first().getAttribute('data-output-width'), '80');
  await send(page, 'compress', '/');
  assert.equal(await page.locator('.result-row').count(), 2);
  await run(page, 'compress', 2);
  assert.equal(await page.locator('[data-compressed-bytes]').first().getAttribute('data-output-width'), '80');
  await send(page, 'stitch', '/stitch-images');
  await page.getByLabel('Shared width (px)').fill('80');
  await page.getByLabel('Spacing (px)').fill('0');
  await run(page, 'stitch', 1);
  assert.equal(await page.locator('.tool-output').getAttribute('data-output-height'), '80');
  await page.getByLabel('Spacing (px)').fill('10');
  assert.equal(await page.locator('.continue-processing .primary-button').isDisabled(), true);
  await run(page, 'stitch', 1);
  await send(page, 'resize', '/resize-image');
  assert.equal(await page.locator('[data-input-name]').count(), 1);
});
test('presets persist for all four tools, remain scoped, and support apply/delete in five languages', async t => {
  const {page} = await setup(t);
  const routes = { resize: '/resize-image', convert: '/convert-image', stitch: '/stitch-images', compress: '/' };
  for(const [tool, route] of Object.entries(routes)) {
    await page.goto(base + route);
    const presets = page.locator('.batch-presets');
    await presets.locator('summary').click();
    const setting = tool === 'compress' ? page.locator('#compression-target') : tool === 'resize' ? page.getByLabel('Width (px)', {exact:true}) : tool === 'convert' ? page.getByLabel('Output format') : page.getByLabel('Spacing (px)');
    const value = tool === 'compress' ? '321' : tool === 'resize' ? '123' : tool === 'convert' ? 'png' : '33';
    if(tool === 'convert') await setting.selectOption(value); else await setting.fill(value);
    await presets.locator('input').fill('My batch'); await presets.locator('.preset-save').click();
    await page.waitForFunction(tool => JSON.parse(localStorage.getItem('piczip:presets:v1')).some(p => p.tool === tool), tool);
    for(const prefix of ['', '/zh', '/es', '/pt-br', '/ja']) {
      await page.goto(base + prefix + (route === '/' && prefix ? '' : route));
      await presets.locator('summary').click();
      assert.equal(await presets.locator('select option').count(), 2);
      await presets.locator('select').selectOption({label:'My batch'});
      await presets.locator('.preset-row .secondary-button').click();
      const observed = tool === 'compress' ? await page.locator('#compression-target').inputValue() : tool === 'resize' ? await page.locator('.tool-field-pair input').first().inputValue() : tool === 'convert' ? await page.locator('.tool-settings select').last().inputValue() : await page.locator('.tool-field-pair input').last().inputValue();
      assert.equal(observed, value);
    }
    await presets.locator('.icon-button').click();
    assert.equal(await presets.locator('select option').count(), 1);
  }
});
test('all five locales preserve their route when transferring; one image cannot stitch', async t => {
  const {page,files} = await setup(t);
  await page.setViewportSize({width:375,height:812});
  for(const prefix of ['', '/zh','/es','/pt-br','/ja']) {
    await page.goto(base + prefix + '/convert-image');
    await page.locator('input[type=file]:enabled').setInputFiles(files[0]);
    await run(page,'convert',1);
    await page.locator('.continue-processing select').selectOption('stitch');
    await page.locator('.continue-processing .primary-button').click();
    await page.locator('.workflow-error').waitFor();
    assert.equal(new URL(page.url()).pathname,prefix+'/convert-image');
    await send(page,'resize',prefix+'/resize-image');
    assert.equal(await page.locator('[data-input-name]').count(),1);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
});
test('expired links and unavailable storage do not lose results or overwrite presets', async t => {
  const {page,files}=await setup(t,'/convert-image');
  await page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => { const r = indexedDB.open('piczip-workflow'); r.onsuccess = () => resolve(r.result); r.onerror = reject; });
    await new Promise((resolve, reject) => {
      const tx = db.transaction('transfers', 'readwrite');
      tx.objectStore('transfers').put({id:'expired',target:'convert',expires:Date.now()-1000,images:[{name:'expired.png',type:'image/png',bytes:new ArrayBuffer(1)}]});
      tx.oncomplete = resolve; tx.onerror = reject;
    }); db.close();
  });
  await page.goto(base+'/convert-image?transfer=expired');
  await page.locator('.transfer-notice.is-error').waitFor();
  assert.equal(await page.locator('[data-input-name]').count(),0);
  assert.equal(await page.evaluate(async () => {
    const db = await new Promise(resolve => { const r = indexedDB.open('piczip-workflow'); r.onsuccess = () => resolve(r.result); });
    const count = await new Promise(resolve => { const r = db.transaction('transfers').objectStore('transfers').count(); r.onsuccess = () => resolve(r.result); });
    db.close(); return count;
  }),0);
  await page.locator('input[type=file]').setInputFiles(files[0]);
  await run(page,'convert',1);
  await page.evaluate(()=>{ Object.defineProperty(IDBFactory.prototype, 'open', { configurable: true, value() { throw new Error('blocked'); } }); });
  await page.locator('.continue-processing .primary-button').click();
  await page.locator('.workflow-error').waitFor();
  assert.equal(await page.locator('.tool-output').count(),1);
  await page.evaluate(()=>localStorage.setItem('piczip:presets:v1','broken data'));
  await page.goto(base+'/resize-image');
  await page.locator('.batch-presets summary').click();
  await page.locator('.workflow-status').filter({hasText:'unreadable'}).waitFor();
  assert.equal(await page.locator('.batch-presets input').isDisabled(),true);
  assert.equal(await page.evaluate(()=>localStorage.getItem('piczip:presets:v1')),'broken data');
});
