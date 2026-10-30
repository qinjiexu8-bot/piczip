import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const base = process.env.PICZIP_TEST_URL || 'http://127.0.0.1:3100';
const engine = process.env.PICZIP_TEST_BROWSER === 'webkit' ? webkit : chromium;
const locales = ['es', 'pt-br', 'ja'];
const names = { en: 'English', zh: '简体中文', es: 'Español', 'pt-br': 'Português (Brasil)', ja: '日本語' };
const read = async (group, locale) => JSON.parse(await readFile(new URL(`../../src/lib/i18n/messages/${group}-${locale}.json`, import.meta.url)));
async function setup(t, locale, path = '') {
  const browser = await engine.launch(); t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => Object.defineProperty(window, 'showSaveFilePicker', { value: undefined }));
  await page.goto(`${base}/${locale}${path}`);
  return { page, errors };
}
async function fixture(page, name) {
  const buffer = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 200;
    const context = canvas.getContext('2d'); context.fillStyle = '#087f6b'; context.fillRect(0, 0, 320, 200);
    context.fillStyle = '#ffffff'; context.fillRect(30, 30, 80, 80);
    return canvas.toDataURL().split(',')[1];
  });
  return { name, mimeType: 'image/png', buffer: Buffer.from(buffer, 'base64') };
}
for (const locale of locales) {
  test(`${locale}: pages, language menu, metadata, mobile layout and FAQ`, async t => {
    const { page, errors } = await setup(t, locale);
    const site = await read('site', locale);
    for (const path of ['', '/resize-image', '/convert-image', '/stitch-images', '/faq']) {
      // Let speculative RSC requests finish before forcing another document navigation.
      await page.waitForLoadState('networkidle');
      await page.goto(`${base}/${locale}${path}`);
      assert.equal(await page.locator('html').getAttribute('lang'), locale === 'pt-br' ? 'pt-BR' : locale);
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), `https://piczip.app/${locale}${path}`);
      assert.equal(await page.locator('link[rel=alternate][hreflang]').count(), 6);
      assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
      for (const width of [1440, 375]) {
        await page.setViewportSize({ width, height: 900 });
        await page.locator('.language-menu summary').click();
        const options = page.locator('.language-options');
        for (const target of ['en', 'zh', ...locales]) {
          const prefix = target === 'en' ? '' : `/${target}`;
          assert.equal(await options.getByRole('link', { name: names[target], exact: true }).getAttribute('href'), `${prefix}${path}` || '/');
        }
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        const menu = await options.boundingBox(); assert.ok(menu.x >= 0 && menu.x + menu.width <= width);
        await page.keyboard.press('Escape'); assert.equal(await page.locator('.language-menu').getAttribute('open'), null);
      }
      if (path === '/faq') {
        assert.equal(await page.locator('[data-info-faq]').count(), 11);
        assert.ok(await page.locator('[data-info-faq] p').first().isVisible());
      }
      // Follow real language links across root layouts; preserve the current tool.
      await page.locator('.language-menu summary').click();
      await page.locator('.language-options').getByRole('link', { name: names.en, exact: true }).click();
      await page.waitForURL(`${base}${path || '/'}`);
      await page.locator('.language-menu summary').click();
      await page.locator('.language-options').getByRole('link', { name: names[locale], exact: true }).click();
      await page.waitForURL(`${base}/${locale}${path}`);
      await page.waitForLoadState('networkidle');
    }
    await page.goto(`${base}/${locale}`);
    assert.equal(await page.locator('.home-faq-list details').count(), 6);
    assert.equal(await page.getByRole('heading', { level: 1 }).textContent(), site.home.title);
    const slider = page.locator('.comparison-image input'); await slider.focus(); await slider.press('End'); assert.equal(await slider.inputValue(), '100');
    await page.waitForLoadState('networkidle');
    await page.goto(`${base}/guides/convert-jpg-png-webp`);
    await page.locator('.language-menu summary').click();
    assert.equal(await page.locator('.language-options [aria-disabled=true]').count(), 0);
    assert.equal(await page.locator('.language-options a').count(), 5);
    assert.deepEqual(errors, []);
  });

  test(`${locale}: real compression, resize, conversion, stitching, download and errors`, async t => {
    const { page, errors } = await setup(t, locale);
    const c = await read('compressor', locale), tool = await read('tools', locale);
    const file = await fixture(page, 'sample.png');
    await page.getByLabel(c.targetSize, { exact: true }).fill('0');
    await page.locator('input[type=file]').setInputFiles([file, { name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('invalid') }]);
    await page.getByRole('button', { name: c.compress, exact: true }).click();
    await page.locator('[data-compressed-bytes]').waitFor();
    await page.getByText(c.decode, { exact: true }).waitFor();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: `${c.downloadLabel} sample.png`, exact: true }).click();
    assert.ok((await readFile(await (await download).path())).length > 0);
    for (const route of ['resize-image', 'convert-image', 'stitch-images']) {
      await page.goto(`${base}/${locale}/${route}`);
      await page.locator('input[type=file]:enabled').waitFor({ state: 'attached' });
      await page.locator('input[type=file]').setInputFiles(route === 'stitch-images' ? [file, { ...file, name: 'second.png' }] : file);
      if (route === 'resize-image') {
        await page.getByLabel(tool['Width (px)'], { exact: true }).fill('160');
        await page.getByRole('button', { name: tool['Resize images'], exact: true }).click();
      } else if (route === 'convert-image') {
        await page.getByLabel(tool['Output format']).selectOption('jpeg');
        await page.getByRole('button', { name: tool['Convert images'], exact: true }).click();
      } else {
        await page.getByLabel(tool['Shared width (px)'], { exact: true }).fill('160');
        await page.getByRole('button', { name: tool['Stitch images'], exact: true }).click();
      }
      const output = page.locator('.tool-output').first(); await output.waitFor();
      const dims = [Number(await output.getAttribute('data-output-width')), Number(await output.getAttribute('data-output-height'))];
      assert.deepEqual(dims, route === 'resize-image' ? [160, 100] : route === 'convert-image' ? [320, 200] : [160, 200]);
      assert.equal(await output.getAttribute('data-output-type'), route === 'convert-image' ? 'image/jpeg' : 'image/png');
      const event = page.waitForEvent('download'); await output.locator('a[download]').click(); assert.ok((await readFile(await (await event).path())).length > 0);
      if (route === 'resize-image') {
        await page.getByLabel(tool['Width (px)'], { exact: true }).fill('9000');
        await page.getByRole('button', { name: tool['Resize images'], exact: true }).click();
        await page.locator('.tool-errors[role=alert]').waitFor();
        assert.ok((await page.locator('.tool-errors[role=alert]').textContent()).includes(tool['Output exceeds 8192 px per side or 16 megapixels. Reduce the dimensions.']));
      }
    }
    assert.deepEqual(errors, []);
  });
}
