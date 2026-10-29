import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
const base = process.env.PICZIP_TEST_URL || 'http://127.0.0.1:3100';
const engine = process.env.PICZIP_TEST_BROWSER === 'webkit' ? webkit : chromium;
const prefixes = ['', '/zh', '/es', '/pt-br', '/ja'];
async function setup(t, path, viewport = { width: 1280, height: 900 }) {
  const browser = await engine.launch(); t.after(() => browser.close());
  const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
  const errors = []; page.on('pageerror', e => { if (engine === webkit && /_rsc=.*due to access control checks/.test(e.message)) return; errors.push(e.message); });
  t.after(() => assert.deepEqual(errors, []));
  assert.equal((await page.goto(base + path)).status(), 200);
  if (path !== '/tools') await page.locator('.tool-source input[type=file]:enabled').waitFor({ state: 'attached' });
  const file = async (name = 'source.png', color = '#ff0000', width = 200, height = 100) => ({ name, mimeType: 'image/png', buffer: Buffer.from(await page.evaluate(({ color, width, height }) => {
    const c = document.createElement('canvas'); c.width = width; c.height = height;
    const x = c.getContext('2d'); x.fillStyle = color; x.fillRect(0, 0, width, height); return c.toDataURL().split(',')[1];
  }, { color, width, height }), 'base64') });
  return { page, file };
}
async function run(page, count = 1) {
  await page.locator('.tool-settings .primary-button').click();
  await page.waitForFunction(n => document.querySelectorAll('.tool-output').length === n, count);
  await page.locator('.continue-processing .primary-button:enabled').waitFor();
}
async function sample(page, nth = 0, points = [[0, 0]]) {
  return page.locator('.tool-output-preview').nth(nth).evaluate(async (a, points) => {
    const bitmap = await createImageBitmap(await (await fetch(a.href)).blob());
    const c = document.createElement('canvas'); c.width = bitmap.width; c.height = bitmap.height;
    const x = c.getContext('2d'); x.drawImage(bitmap, 0, 0); bitmap.close();
    return { width: c.width, height: c.height, rgba: points.map(([px, py]) => Array.from(x.getImageData(px, py, 1, 1).data)) };
  }, points);
}
test('padding: exact margins, alpha export, canvas fitting and preset restore', async t => {
  const { page, file } = await setup(t, '/pad-image');
  await page.locator('.tool-source input[type=file]').setInputFiles(await file());
  for (const [name, n] of [['Top (px)', 10], ['Right (px)', 20], ['Bottom (px)', 10], ['Left (px)', 20]]) await page.getByLabel(name, { exact: true }).fill(String(n));
  await run(page);
  let p = await sample(page, 0, [[0, 0], [20, 10], [219, 109], [220, 110]]);
  assert.deepEqual([p.width, p.height], [240, 120]);
  assert.deepEqual(p.rgba, [[255, 255, 255, 255], [255, 0, 0, 255], [255, 0, 0, 255], [255, 255, 255, 255]]);
  await page.getByLabel('Transparent background', { exact: true }).check(); await run(page);
  p = await sample(page, 0, [[0, 0], [20, 10]]); assert.deepEqual(p.rgba, [[0, 0, 0, 0], [255, 0, 0, 255]]);
  await page.locator('.batch-presets[data-tool] summary').click();
  await page.locator('.batch-presets[data-tool] input[maxlength="60"]').fill('Border'); await page.locator('.preset-save').click();
  await page.getByLabel('Padding mode', { exact: true }).selectOption('ratio');
  assert.match(await page.locator('[data-padding-size]').innerText(), /200 × 200/);
  await run(page); p = await sample(page, 0, [[0, 0], [0, 50]]);
  assert.deepEqual([p.width, p.height], [200, 200]); assert.deepEqual(p.rgba, [[0, 0, 0, 0], [255, 0, 0, 255]]);
  await page.getByLabel('Padding mode', { exact: true }).selectOption('canvas');
  await page.getByLabel('Width (px)', { exact: true }).fill('300'); await page.getByLabel('Height (px)', { exact: true }).fill('300');
  await run(page); p = await sample(page, 0, [[49, 100], [50, 100], [249, 199]]);
  assert.deepEqual([p.width, p.height], [300, 300]); assert.deepEqual(p.rgba, [[0, 0, 0, 0], [255, 0, 0, 255], [255, 0, 0, 255]]);
  await page.locator('.batch-presets[data-tool] select').selectOption({ label: 'Border' }); await page.locator('.preset-row .secondary-button').first().click();
  assert.equal(await page.getByLabel('Padding mode', { exact: true }).inputValue(), 'border');
  await run(page); await page.locator('.continue-processing select').selectOption('mosaic');
  await page.locator('.continue-processing .primary-button').click(); await page.waitForURL('**/mosaic-image*');
  await page.locator('[data-input-name]').first().waitFor(); assert.equal(await page.locator('[data-input-name]').count(), 1);
});
test('mosaic: drag region, opaque cover, batch percentages, preset and next tool', async t => {
  const { page, file } = await setup(t, '/mosaic-image');
  await page.locator('.tool-source input[type=file]').setInputFiles([await file(), await file('second.png', '#0000ff', 400, 200)]);
  const stage = page.locator('.mosaic-stage'); await stage.waitFor();
  const r = await stage.boundingBox();
  await page.mouse.move(r.x + r.width * .25, r.y + r.height * .25);
  await page.mouse.down(); await page.mouse.move(r.x + r.width * .75, r.y + r.height * .75, { steps: 6 }); await page.mouse.up();
  assert.equal(await page.locator('.mosaic-region').count(), 1);
  await page.getByLabel('Redaction style', { exact: true }).selectOption('solid');
  await page.getByLabel('Cover color', { exact: true }).fill('#00ff00'); await run(page, 2);
  let p = await sample(page, 0, [[10, 10], [100, 50]]);
  assert.deepEqual(p.rgba, [[255, 0, 0, 255], [0, 255, 0, 255]]);
  p = await sample(page, 1, [[20, 20], [200, 100]]);
  assert.deepEqual([p.width, p.height], [400, 200]); assert.deepEqual(p.rgba, [[0, 0, 255, 255], [0, 255, 0, 255]]);
  await page.locator('.batch-presets[data-tool] summary').click();
  await page.locator('.batch-presets[data-tool] input[maxlength="60"]').fill('Hide area'); await page.locator('.preset-save').click();
  await page.getByRole('button', { name: 'Clear regions', exact: true }).click();
  assert.equal(await page.locator('.tool-settings .primary-button').isDisabled(), true);
  await page.locator('.batch-presets[data-tool] select').selectOption({ label: 'Hide area' }); await page.locator('.preset-row .secondary-button').first().click();
  assert.equal(await page.locator('.mosaic-region').count(), 1); await run(page, 2);
  await page.locator('.continue-processing select').selectOption('compress'); await page.locator('.continue-processing .primary-button').click();
  await page.waitForURL(base + '/'); assert.equal(await page.locator('.result-name').count(), 2);
});
test('pixelation changes selected detail but leaves pixels outside the rectangle intact', async t => {
  const { page } = await setup(t, '/mosaic-image');
  const pattern = Buffer.from(await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 100; c.height = 100;
    const x = c.getContext('2d');
    for (let i = 0; i < 100; i++) { x.fillStyle = i % 2 ? '#0000ff' : '#ff0000'; x.fillRect(i, 0, 1, 100); }
    return c.toDataURL().split(',')[1];
  }), 'base64');
  await page.locator('.tool-source input[type=file]').setInputFiles({ name: 'stripes.png', mimeType: 'image/png', buffer: pattern });
  await page.getByRole('button', { name: 'Add region', exact: true }).click();
  await run(page);
  const result = await sample(page, 0, [[10, 40], [30, 40], [31, 40]]);
  assert.deepEqual(result.rgba[0], [255, 0, 0, 255]);
  assert.deepEqual(result.rgba[1], result.rgba[2]);
  assert.notDeepEqual(result.rgba[1], [0, 0, 255, 255]);
});
test('five language routes, guide backlinks, Article and tool directory; mobile fit', async t => {
  const { page } = await setup(t, '/tools');
  for (const prefix of prefixes) {
    for (const [tool, slug] of [['pad-image', 'add-image-padding-and-expand-canvas'], ['mosaic-image', 'pixelate-and-redact-images']]) {
      const toolPath = prefix + '/' + tool, guidePath = prefix + '/guides/' + slug;
      assert.equal((await page.goto(base + toolPath)).status(), 200);
      assert.equal(await page.locator('main > aside a[href="' + guidePath + '"]').count(), 1);
      assert.equal((await page.goto(base + guidePath)).status(), 200);
      assert.ok(await page.locator('main a[href="' + toolPath + '"]').count());
      assert.equal(await page.locator('script[type="application/ld+json"]').evaluateAll(items => items.map(i => JSON.parse(i.textContent)).filter(v => v['@type'] === 'Article').length), 1);
      assert.deepEqual((await page.locator('.language-options a').evaluateAll(links => links.map(a => new URL(a.href).pathname))).sort(), prefixes.map(p => p + '/guides/' + slug).sort());
      assert.equal(await page.locator('meta[name=description]').getAttribute('content'), await page.locator('meta[property="og:description"]').getAttribute('content'));
    }
    await page.goto(base + prefix + '/tools'); assert.equal(await page.locator('[data-directory-tool]').count(), 11);
    await page.goto(base + prefix + '/guide');
    for (const slug of ['add-image-padding-and-expand-canvas', 'pixelate-and-redact-images']) assert.ok(await page.locator('main a[href="' + prefix + '/guides/' + slug + '"]').count());
    await page.setViewportSize({ width: 320, height: 740 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.setViewportSize({ width: 1280, height: 900 });
  }
});
