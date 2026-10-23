import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sitemapUrls, pageFingerprint, changedUrls, request, submitUrls } from '../../scripts/indexnow/core.mjs';

const origin = 'https://piczip.app';
test('sitemap discovers all five languages, deduplicates and rejects foreign URLs', () => {
  const paths = ['/', '/zh', '/es', '/pt-br', '/ja'];
  const xml = `<urlset>${paths.map((p) => `<url><loc>${origin}${p}</loc></url>`).join('')}</urlset>`;
  assert.equal(sitemapUrls(xml, origin).length, 5);
  assert.throws(() => sitemapUrls(xml.replace('/ja</loc>', '/ja?preview=1</loc>'), origin));
  assert.throws(() => sitemapUrls(xml.replace(origin, 'https://other.example'), origin));
  assert.throws(() => sitemapUrls('<urlset/>', origin));
});

test('ignore build hydration/assets but track content, SEO, JSON-LD and links', () => {
  const html = '<html><head><meta name="description" content="Guide"/><link href="/_next/static/a.css"/></head><body><h1>Crop</h1><a href="/crop-image">Tool</a><script type="application/ld+json">{"name":"Crop"}</script><script src="/_next/a.js">payload1</script></body></html>';
  assert.equal(pageFingerprint(html), pageFingerprint(html.replace('a.css', 'b.css').replace('payload1', 'payload2')));
  for (const [before, after] of [['Guide', 'New guide'], ['Crop</h1>', 'Rotate</h1>'], ['/crop-image', '/resize-image'], ['"name":"Crop"', '"name":"Rotate"']]) {
    assert.notEqual(pageFingerprint(html), pageFingerprint(html.replace(before, after)));
  }
  assert.throws(() => pageFingerprint('<html>error'));
});

test('first run includes all, rerun includes none, changed and new URLs only', () => {
  const before = { a: '1', b: '2' };
  assert.deepEqual(changedUrls({}, before), ['a', 'b']);
  assert.deepEqual(changedUrls(before, before), []);
  assert.deepEqual(changedUrls(before, { a: '3', b: '2', c: '4' }), ['a', 'c']);
});

test('retry rate limits and server errors but not invalid keys', async () => {
  let calls = 0;
  const response = await request(origin, {}, async () => new Response('', { status: [429, 503, 200][calls++] }), async () => {});
  assert.equal(response.status, 200);
  assert.equal(calls, 3);
  calls = 0;
  assert.equal((await request(origin, {}, async () => { calls++; return new Response('', { status: 403 }); })).status, 403);
  assert.equal(calls, 1);
  await assert.rejects(request(origin, {}, async () => new Response('', { status: 500 }), async () => {}));
});

test('Bing payload, 10,000 URL batching, accepted responses and rejection', async () => {
  const config = { origin, key: 'a'.repeat(32), endpoint: 'https://www.bing.com/indexnow' };
  const batches = [];
  await submitUrls(config, Array.from({ length: 10001 }, (_, i) => `${origin}/${i}`), async (endpoint, options) => {
    assert.equal(endpoint, config.endpoint);
    const payload = JSON.parse(options.body);
    assert.equal(payload.host, 'piczip.app');
    assert.equal(payload.keyLocation, `${origin}/${config.key}.txt`);
    batches.push(payload.urlList.length);
    return new Response('', { status: 202 });
  });
  assert.deepEqual(batches, [10000, 1]);
  await submitUrls(config, [], async () => assert.fail('Empty changes must not submit'));
  await assert.rejects(submitUrls(config, [origin], async () => new Response('', { status: 403 })));
});
