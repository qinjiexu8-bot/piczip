import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { unzipSync } from 'fflate';

const baseURL = process.env.PICZIP_TEST_URL || 'http://127.0.0.1:3100';
const browserType = process.env.PICZIP_TEST_BROWSER === 'webkit' ? webkit : chromium;

async function setup(t, path = '/') {
  const browser = await browserType.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ acceptDownloads: true });
  const uploads = [];
  page.on('request', request => { if (['POST', 'PUT', 'PATCH'].includes(request.method())) uploads.push(request.url()); });
  await page.addInitScript(() => {
    // Keep downloads deterministic; exercise the Blob download path.
    Object.defineProperty(window, 'showSaveFilePicker', { value: undefined });
    const NativeWorker = window.Worker;
    window.__workerMode = 'normal';
    window.__posts = [];
    window.__terminations = 0;
    window.Worker = class extends NativeWorker {
      postMessage(message, ...args) {
        window.__posts.push(message.name);
        if (window.__workerMode === 'hold') return;
        if (window.__workerMode === 'error') {
          queueMicrotask(() => this.dispatchEvent(new Event('error')));
          return;
        }
        return super.postMessage(message, ...args);
      }
      terminate() { window.__terminations++; return super.terminate(); }
    };
  });
  await page.goto(`${baseURL}${path}`);
  await page.getByRole('button', { name: path === '/' ? 'Compress images' : '开始压缩', exact: true }).waitFor();
  const data = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 240;
    const context = canvas.getContext('2d');
    context.fillStyle = '#097b6a'; context.fillRect(0, 0, 320, 240);
    context.fillStyle = '#dfab53'; context.fillRect(30, 30, 180, 120);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  const file = name => ({ name, mimeType: 'image/png', buffer: Buffer.from(data, 'base64') });
  return { page, file, uploads };
}

const start = page => page.getByRole('button', { name: 'Compress images', exact: true }).click();
const waitFinished = page => page.getByRole('button', { name: 'Compress images', exact: true }).waitFor({ state: 'visible' });
const waitCount = (page, count) => page.waitForFunction(n => document.querySelectorAll('[data-compressed-bytes]').length === n, count);

// Run against a production server: npm run build && npm start -- --port 3100
// Fault injection is confined to this browser context; real encoding is used elsewhere.
test('real Wasm compression and ZIP download preserve two files with the same name', async t => {
  const { page, file, uploads } = await setup(t);
  await page.getByLabel('Target size', { exact: true }).fill('0');
  await page.locator('input[type=file]').setInputFiles([file('same.png'), file('same.png')]);
  await start(page); await waitCount(page, 2); await waitFinished(page);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download ZIP', exact: true }).click();
  const download = await downloadEvent;
  const entries = unzipSync(await readFile(await download.path()));
  assert.equal(Object.keys(entries).length, 2);
  for (const bytes of Object.values(entries)) {
    const dimensions = await page.evaluate(async data => {
      const bitmap = await createImageBitmap(new Blob([new Uint8Array(data)]));
      const result = [bitmap.width, bitmap.height]; bitmap.close(); return result;
    }, [...bytes]);
    assert.deepEqual(dimensions, [320, 240]);
  }
  assert.deepEqual(uploads, []);
});

