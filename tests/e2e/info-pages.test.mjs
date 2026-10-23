import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base = process.env.PICZIP_TEST_URL || 'http://127.0.0.1:3100';

test('five-language About and FAQ have localized routes, tools, titles and matching FAQ schema', async t => {
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  for (const prefix of ['', '/zh', '/es', '/pt-br', '/ja']) {
    for (const kind of ['about', 'faq']) {
      const path = `${prefix}/${kind}`;
      const response = await page.goto(base + path);
      assert.equal(response.status(), 200, path);
      const data = await page.evaluate(() => ({
        title: document.title,
        canonical: document.querySelector('link[rel="canonical"]').href,
        alternates: Array.from(document.querySelectorAll('link[hreflang]')).map(e => e.href),
        tools: Array.from(document.querySelectorAll('[data-info-tool-links] a')).map(e => new URL(e.href).pathname),
        faqs: Array.from(document.querySelectorAll('[data-info-faq]')).map(e => [e.querySelector('h2').textContent, e.querySelector('p').textContent]),
        schemas: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(e => JSON.parse(e.textContent)),
      }));
      assert.equal(data.title.split('PicZip').length - 1, 1, data.title);
      assert.equal(data.canonical, 'https://piczip.app' + path);
      assert.equal(data.alternates.length, 6);
      assert.equal(await page.locator('h1').count(), 1);
      assert.deepEqual(data.tools, ['/', '/resize-image', '/crop-image', '/convert-image', '/stitch-images', '/watermark-image', '/guide'].map(p => prefix ? prefix + (p === '/' ? '' : p) : p));
      await page.locator('.language-menu summary').click();
      const destinations = await page.locator('.language-options a').evaluateAll(links => links.map(a => new URL(a.href).pathname));
      assert.deepEqual(destinations.sort(), ['', '/zh', '/es', '/pt-br', '/ja'].map(p => `${p}/${kind}`).sort());
      if (kind === 'faq') {
        assert.equal(data.faqs.length, 11);
        const schema = data.schemas.find(s => s['@type'] === 'FAQPage');
        assert.deepEqual(schema.mainEntity.map(q => [q.name, q.acceptedAnswer.text]), data.faqs);
      }
      if (prefix) assert.ok(await page.locator(`footer a[href="${prefix}/about"]`).count(), path);
    }
  }
});
