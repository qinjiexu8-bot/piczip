import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { unzipSync } from 'fflate';
const base = process.env.PICZIP_TEST_URL || 'http://127.0.0.1:3100';
const browserType = process.env.PICZIP_TEST_BROWSER === 'webkit' ? webkit : chromium;
async function setup(t, path) {
  const browser = await browserType.launch(); t.after(() => browser.close());
  const page = await browser.newPage();
  const uploads = [], errors = [];
  page.on('request', r => { if (['POST', 'PUT', 'PATCH'].includes(r.method())) uploads.push(r.url()); });
  page.on('pageerror', e => errors.push(e.message));
  t.after(() => { assert.deepEqual(uploads, []); assert.deepEqual(errors, []); });
  await page.goto(base + path);
  await page.locator('input[type=file]:enabled').waitFor({ state: 'attached' });
  const file = async (name, color = '#ff0000', width = 200, height = 100, transparent = false) => {
    const data = await page.evaluate(({ color, width, height, transparent }) => {
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = color;
      ctx.fillRect(transparent ? width / 2 : 0, 0, transparent ? width / 2 : width, height);
      return canvas.toDataURL().split(',')[1];
    }, { color, width, height, transparent });
    return { name, mimeType: 'image/png', buffer: Buffer.from(data, 'base64') };
  };
  return { page, file };
}
async function run(page, action, count = 1) {
  await page.getByRole('button', { name: action, exact: true }).click();
  await page.waitForFunction(n => document.querySelectorAll('[data-output-width]').length === n, count);
  await page.getByRole('button', { name: action, exact: true }).waitFor();
}
async function pixels(page, index = 0) {
  return page.locator('.tool-output').nth(index).evaluate(async article => {
    const blob = await (await fetch(article.querySelector('a').href)).blob();
    const image = await createImageBitmap(blob); const canvas = document.createElement('canvas');
    canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0); image.close();
    return { width: canvas.width, height: canvas.height, type: blob.type, first: [...ctx.getImageData(2, 2, 1, 1).data], middle: [...ctx.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data], last: [...ctx.getImageData(canvas.width - 3, canvas.height - 3, 1, 1).data] };
  });
}
test('resize: actual pixels, aspect lock, exact stretch, percentage and unique ZIP names', async t => {
  const { page, file } = await setup(t, '/resize-image');
  await page.locator('input[type=file]').setInputFiles([await file('same.png'), await file('same.png')]);
  await page.getByLabel('Width (px)', { exact: true }).fill('80');
  await run(page, 'Resize images', 2);
  const resized = await pixels(page); assert.deepEqual([resized.width, resized.height], [80, 40]);
  const downloadEvent = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download ZIP', exact: true }).click();
  const entries = unzipSync(await readFile(await (await downloadEvent).path()));
  assert.deepEqual(Object.keys(entries), ['same-resize.png', 'same-resize (2).png']);
  for (const bytes of Object.values(entries)) assert.deepEqual(await page.evaluate(async bytes => { const image = await createImageBitmap(new Blob([new Uint8Array(bytes)])); const size = [image.width, image.height]; image.close(); return size; }, [...bytes]), [80, 40]);
  await page.getByLabel('Keep aspect ratio').uncheck(); await page.getByLabel('Height (px)', { exact: true }).fill('60');
  await page.getByText('Settings or images changed. Run again to update these results.').waitFor();
  await run(page, 'Resize images', 2); assert.equal((await pixels(page)).height, 60);
  await page.getByLabel('Resize by').selectOption('percent'); await page.getByLabel('Scale (%)').fill('25');
  await run(page, 'Resize images', 2); assert.equal((await pixels(page)).width, 50); assert.equal((await pixels(page)).height, 25);
});
test('convert: JPG matte, PNG alpha and real WebP encoding', async t => {
  const { page, file } = await setup(t, '/convert-image');
  await page.locator('input[type=file]').setInputFiles(await file('alpha.png', '#ff0000', 200, 100, true));
  await page.getByLabel('Output format').selectOption('jpeg');
  await page.getByLabel('Background color').fill('#00ff00');
  await run(page, 'Convert images');
  let result = await pixels(page); assert.equal(result.type, 'image/jpeg'); assert.ok(result.first[1] > 245 && result.first[0] < 10 && result.first[3] === 255);
  const event = page.waitForEvent('download'); await page.getByRole('link', { name: 'Download alpha-convert.jpg', exact: true }).click();
  const downloaded = await readFile(await (await event).path()); assert.equal(downloaded[0], 0xff); assert.equal(downloaded[1], 0xd8);
  await page.getByLabel('Output format').selectOption('png'); await run(page, 'Convert images');
  result = await pixels(page); assert.equal(result.type, 'image/png'); assert.equal(result.first[3], 0);
  await page.getByLabel('Output format').selectOption('webp'); await run(page, 'Convert images');
  result = await pixels(page); assert.equal(result.type, 'image/webp'); assert.equal(result.first[3], 0); assert.equal(result.width, 200);
  const webpBytes = await page.locator('.tool-output-preview').evaluate(async a => [...new Uint8Array(await (await fetch(a.href)).arrayBuffer())]);
  for (const input of [{ name: 'from-webp.webp', mimeType: 'image/webp', buffer: Buffer.from(webpBytes) }, { name: 'from-jpg.jpg', mimeType: 'image/jpeg', buffer: downloaded }]) {
    await page.getByRole('button', { name: 'Clear all' }).click();
    await page.locator('input[type=file]').setInputFiles(input); await page.getByLabel('Output format').selectOption('png');
    await run(page, 'Convert images'); const decoded = await pixels(page);
    assert.equal(decoded.type, 'image/png'); assert.deepEqual([decoded.width, decoded.height], [200, 100]);
  }
});
test('stitch: dimensions, ordering, spacing and transparent horizontal output', async t => {
  const { page, file } = await setup(t, '/stitch-images');
  await page.locator('input[type=file]').setInputFiles([await file('red.png'), await file('blue.png', '#0000ff', 100, 100)]);
  assert.equal(await page.getByLabel('Spacing (px)').inputValue(), '0');
  await page.getByLabel('Shared width (px)').fill('100');
  await run(page, 'Stitch images');
  assert.deepEqual([(await pixels(page)).width, (await pixels(page)).height], [100, 150]);
  await page.getByLabel('Spacing (px)').fill('10');
  await run(page, 'Stitch images'); let result = await pixels(page);
  assert.deepEqual([result.width, result.height, result.first, result.last], [100, 160, [255, 0, 0, 255], [0, 0, 255, 255]]);
  const gap = await page.locator('.tool-output-preview img').evaluate(img => { const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0); return [...ctx.getImageData(5, 55, 1, 1).data]; });
  assert.deepEqual(gap, [255, 255, 255, 255]);
  await page.getByRole('button', { name: 'Move up blue.png' }).click();
  await page.getByLabel('Direction').selectOption('horizontal'); await page.getByLabel('Shared height (px)').fill('100'); await page.getByLabel('Transparent background').check();
  await run(page, 'Stitch images'); result = await pixels(page);
  assert.deepEqual([result.width, result.height, result.first, result.last], [310, 100, [0, 0, 255, 255], [255, 0, 0, 255]]);
  assert.equal(await page.locator('.tool-output-preview img').evaluate(img => { const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0); return ctx.getImageData(105, 5, 1, 1).data[3]; }), 0);
});
test('bad images and allocation limits report errors without blocking retry', async t => {
  const { page, file } = await setup(t, '/resize-image');
  await page.getByLabel('Width (px)').fill('100');
  await page.locator('input[type=file]').setInputFiles([{ name: 'bad.png', mimeType: 'image/png', buffer: Buffer.from('broken') }, await file('good.png')]);
  await run(page, 'Resize images'); await page.getByRole('alert').filter({ hasText: 'bad.png' }).waitFor();
  await page.getByRole('button', { name: 'Remove bad.png' }).click();
  await page.getByLabel('Width (px)').fill('8193'); await page.getByRole('button', { name: 'Resize images', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Output exceeds' }).waitFor();
  assert.equal(await page.locator('.tool-output').count(), 0);
  await page.getByLabel('Width (px)').fill('100'); await run(page, 'Resize images');
});
test('cancel, clear and worker failure recover with no stale results', async t => {
  const { page, file } = await setup(t, '/convert-image');
  await page.evaluate(() => {
    const NativeWorker = window.Worker; window.workerMode = 'hold'; window.terminations = 0;
    window.Worker = class extends NativeWorker {
      postMessage(...args) { if (window.workerMode === 'hold') return; if (window.workerMode === 'error') { queueMicrotask(() => this.dispatchEvent(new Event('error'))); return; } return super.postMessage(...args); }
      terminate() { window.terminations++; return super.terminate(); }
    };
  });
  await page.locator('input[type=file]').setInputFiles(await file('old.png'));
  await page.getByRole('button', { name: 'Convert images', exact: true }).click(); await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  assert.equal(await page.evaluate(() => window.terminations), 1);
  await page.getByRole('button', { name: 'Convert images', exact: true }).click(); await page.getByRole('button', { name: 'Clear all' }).click();
  await page.locator('input[type=file]').setInputFiles(await file('new.png'));
  await page.evaluate(() => window.workerMode = 'error'); await page.getByRole('button', { name: 'Convert images', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'processor stopped' }).waitFor();
  await page.evaluate(() => window.workerMode = 'normal'); await run(page, 'Convert images');
  assert.equal(await page.locator('.tool-output').count(), 1); assert.equal(await page.getByRole('link', { name: 'Download new-convert.webp', exact: true }).count(), 1);
});
test('Chinese tools, active navigation, locale switching and mobile layout', async t => {
  const { page, file } = await setup(t, '/zh/stitch-images');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByLabel('打开导航菜单').click();
  for (const group of await page.locator('.mobile-category').all()) if (await group.getAttribute('open') === null) await group.locator('summary').click();
  await page.getByRole('navigation', { name: '手机导航', exact: true }).getByRole('link', { name: '尺寸调整' }).click();
  await page.waitForURL('**/zh/resize-image');
  await page.getByRole('heading', { name: '图片尺寸调整', exact: true }).waitFor();
  await page.locator('input[type=file]:enabled').waitFor({ state: 'attached' });
  await page.getByLabel('宽度（像素）', { exact: true }).fill('100'); await page.locator('input[type=file]').setInputFiles(await file('mobile.png'));
  await run(page, '调整尺寸'); assert.equal((await pixels(page)).width, 100);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await page.locator('.language-menu summary').click();
  await page.locator('.language-options').getByRole('link', { name: 'English', exact: true }).click(); await page.waitForURL(url => url.pathname === '/resize-image');
  assert.equal(new URL(page.url()).pathname, '/resize-image');
  await page.setViewportSize({ width: 1440, height: 1000 });
  const active = page.getByRole('navigation', { name: 'Main navigation', exact: true }).locator('.site-nav-link[aria-current=page]');
  assert.equal(await active.innerText(), 'Resize');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
});
