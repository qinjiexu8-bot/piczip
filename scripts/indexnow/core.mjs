import { createHash } from 'node:crypto';

export const hash = (text) => createHash('sha256').update(text).digest('hex');

export function sitemapUrls(xml, origin) {
  if (!/<urlset\b/.test(xml)) throw new Error('Expected a sitemap urlset');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    const url = new URL(match[1].replaceAll('&amp;', '&'));
    if (url.origin !== origin || url.search || url.hash || url.username || url.password) {
      throw new Error(`Non-canonical sitemap URL: ${url}`);
    }
    return url.href;
  });
  if (!urls.length) throw new Error('Empty sitemap; refusing to update state');
  return [...new Set(urls)].sort();
}

// Next's hydration payloads and hashed resource names change between builds.
// Keep rendered markup, metadata, inline JSON-LD and links to actual content.
export function pageFingerprint(html) {
  if (!/<\/html>/i.test(html)) throw new Error('Incomplete HTML');
  const stable = html
    .replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, (tag, attributes) =>
      /type=["']application\/ld\+json["']/i.test(attributes) ? tag : '')
    .replace(/<link\b[^>]*>/gi, (tag) => /\/_next\//.test(tag) ? '' : tag)
    .replace(/<!--[^]*?-->/g, '')
    .replace(/\snonce=["'][^"']*["']/g, '');
  return hash(stable);
}

export function changedUrls(previous, current) {
  return Object.keys(current).filter((url) => previous[url] !== current[url]);
}

export async function request(url, options = {}, fetcher = fetch, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))) {
  for (let attempt = 0; attempt < 4; attempt++) {
    let response;
    try {
      response = await fetcher(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(30_000) });
    } catch (error) {
      if (attempt === 3) throw error;
    }
    if (response && response.status !== 429 && response.status < 500) return response;
    if (attempt === 3) throw new Error(`Request failed: ${url} (${response?.status ?? 'network'})`);
    // Bound Retry-After to keep the workflow within its timeout.
    const retryAfter = Number(response?.headers.get('retry-after'));
    await sleep(Math.min(60_000, Math.max(2000 * 2 ** attempt, retryAfter * 1000 || 0)));
  }
}

export async function submitUrls(config, urls, requester = request) {
  for (let offset = 0; offset < urls.length; offset += 10_000) {
    const response = await requester(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(config.origin).host,
        key: config.key,
        keyLocation: `${config.origin}/${config.key}.txt`,
        urlList: urls.slice(offset, offset + 10_000),
      }),
    });
    if (![200, 202].includes(response.status)) throw new Error(`IndexNow rejected submission: HTTP ${response.status}`);
    console.log(response.status === 202 ? 'IndexNow received URLs; key verification pending (202).' : 'IndexNow received URLs (200).');
  }
}
