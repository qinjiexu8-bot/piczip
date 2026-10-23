import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const base = process.env.PICZIP_TEST_URL || 'http://127.0.0.1:3100';
const engine = process.env.PICZIP_TEST_BROWSER === 'webkit' ? webkit : chromium;
const names = { en: 'English', zh: '简体中文', es: 'Español', 'pt-br': 'Português (Brasil)', ja: '日本語' };
const load = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const evidence = await load('../../src/lib/guides/guide-evidence.json');
const slugs = Object.keys(evidence);
const chineseSlugs = new Set([...slugs.slice(0, 3), 'compress-image-to-100kb-without-uploading']);
const normalize = text => text.replace(/\s+/g, ' ').trim();

for (const locale of ['es', 'pt-br', 'ja']) {
  test(`${locale}: 12 complete guides, local links, images, metadata and mobile layout`, async t => {
    const browser = await engine.launch(); t.after(() => browser.close());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const guides = await load(`../../src/lib/guides/translations/${locale}.json`);
    assert.deepEqual(Object.keys(guides), slugs);
    const hub = await page.goto(`${base}/${locale}/guide`);
    assert.equal(hub.status(), 200);
    assert.equal(await page.locator('[data-guide-card]').count(), 12);
    assert.deepEqual(await page.locator('[data-guide-card]').evaluateAll(items => items.map(item => item.getAttribute('href'))), slugs.map(slug => `/${locale}/guides/${slug}`));
    await page.locator('[data-guide-card]').first().click();
    await page.waitForURL(`${base}/${locale}/guides/${slugs[0]}`);
    const hrefs = new Set();
    for (const slug of slugs) {
      await page.waitForLoadState('networkidle');
      const response = await page.goto(`${base}/${locale}/guides/${slug}`);
      assert.equal(response.status(), 200, slug);
      const article = guides[slug];
      assert.equal(await page.locator('html').getAttribute('lang'), locale === 'pt-br' ? 'pt-BR' : locale);
      assert.equal(await page.getByRole('heading', { level: 1 }).textContent(), article.title);
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), `https://piczip.app/${locale}/guides/${slug}`);
      assert.equal(await page.locator('link[rel=alternate][hreflang]').count(), chineseSlugs.has(slug) ? 6 : 5);
      const body = normalize(await page.locator('.article-content').innerText());
      for (const text of [article.summary, ...article.steps, ...article.sections.flat(), ...article.faqs.flat(), ...article.table.headers, ...article.table.rows.flat()]) {
        assert.ok(body.includes(normalize(text)), `${slug}: missing translated text ${text.slice(0, 40)}`);
      }
      assert.ok(!body.includes('Frequently asked questions'));
      assert.equal(await page.locator('#questions h3').count(), article.faqs.length);
      assert.equal(await page.locator('[data-site-copyright]').count(), 1);
      assert.match(await page.locator('[data-site-copyright]').textContent(), /© 2026 PicZip\./);
      const schema = await page.locator('script[type="application/ld+json"]').evaluateAll(items => items.map(item => JSON.parse(item.textContent)));
      const articleSchema = schema.find(item => item['@type'] === 'Article');
      assert.equal(articleSchema.inLanguage, locale === 'pt-br' ? 'pt-BR' : locale);
      assert.equal(articleSchema.datePublished, evidence[slug].publishedAt);
      assert.equal(articleSchema.dateModified, evidence[slug].verifiedAt);
      assert.deepEqual(schema.find(item => item['@type'] === 'HowTo').step.map(step => step.text), article.steps);
      const image = page.locator('.article-content figure img');
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(img => img.decode());
      assert.ok(await image.evaluate(img => img.naturalWidth > 0));
      await access(new URL(`../../public${evidence[slug].image}`, import.meta.url));
      for (const anchor of await page.locator('.article-content a[href^="#"]').evaluateAll(items => items.map(item => item.getAttribute('href')))) {
        assert.equal(await page.locator(anchor).count(), 1);
      }
      const articleLinks = await page.locator('.article-content a[href^="/"]').evaluateAll(items => items.map(item => item.getAttribute('href')));
      for (const href of articleLinks) {
        if (href === evidence[slug].image) continue;
        assert.ok(href === `/${locale}` || href.startsWith(`/${locale}/`), `unlocalized link: ${href}`);
        hrefs.add(href);
      }
      for (const width of [375, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${slug} overflows ${width}px`);
      }
    }
    for (const href of hrefs) assert.equal((await page.request.get(`${base}${href}`)).status(), 200, href);
    assert.equal((await page.request.get(`${base}/${locale}/guides/not-a-real-guide`)).status(), 404);
    assert.deepEqual(errors, []);
  });
}

test('article language switching preserves the slug, including mobile and Chinese availability', async t => {
  const browser = await engine.launch(); t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  for (const slug of [slugs[1], slugs[3], slugs[10]]) {
    await page.goto(`${base}/guides/${slug}`);
    for (const locale of ['es', 'pt-br', 'ja', ...(chineseSlugs.has(slug) ? ['zh'] : []), 'en']) {
      await page.waitForLoadState('networkidle');
      await page.locator('.language-menu summary').click();
      const options = page.locator('.language-options');
      assert.equal(await options.locator('[aria-disabled=true]').count(), chineseSlugs.has(slug) ? 0 : 1);
      for (const target of ['en', 'es', 'pt-br', 'ja', ...(chineseSlugs.has(slug) ? ['zh'] : [])]) {
        const path = `${target === 'en' ? '' : `/${target}`}/guides/${slug}`;
        assert.equal(await options.getByRole('link', { name: names[target], exact: true }).getAttribute('href'), path);
      }
      await options.getByRole('link', { name: names[locale], exact: true }).click();
      await page.waitForURL(`${base}${locale === 'en' ? '' : `/${locale}`}/guides/${slug}`);
      assert.equal(await page.locator('[data-site-copyright]').count(), 1);
      // Finish speculative requests before the next cross-layout document navigation.
      await page.waitForLoadState('networkidle');
    }
  }
  assert.deepEqual(errors, []);
});

test('guide entries and copyright reach all page families', async t => {
  const browser = await engine.launch(); t.after(() => browser.close());
  const page = await browser.newPage();
  for (const locale of ['en', 'zh', 'es', 'pt-br', 'ja']) {
    const prefix = locale === 'en' ? '' : `/${locale}`;
    for (const path of ['', '/resize-image', '/convert-image', '/stitch-images', '/faq', '/guide']) {
      await page.goto(`${base}${prefix}${path}` || base);
      assert.equal(await page.locator('[data-site-copyright]').count(), 1, `${prefix}${path}`);
      assert.ok(await page.locator(`footer a[href="${prefix}/guide"]`).count() > 0);
    }
  }
  for (const path of ['/about', '/zh/privacy', '/compress-jpg', '/zh/compress-png']) {
    await page.goto(`${base}${path}`);
    assert.equal(await page.locator('[data-site-copyright]').count(), 1, path);
  }
});
