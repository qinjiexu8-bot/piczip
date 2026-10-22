// Run from the project root: PICZIP_TEST_URL=http://localhost:3101 node doc/content/image-tool-guides/verify-examples.mjs
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const base = process.env.PICZIP_TEST_URL || 'http://localhost:3101';
const browser = await chromium.launch();
const evidence = [];
try {
  for (const locale of ['en', 'zh']) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1000 }, deviceScaleFactor: 1 });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    const t = (en, zh) => locale === 'zh' ? zh : en;
    async function open(path) { await page.goto(base + (locale === 'zh' ? '/zh' : '') + path); await page.locator('input[type=file]:enabled').waitFor({ state: 'attached' }); }
    async function fixture(name, width, height, color, transparent = false) {
      const data = await page.evaluate(({ width, height, color, transparent }) => {
        const c = document.createElement('canvas'); c.width = width; c.height = height;
        const ctx = c.getContext('2d'); ctx.fillStyle = color;
        ctx.fillRect(transparent ? width / 2 : 0, 0, transparent ? width / 2 : width, height);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.strokeRect(width * .58, height * .2, width * .3, height * .6);
        return c.toDataURL().split(',')[1];
      }, { width, height, color, transparent });
      return { name, mimeType: 'image/png', buffer: Buffer.from(data, 'base64') };
    }
    async function run(action) {
      await page.getByRole('button', { name: action, exact: true }).click();
      await page.locator('.tool-output').waitFor();
      await page.getByRole('button', { name: action, exact: true }).waitFor();
      return page.locator('.tool-output-preview').evaluate(async a => {
        const blob = await (await fetch(a.href)).blob(); const image = await createImageBitmap(blob);
        const c = document.createElement('canvas'); c.width = image.width; c.height = image.height;
        const ctx = c.getContext('2d'); ctx.drawImage(image, 0, 0); image.close();
        return { width: c.width, height: c.height, type: blob.type, corner: [...ctx.getImageData(2, 2, 1, 1).data] };
      });
    }
    async function capture(slug) { await page.evaluate(() => document.fonts.ready); await page.locator('.tool-output-preview img').evaluate(img => img.decode()); await page.locator('.image-tool-shell').screenshot({ path: `public/guides/${slug}/${locale}.png` }); }
    await open('/resize-image');
    await page.locator('input[type=file]').setInputFiles(await fixture('landscape-400x200.png', 400, 200, '#087f6b'));
    await page.getByLabel(t('Width (px)', '宽度（像素）'), { exact: true }).fill('200');
    await page.getByLabel(t('Height (px)', '高度（像素）'), { exact: true }).fill('200');
    let result = await run(t('Resize images', '调整尺寸')); assert.deepEqual([result.width, result.height], [200, 100]);
    evidence.push({ locale, example: 'resize-locked-200x200', ...result });
    await capture('resize-images-by-pixels-or-percentage');
    await page.getByLabel(t('Keep aspect ratio', '保持原始比例')).uncheck();
    result = await run(t('Resize images', '调整尺寸')); assert.deepEqual([result.width, result.height], [200, 200]);
    evidence.push({ locale, example: 'resize-unlocked-200x200', ...result });
    await page.getByLabel(t('Resize by', '调整方式')).selectOption('percent');
    await page.getByLabel(t('Scale (%)', '缩放比例（%）')).fill('50');
    result = await run(t('Resize images', '调整尺寸')); assert.deepEqual([result.width, result.height], [200, 100]);
    evidence.push({ locale, example: 'resize-50-percent', ...result });
    await open('/convert-image');
    await page.locator('input[type=file]').setInputFiles(await fixture('transparent-200x100.png', 200, 100, '#087f6b', true));
    for (const format of ['jpeg', 'png', 'webp']) {
      await page.getByLabel(t('Output format', '输出格式')).selectOption(format);
      result = await run(t('Convert images', '开始转换'));
      assert.equal(result.type, `image/${format}`); assert.deepEqual([result.width, result.height], [200, 100]);
      if (format === 'jpeg') assert.deepEqual(result.corner, [255, 255, 255, 255]); else assert.equal(result.corner[3], 0);
      evidence.push({ locale, example: `convert-${format}`, ...result });
      if (format === 'jpeg') await capture('convert-jpg-png-webp');
    }
    await open('/stitch-images');
    await page.locator('input[type=file]').setInputFiles([await fixture('landscape-400x200.png', 400, 200, '#087f6b'), await fixture('portrait-200x400.png', 200, 400, '#385e9d')]);
    await page.getByLabel(t('Shared width (px)', '统一宽度（像素）')).fill('200');
    result = await run(t('Stitch images', '开始拼接')); assert.deepEqual([result.width, result.height], [200, 516]);
    evidence.push({ locale, example: 'stitch-vertical-gap16', ...result });
    await capture('stitch-images-horizontally-vertically');
    await page.getByLabel(t('Direction', '拼接方向')).selectOption('horizontal');
    result = await run(t('Stitch images', '开始拼接')); assert.deepEqual([result.width, result.height], [516, 200]);
    evidence.push({ locale, example: 'stitch-horizontal-gap16', ...result });
    assert.deepEqual(errors, []); await page.close();
  }
  await writeFile('doc/content/image-tool-guides/evidence.json', JSON.stringify({ verifiedAt: new Date().toISOString(), browser: browser.version(), results: evidence }, null, 2) + '\n');
  console.log(`Verified ${evidence.length} examples and saved six screenshots.`);
} finally { await browser.close(); }
