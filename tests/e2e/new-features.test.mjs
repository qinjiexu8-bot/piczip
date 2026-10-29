import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { unzipSync } from 'fflate';
const base = process.env.PICZIP_TEST_URL || 'http://127.0.0.1:3100';
const engine = process.env.PICZIP_TEST_BROWSER === 'webkit' ? webkit : chromium;
async function setup(t, path) {
  const browser = await engine.launch(); t.after(() => browser.close());
  const page = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  const errors = []; page.on('pageerror', e => { if (engine === webkit && /_rsc=.*due to access control checks/.test(e.message)) return; errors.push(e.message); });
  t.after(() => assert.deepEqual(errors, []));
  assert.equal((await page.goto(base + path)).status(), 200);
  await page.locator('input[type=file]:enabled').waitFor({ state: 'attached' });
  return page;
}
async function file(page, name = 'source.png', color = '#ff0000', width = 200, height = 100) {
  return { name, mimeType: 'image/png', buffer: Buffer.from(await page.evaluate(({ color, width, height }) => { const c = document.createElement('canvas'); c.width = width; c.height = height; const x = c.getContext('2d'); x.fillStyle = color; x.fillRect(0, 0, width, height); return c.toDataURL().split(',')[1]; }, { color, width, height }), 'base64') };
}
async function output(page, nth = 0) {
  return page.locator('.tool-output-preview').nth(nth).evaluate(async a => { const blob = await (await fetch(a.href)).blob(); const b = await createImageBitmap(blob); const c = document.createElement('canvas'); c.width = b.width; c.height = b.height; const x = c.getContext('2d'); x.drawImage(b, 0, 0); b.close(); return { width: c.width, height: c.height, type: blob.type, pixel: Array.from(x.getImageData(10, 10, 1, 1).data) }; });
}
const settings = { tool: 'resize', format: 'png', quality: 90, resize: { mode: 'pixels', width: 100, height: 0, percent: 50, lock: true }, background: '#ffffff', transparent: false, direction: 'vertical', edge: 800, gap: 0 };
const presets = [{ id: 'resize', name: '100 pixels', tool: 'resize', settings }, { id: 'convert', name: 'Final JPG', tool: 'convert', settings: { ...settings, tool: 'convert', format: 'jpeg', rename: { enabled: true, base: 'product', prefix: 'shop-', suffix: '', sequence: true, start: 1 } } }];

test('HEIC: real decoding, container rotation, PNG/JPG and malformed file isolation', async t => {
  const page = await setup(t, '/heic-to-jpg');
  await page.locator('input[type=file]').setInputFiles([
    { name: 'normal.heic', mimeType: 'image/heic', buffer: await readFile('tests/fixtures/heic/quadrants.heic') },
    { name: 'broken.heic', mimeType: 'image/heic', buffer: Buffer.from('not an image') },
    { name: 'rotated.heic', mimeType: 'image/heic', buffer: await readFile('tests/fixtures/heic/quadrants-clockwise.heic') },
  ]);
  await page.getByLabel('Output format', { exact: true }).selectOption('png');
  await page.getByRole('button', { name: 'Convert photos', exact: true }).click();
  await page.waitForFunction(() => document.querySelectorAll('.tool-output').length === 2);
  await page.locator('.continue-processing .primary-button:enabled').waitFor();
  const normal = await output(page), rotated = await output(page, 1);
  assert.deepEqual([normal.width, normal.height, normal.type], [320, 200, 'image/png']);
  assert.deepEqual([rotated.width, rotated.height, rotated.type], [200, 320, 'image/png']);
  assert.ok(normal.pixel[0] > 200 && normal.pixel[1] < 50 && normal.pixel[2] < 50, JSON.stringify(normal));
  assert.ok(rotated.pixel[2] > 200 && rotated.pixel[0] < 50 && rotated.pixel[1] < 50, JSON.stringify(rotated));
  assert.match(await page.locator('.workflow-error[role=alert]').innerText(), /broken.heic/);
  await page.getByLabel('Output format', { exact: true }).selectOption('jpeg');
  await page.getByRole('button', { name: 'Convert photos', exact: true }).click();
  await page.waitForFunction(() => document.querySelectorAll('.tool-output').length === 2);
  await page.locator('.continue-processing .primary-button:enabled').waitFor();
  assert.equal((await output(page)).type, 'image/jpeg');
  await page.locator('.continue-processing select').selectOption('pdf'); await page.locator('.continue-processing .primary-button').click();
  await page.waitForURL('**/images-to-pdf*'); await page.locator('[data-input-name]').first().waitFor();
  assert.equal(await page.locator('[data-input-name]').count(), 2);
});

