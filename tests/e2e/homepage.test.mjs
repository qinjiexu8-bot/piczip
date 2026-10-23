import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';

const base = process.env.PICZIP_TEST_URL || 'http://127.0.0.1:3100';
const engine = process.env.PICZIP_TEST_BROWSER === 'webkit' ? webkit : chromium;

for (const locale of ['en', 'zh']) for (const width of [375, 1440]) {
  test(`homepage comparison and FAQ: ${locale}, ${width}px`, async t => {
    const browser = await engine.launch();
    t.after(() => browser.close());
    const page = await browser.newPage({ viewport: { width, height: 1000 }, hasTouch: width === 375 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + (locale === 'zh' ? '/zh' : '/'));
    const slider = page.getByRole('slider', { name: locale === 'zh' ? '压缩前后对比' : 'Before and after compression', exact: true });
    await slider.scrollIntoViewIfNeeded();
    const images = await page.locator('.comparison-photo').evaluateAll(async elements => {
      await Promise.all(elements.map(image => image.decode()));
      return elements.map(image => [image.naturalWidth, image.naturalHeight]);
    });
    assert.deepEqual(images, [[1200, 800], [1200, 800]]);
    // First pointer interaction must not inherit a keyboard-style focus ring.
    await slider.click();
    const outline = () => page.locator('.comparison-image').evaluate(element => getComputedStyle(element).outlineStyle);
    assert.equal(await outline(), 'none');
    await slider.press('ArrowRight');
    assert.equal(await outline(), 'solid');
    await slider.focus();
    await slider.press('Home'); assert.equal(await slider.inputValue(), '0');
    await slider.press('End'); assert.equal(await slider.inputValue(), '100');
    await slider.press('ArrowLeft'); assert.equal(await slider.inputValue(), '99');
    let bounds = await slider.boundingBox();
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width * .2, bounds.y + bounds.height / 2, { steps: 10 });
    await page.mouse.up();
    assert.ok(Math.abs(Number(await slider.inputValue()) - 20) <= 1);
    assert.equal(await outline(), 'none');
    await slider.press('Tab');
    await page.keyboard.press('Shift+Tab');
    assert.ok(await slider.evaluate(element => document.activeElement === element));
    assert.equal(await outline(), 'solid');
    await slider.scrollIntoViewIfNeeded();
    if (width === 375) {
      bounds = await slider.boundingBox();
      await page.touchscreen.tap(bounds.x + bounds.width * .75, bounds.y + bounds.height / 2);
      assert.ok(Math.abs(Number(await slider.inputValue()) - 75) <= 1);
      assert.equal(await outline(), 'none');
      if (engine === chromium) {
        const touch = await page.context().newCDPSession(page);
        const y = bounds.y + bounds.height / 2;
        await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: bounds.x + bounds.width * .75, y }] });
        for (let step = 1; step <= 10; step++) {
          await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: bounds.x + bounds.width * (.75 - step * .05), y }] });
        }
        await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        assert.ok(Math.abs(Number(await slider.inputValue()) - 25) <= 1);
        await touch.detach();
      }
    }
    const questions = page.locator('.home-faq details');
    assert.equal(await questions.count(), 6);
    await questions.first().locator('summary').focus();
    await page.keyboard.press('Enter'); assert.equal(await questions.first().getAttribute('open'), '');
    await page.keyboard.press('Enter'); assert.equal(await questions.first().getAttribute('open'), null);
    for (const question of await questions.all()) {
      await question.locator('summary').click();
      assert.ok(await question.locator('p').isVisible());
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.locator('.home-faq-intro a').click();
    await page.waitForURL(base + (locale === 'zh' ? '/zh/faq' : '/faq'));
    assert.ok(await page.getByRole('heading', { level: 1 }).isVisible());
    assert.deepEqual(errors, []);
  });
}
