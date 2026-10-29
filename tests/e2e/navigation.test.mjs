import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';

const base = process.env.PICZIP_TEST_URL || 'http://127.0.0.1:3100';
const browserType = process.env.PICZIP_TEST_BROWSER === 'webkit' ? webkit : chromium;
const prefixes = ['', '/zh', '/es', '/pt-br', '/ja'];
const paths = ['/', '/resize-image', '/convert-image', '/crop-image', '/stitch-images', '/watermark-image'];
const localPath = (prefix, path) => prefix ? prefix + (path === '/' ? '' : path) : path;
async function setup(t, viewport) {
  const browser = await browserType.launch();
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  t.after(async () => { try { assert.deepEqual(errors, []); } finally { await browser.close(); } });
  return page;
}

test('tool directory: five locales, six working tools and guides, metadata and language switching', async t => {
  const page = await setup(t, { width: 1440, height: 900 });
  const xml = await (await fetch(base + '/sitemap.xml')).text();
  for (const prefix of prefixes) {
    assert.ok(xml.includes(`<loc>https://piczip.app${prefix}/tools</loc>`));
    const response = await page.goto(base + prefix + '/tools');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    assert.equal(response.status(), 200);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal((await page.locator('[data-tool-category]').evaluateAll(cards => [...new Set(cards.map(c => c.dataset.toolCategory))])).length, 3);
    assert.equal(await page.locator('[data-directory-tool]').count(), 6);
    const urls = await page.locator('[data-directory-tool]').evaluateAll(links => links.map(a => new URL(a.href).pathname));
    assert.deepEqual(urls.sort(), paths.map(path => localPath(prefix, path)).sort());
    for (const href of await page.locator('.directory-card a').evaluateAll(links => [...new Set(links.map(a => a.href))])) {
      assert.equal((await fetch(href)).status, 200, href);
    }
    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), `https://piczip.app${prefix}/tools`);
    assert.equal(await page.locator('link[hreflang]').count(), 6);
    assert.equal((await page.title()).split('PicZip').length - 1, 1);
    await page.locator('.language-menu summary').click();
    const targets = await page.locator('.language-options a').evaluateAll(links => links.map(a => new URL(a.href).pathname));
    assert.deepEqual(targets.sort(), prefixes.map(p => p + '/tools').sort());
    assert.ok(await page.locator(`.directory-footer-link a[href="${prefix}/tools"]`).count());
  }
  await page.locator('.language-options a[hreflang="ja"]').click();
  await page.waitForURL(base + '/ja/tools');
});

test('desktop navigation: keyboard, outside click, active tool, language menu and bounded panels', async t => {
  const page = await setup(t, { width: 1024, height: 800 });
  for (const prefix of prefixes) {
    await page.goto(base + prefix + '/crop-image');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const summary = page.locator('.nav-tools-menu > summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    await page.locator('.nav-tools-menu[open]').waitFor();
    assert.ok(await page.locator('.nav-tools-menu').getAttribute('open') !== null);
    assert.equal(await page.locator('.nav-tool-groups a').count(), 6);
    assert.equal(await page.locator('.nav-tool-groups a[aria-current=page]').getAttribute('href'), prefix + '/crop-image');
    const bounds = await page.locator('.nav-tools-panel').boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 1024);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.nav-tools-menu').getAttribute('open'), null);
    assert.ok(await summary.evaluate(e => e === document.activeElement));
    await summary.click();
    await page.locator('main').click({ position: { x: 5, y: 500 } });
    assert.equal(await page.locator('.nav-tools-menu').getAttribute('open'), null);
    await summary.click();
    await page.locator('.language-menu summary').click();
    assert.equal(await page.locator('.nav-tools-menu').getAttribute('open'), null);
    await page.locator('.language-menu summary').click();
    await summary.click();
    await page.locator('.nav-tool-groups a').last().click();
    await page.waitForURL(base + prefix + '/watermark-image');
    assert.equal(await page.locator('.nav-tools-menu').getAttribute('open'), null);
  }
});

test('mobile navigation: grouped links, Escape, route changes and short-screen scrolling', async t => {
  const page = await setup(t, { width: 320, height: 740 });
  for (const prefix of prefixes) {
    await page.goto(base + prefix + '/tools');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.locator('.mobile-menu > summary').click();
    assert.ok(await page.locator('.mobile-nav-panel').isVisible());
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    for (const group of await page.locator('.mobile-category').all()) {
      await group.locator('summary').click();
    }
    assert.equal(await page.locator('.mobile-category a:visible').count(), 6);
    const bounds = await page.locator('.mobile-nav-panel').boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 320);
    await page.locator('.mobile-category a').last().focus();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.mobile-menu').getAttribute('open'), null);
    await page.locator('.mobile-menu > summary').click();
    await page.locator('.mobile-category a').first().click();
    await page.waitForURL(base + (prefix || '/'));
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    assert.equal(await page.locator('.mobile-menu').getAttribute('open'), null);
  }
  await page.goto(base + '/ja/tools');
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  await page.setViewportSize({ width: 667, height: 375 });
  await page.locator('.mobile-menu > summary').click();
  for (const group of await page.locator('.mobile-category').all()) {
    if (await group.getAttribute('open') === null) await group.locator('summary').click();
  }
  const faq = page.locator('.mobile-nav-resources a').last();
  await faq.scrollIntoViewIfNeeded();
  await faq.click();
  await page.waitForURL(base + '/ja/faq');
  assert.equal(await page.locator('.mobile-menu').getAttribute('open'), null);
});


test('directory layout: aligned rows across desktop, tablet and mobile in all five languages', async t => {
  const page = await setup(t, { width: 1440, height: 900 });
  for (const [width, columns] of [[1440, 3], [850, 2], [390, 1], [320, 1]]) {
    await page.setViewportSize({ width, height: 900 });
    for (const prefix of prefixes) {
      await page.goto(base + prefix + '/tools');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      const cards = await page.locator('.directory-card').evaluateAll(items => items.map(item => {
        const r = item.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), height: Math.round(r.height), right: Math.round(r.right) };
      }));
      assert.equal(cards.length, 6);
      assert.equal(new Set(cards.map(r => r.y)).size, 6 / columns, `${prefix} at ${width}px`);
      for (let i = 0; i < cards.length; i += columns) {
        const row = cards.slice(i, i + columns);
        assert.equal(new Set(row.map(r => r.height)).size, 1);
        assert.ok(row.every(r => r.y === row[0].y && r.x >= 0 && r.right <= width));
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
  }
});