test('PDF: reordered images become correctly sized pages; fixed paper and download work', async t => {
  const page = await setup(t, '/images-to-pdf');
  await page.locator('input[type=file]').setInputFiles([await file(page, 'red.png'), await file(page, 'blue.png', '#0000ff', 100, 200)]);
  await page.getByRole('button', { name: 'Move up blue.png', exact: true }).click();
  await page.getByLabel('Page size', { exact: true }).selectOption('auto');
  await page.getByLabel('Margin (mm)', { exact: true }).fill('0');
  await page.getByLabel('PDF file name', { exact: true }).fill('ordered-pictures');
  await page.getByRole('button', { name: 'Create PDF', exact: true }).click();
  await page.locator('.feature-download').waitFor();
  const download = page.waitForEvent('download'); await page.locator('.feature-download').click(); const artifact = await download;
  assert.equal(artifact.suggestedFilename(), 'ordered-pictures.pdf');
  const bytes = await readFile(await artifact.path()); const pdf = await PDFDocument.load(bytes);
  assert.equal(pdf.getPageCount(), 2);
  assert.deepEqual(pdf.getPages().map(p => [p.getWidth(), p.getHeight()]), [[75, 150], [150, 75]]);
  if (engine === chromium) await writeFile('/tmp/piczip-images-to-pdf-test.pdf', bytes);
  await page.getByLabel('Page size', { exact: true }).selectOption('a4');
  await page.getByLabel('Orientation', { exact: true }).selectOption('landscape');
  await page.getByLabel('Margin (mm)', { exact: true }).fill('10');
  await page.getByRole('button', { name: 'Create PDF', exact: true }).click(); await page.locator('.feature-download').waitFor();
  const fixed = await page.locator('.feature-download').evaluate(async a => Array.from(new Uint8Array(await (await fetch(a.href)).arrayBuffer())));
  assert.deepEqual((await PDFDocument.load(new Uint8Array(fixed))).getPages().map(p => [p.getWidth(), p.getHeight()]), [[841.89, 595.28], [841.89, 595.28]]);
});

test('workflow: preset snapshots persist, ordered steps execute, renamed ZIP and PDF transfer agree', async t => {
  const page = await setup(t, '/batch-workflow');
  await page.evaluate(presets => localStorage.setItem('piczip:presets:v1', JSON.stringify(presets)), presets); await page.reload();
  for (const id of ['resize', 'convert']) { await page.getByLabel('Choose a preset', { exact: true }).selectOption(id); await page.getByRole('button', { name: 'Add step', exact: true }).click(); }
  await page.getByLabel('Workflow name', { exact: true }).fill('Product export'); await page.getByRole('button', { name: 'Save workflow', exact: true }).click();
  await page.evaluate(() => localStorage.removeItem('piczip:presets:v1')); await page.reload();
  await page.getByLabel('Saved workflows', { exact: true }).selectOption({ label: 'Product export' }); await page.getByRole('button', { name: 'Load workflow', exact: true }).click();
  assert.equal(await page.locator('[data-step]').count(), 2);
  await page.locator('input[type=file]').setInputFiles([await file(page), await file(page, 'second.png')]);
  await page.getByRole('button', { name: 'Run workflow', exact: true }).click();
  await page.getByText('Workflow finished.', { exact: true }).waitFor();
  const result = await output(page); assert.deepEqual([result.width, result.height, result.type], [100, 50, 'image/jpeg']);
  assert.deepEqual(await page.locator('.tool-output a[download]').evaluateAll(a => a.map(x => x.download)), ['shop-product-001.jpg', 'shop-product-002.jpg']);
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download ZIP', exact: true }).click();
  const entries = unzipSync(new Uint8Array(await readFile(await (await download).path())));
  assert.deepEqual(Object.keys(entries), ['shop-product-001.jpg', 'shop-product-002.jpg']);
  await page.locator('.continue-processing select').selectOption('pdf'); await page.locator('.continue-processing .primary-button').click(); await page.waitForURL('**/images-to-pdf*'); await page.locator('[data-input-name]').first().waitFor();
  assert.deepEqual(await page.locator('[data-input-name]').evaluateAll(x => x.map(i => i.dataset.inputName)), ['shop-product-001.jpg', 'shop-product-002.jpg']);
});

