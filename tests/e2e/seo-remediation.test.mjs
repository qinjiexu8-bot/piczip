import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const base = process.env.PICZIP_TEST_URL || 'http://127.0.0.1:3100';
const load = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));

test('Chinese compression guides are discoverable, translated, and switch all five languages', async t => {
  const guides = await load('../../src/lib/guides/translations/zh.json');
  const browser = await chromium.launch(); t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + '/zh/guide');
  for (const slug of Object.keys(guides)) assert.ok(await page.locator(`main a[href="/zh/guides/${slug}"]`).count());
  assert.ok(await page.locator('main a[href="/zh/local-image-compressor"]').count());
  for (const [slug, guide] of Object.entries(guides)) {
    assert.equal((await page.goto(base + '/zh/guides/' + slug)).status(), 200);
    assert.equal(await page.locator('h1').innerText(), guide.title);
    assert.equal(await page.locator('html').getAttribute('lang'), 'zh-CN');
    assert.equal(await page.locator('link[rel=alternate][hreflang]').count(), 6);
    const text = await page.locator('.article-content').innerText();
    for (const paragraph of [...guide.steps, ...guide.sections.flat(), ...guide.faqs.flat()]) assert.ok(text.includes(paragraph));
    const article = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(n => JSON.parse(n.textContent)).find(n => n['@type'] === 'Article'));
    assert.equal(article.description, guide.description);
    assert.equal(article.datePublished, '2026-10-29'); assert.equal(article.dateModified, '2026-10-29');
    await page.locator('.article-content figure img').evaluate(img => img.decode());
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.locator('.language-menu summary').click();
    for (const prefix of ['', '/zh', '/es', '/pt-br', '/ja']) assert.equal(await page.locator(`.language-options a[href="${prefix}/guides/${slug}"]`).count(), 1);
  }
  assert.deepEqual(errors, []);
});

test('legacy descriptions match Article and visible copy without changing original guide files', async t => {
  const descriptions = await load('../../src/lib/guides/legacy-descriptions.json');
  const browser = await chromium.launch(); t.after(() => browser.close()); const page = await browser.newPage();
  for (const [path, description] of Object.entries(descriptions)) {
    await page.goto(base + path);
    assert.equal(await page.locator('meta[name=description]').getAttribute('content'), description);
    const article = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(n => JSON.parse(n.textContent)).find(n => n['@type'] === 'Article'));
    assert.equal(article.description, description); assert.equal(article.dateModified, '2026-10-29');
    assert.ok((await page.locator('main').innerText()).includes(description));
  }
});

test('all tool locales have verified content dates and icon retains the existing lightning image', async t => {
  const browser = await chromium.launch(); t.after(() => browser.close()); const page = await browser.newPage();
  const xml = await (await page.request.get(base + '/sitemap.xml')).text();
  const entries = await page.evaluate(xml => [...new DOMParser().parseFromString(xml, 'application/xml').querySelectorAll('url')].map(n => ({path: new URL(n.querySelector('loc').textContent).pathname, date: n.querySelector('lastmod')?.textContent})), xml);
  for (const prefix of ['', '/zh', '/es', '/pt-br', '/ja']) {
    for (const path of ['', '/resize-image', '/convert-image', '/crop-image', '/stitch-images', '/watermark-image', '/pad-image', '/mosaic-image', '/heic-to-jpg', '/batch-workflow', '/images-to-pdf']) {
      assert.equal(entries.find(e => e.path === ((prefix + path) || '/')).date, '2026-10-29T00:00:00.000Z');
    }
    await page.goto(base + (prefix || '/'));
    const icons = await page.locator('link[rel=icon],link[rel="shortcut icon"]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')));
    assert.ok(icons.some(url => url.startsWith('/favicon.ico')));
    assert.ok(icons.every(url => /^\/(favicon\.ico|icon\.svg)(\?|$)/.test(url)));
  }
  const remoteIcon = await (await page.request.get(base + '/favicon.ico')).body();
  assert.deepEqual(remoteIcon, await readFile(new URL('../../src/app/favicon.ico', import.meta.url)));
  assert.match(await (await page.request.get(base + '/icon.svg')).text(), /data:image\/png;base64,/);
});