test('a corrupt image does not stop the remaining valid file', async t => {
  const { page, file } = await setup(t);
  await page.locator('input[type=file]').setInputFiles([
    { name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not an image') }, file('valid.png'),
  ]);
  await start(page); await waitCount(page, 1); await waitFinished(page);
  assert.equal(await page.getByText('Failed', { exact: true }).count(), 1);
});

test('cancel terminates the worker, skips queued files and allows a real retry', async t => {
  const { page, file } = await setup(t);
  await page.evaluate(() => { window.__workerMode = 'hold'; });
  await page.locator('input[type=file]').setInputFiles([file('a.png'), file('b.png')]);
  await start(page);
  await page.waitForFunction(() => window.__posts.length === 1);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  assert.equal(await page.evaluate(() => window.__terminations), 1);
  assert.deepEqual(await page.evaluate(() => window.__posts), ['a.png']);
  assert.equal(await page.getByText('Cancelled', { exact: true }).count(), 1);
  await page.evaluate(() => { window.__workerMode = 'normal'; });
  await start(page); await waitCount(page, 2); await waitFinished(page);
});

test('removing active and queued files skips both and processes the remaining file', async t => {
  const { page, file } = await setup(t);
  await page.evaluate(() => { window.__workerMode = 'hold'; });
  await page.locator('input[type=file]').setInputFiles([file('a.png'), file('b.png'), file('c.png')]);
  await start(page);
  await page.waitForFunction(() => window.__posts.length === 1);
  await page.getByRole('button', { name: 'Remove b.png', exact: true }).click();
  await page.evaluate(() => { window.__workerMode = 'normal'; });
  await page.getByRole('button', { name: 'Remove a.png', exact: true }).click();
  await waitCount(page, 1); await waitFinished(page);
  assert.deepEqual(await page.evaluate(() => window.__posts), ['a.png', 'c.png']);
});

test('clear during compression prevents old queue results from entering a new batch', async t => {
  const { page, file } = await setup(t);
  await page.evaluate(() => { window.__workerMode = 'hold'; });
  await page.locator('input[type=file]').setInputFiles([file('old.png'), file('old-queued.png')]);
  await start(page); await page.waitForFunction(() => window.__posts.length === 1);
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page.evaluate(() => { window.__workerMode = 'normal'; });
  await page.locator('input[type=file]').setInputFiles([file('new.png')]);
  await start(page); await waitCount(page, 1); await waitFinished(page);
  assert.deepEqual(await page.evaluate(() => window.__posts), ['old.png', 'new.png']);
  assert.equal(await page.getByText('old.png', { exact: true }).count(), 0);
});

test('a worker error ends waiting and the next attempt recovers', async t => {
  const { page, file } = await setup(t);
  await page.evaluate(() => { window.__workerMode = 'error'; });
  await page.locator('input[type=file]').setInputFiles(file('retry.png'));
  await start(page);
  await page.getByText('The image processor stopped. Please retry.', { exact: true }).waitFor();
  await waitFinished(page);
  await page.evaluate(() => { window.__workerMode = 'normal'; });
  await start(page); await waitCount(page, 1); await waitFinished(page);
});

test('Chinese cancellation and retry controls work on a phone viewport', async t => {
  const { page, file } = await setup(t, '/zh');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { window.__workerMode = 'hold'; });
  await page.locator('input[type=file]').setInputFiles(file('mobile.png'));
  await page.getByRole('button', { name: '开始压缩', exact: true }).click();
  await page.waitForFunction(() => window.__posts.length === 1);
  await page.getByRole('button', { name: '取消压缩', exact: true }).click();
  await page.getByText('已取消', { exact: true }).waitFor();
  await page.evaluate(() => { window.__workerMode = 'normal'; });
  await page.getByRole('button', { name: '开始压缩', exact: true }).click();
  await waitCount(page, 1);
});

test('PNG explains quality, and a result keeps its original target after settings change', async t => {
  const { page } = await setup(t);
  const noise = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 240;
    const context = canvas.getContext('2d'); const image = context.createImageData(320, 240);
    let seed = 42;
    for (let i = 0; i < image.data.length; i += 4) {
      for (let c = 0; c < 3; c++) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; image.data[i + c] = seed >>> 24; }
      image.data[i + 3] = 255;
    }
    context.putImageData(image, 0, 0);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.getByRole('group', { name: 'Output', exact: true }).getByRole('button', { name: 'PNG', exact: true }).click();
  assert.equal(await page.getByLabel('Quality', { exact: true }).isDisabled(), true);
  await page.getByText('PNG keeps its color data; the quality slider does not apply.', { exact: true }).waitFor();
  await page.getByLabel('Target size', { exact: true }).fill('1');
  await page.locator('input[type=file]').setInputFiles({ name: 'noise.png', mimeType: 'image/png', buffer: Buffer.from(noise, 'base64') });
  await start(page); await waitCount(page, 1); await waitFinished(page);
  await page.getByText('Above target', { exact: true }).waitFor();
  await page.getByLabel('Target size', { exact: true }).fill('0');
  assert.equal(await page.getByText('Above target', { exact: true }).count(), 1);
});

test('phone results fit the viewport and the mobile navigation reaches a guide', async t => {
  const { page, file } = await setup(t);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.locator('input[type=file]').setInputFiles(file('a-long-filename-for-responsive-layout-verification.png'));
  await start(page); await waitCount(page, 1); await waitFinished(page);
  const bounds = await page.locator('.result-row').boundingBox();
  assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 375);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  await page.getByLabel('Open navigation menu', { exact: true }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Guides', exact: true }).click();
  await page.waitForURL('**/guide');
});