test('workflow failure keeps the last completed step; invalid storage is never overwritten', async t => {
  const page = await setup(t, '/batch-workflow');
  const tooLarge = { id: 'padding', tool: 'padding', name: 'Too large', settings: { ...settings, tool: 'padding', padding: { mode: 'canvas', top: 0, right: 0, bottom: 0, left: 0, width: 8192, height: 8192, ratio: '1:1', position: 4 } } };
  await page.evaluate(p => localStorage.setItem('piczip:presets:v1', JSON.stringify(p)), [presets[0], tooLarge]); await page.reload();
  for (const id of ['resize', 'padding']) { await page.getByLabel('Choose a preset', { exact: true }).selectOption(id); await page.getByRole('button', { name: 'Add step', exact: true }).click(); }
  await page.locator('input[type=file]').setInputFiles(await file(page)); await page.getByRole('button', { name: 'Run workflow', exact: true }).click();
  await page.getByText('The workflow stopped at this step. Completed images are available below.', { exact: true }).waitFor();
  const result = await output(page); assert.deepEqual([result.width, result.height, result.type], [100, 50, 'image/png']);
  await page.evaluate(() => localStorage.setItem('piczip:pipelines:v1', '{broken')); await page.reload();
  assert.equal(await page.getByRole('button', { name: 'Save workflow', exact: true }).isDisabled(), true);
  assert.equal(await page.evaluate(() => localStorage.getItem('piczip:pipelines:v1')), '{broken');
});

test('five-language tools and guides have matching links and language switches; mobile pages fit', async t => {
  const page = await setup(t, '/heic-to-jpg');
  const entries = [['heic-to-jpg', 'convert-heic-photos-to-jpg'], ['images-to-pdf', 'combine-images-into-pdf'], ['batch-workflow', 'automate-image-batch-workflow']];
  const prefixes = ['', '/zh', '/es', '/pt-br', '/ja'];
  for (const prefix of prefixes) for (const [tool, slug] of entries) {
    const path = prefix + '/' + tool, guide = prefix + '/guides/' + slug;
    assert.equal((await page.goto(base + path)).status(), 200);
    assert.equal(await page.locator('.feature-related a[href="' + guide + '"]').count(), 1);
    assert.equal((await page.goto(base + guide)).status(), 200);
    assert.ok(await page.locator('main a[href="' + path + '"]').count());
    assert.deepEqual((await page.locator('.language-options a').evaluateAll(a => a.map(x => new URL(x.href).pathname))).sort(), prefixes.map(p => p + '/guides/' + slug).sort());
    assert.equal(await page.locator('script[type="application/ld+json"]').evaluateAll(items => items.map(i => JSON.parse(i.textContent)).filter(v => v['@type'] === 'Article').length), 1);
    await page.setViewportSize({ width: 320, height: 740 }); await page.goto(base + path);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, path);
    await page.setViewportSize({ width: 1280, height: 900 });
  }
});

test('HEIC and workflow cancellation terminate pending workers and restore controls', async t => {
  const page = await setup(t, '/heic-to-jpg');
  // Hold work before decoding so cancellation is deterministic, even on fast machines.
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    window.__terminated = 0;
    window.Worker = class extends NativeWorker {
      postMessage() { /* Keep a real worker pending until Cancel. */ }
      terminate() { window.__terminated++; return super.terminate(); }
    };
  });
  await page.reload();
  await page.locator('input[type=file]').setInputFiles('tests/fixtures/heic/quadrants.heic');
  await page.getByRole('button', { name: 'Convert photos', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Convert photos', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Convert photos', exact: true }).isEnabled(), true);
  assert.ok(await page.evaluate(() => window.__terminated >= 1));
  await page.goto(base + '/batch-workflow');
  await page.evaluate(p => localStorage.setItem('piczip:presets:v1', JSON.stringify(p)), presets); await page.reload();
  for (const id of ['resize', 'convert']) { await page.getByLabel('Choose a preset', { exact: true }).selectOption(id); await page.getByRole('button', { name: 'Add step', exact: true }).click(); }
  await page.locator('input[type=file]').setInputFiles(await file(page));
  await page.getByRole('button', { name: 'Run workflow', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.waitForFunction(() => document.querySelectorAll('.tool-output').length === 0 && window.__terminated >= 1);
  assert.equal(await page.getByRole('button', { name: 'Run workflow', exact: true }).isEnabled(), true);
});
