import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { hash, sitemapUrls, pageFingerprint, changedUrls, request, submitUrls } from './core.mjs';

const config = JSON.parse(await readFile(new URL('./config.json', import.meta.url), 'utf8'));
const dryRun = process.argv.includes('--dry-run');
const statePath = '.indexnow-state/pages.json';
const expectedSha = process.env.DEPLOYMENT_SHA;

async function getText(path) {
  const response = await request(new URL(path, config.origin));
  if (response.status !== 200) throw new Error(`${path}: HTTP ${response.status}`);
  return response.text();
}

if (!dryRun) {
  if (!expectedSha || !/^[a-f0-9]{40}$/.test(expectedSha)) throw new Error('DEPLOYMENT_SHA is required');
  const checkoutSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (checkoutSha !== expectedSha) {
    console.log('Skipping superseded deployment; main has advanced.');
    process.exit(0);
  }
  let ready = false;
  for (let attempt = 0; attempt < 6; attempt++) {
    const marker = JSON.parse(await getText('/.well-known/indexnow-deployment'));
    if (marker.sha === expectedSha) { ready = true; break; }
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }
  if (!ready) throw new Error('Production alias does not serve the expected deployment; retry after promotion');
  const key = await getText(`/${config.key}.txt`);
  if (key.trim() !== config.key) throw new Error('Production IndexNow key file does not match');
}

let previous = {};
try {
  const state = JSON.parse(await readFile(statePath, 'utf8'));
  if (state.origin !== config.origin || state.version !== 1) throw new Error('Incompatible IndexNow state');
  previous = state.pages;
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const urls = sitemapUrls(await getText('/sitemap.xml'), config.origin);
for (const prefix of ['/', '/zh', '/es', '/pt-br', '/ja']) {
  if (!urls.includes(`${config.origin}${prefix}`)) throw new Error(`Missing language homepage: ${prefix}`);
}
// Also detect functional changes invisible in server-rendered HTML (tools/hooks).
const runtimeTree = execFileSync('git', ['ls-tree', '-r', 'HEAD', '--', 'src/components', 'src/hooks', 'src/workers', 'src/lib/compression', 'src/lib/image-tools', 'src/lib/export', 'src/lib/workflow'], { encoding: 'utf8' });
const runtimeHash = hash(runtimeTree);
const pages = {};
let cursor = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    pages[url] = hash(pageFingerprint(await getText(url)) + runtimeHash);
  }
}));
const changed = changedUrls(previous, pages);
console.log(`${urls.length} canonical pages checked; ${changed.length} new or updated pages.`);
if (dryRun) {
  console.log(JSON.stringify(changed, null, 2));
  console.log('Dry run: no IndexNow request or state write.');
} else {
  // Check again after crawling, in case production changed mid-run.
  const marker = JSON.parse(await getText('/.well-known/indexnow-deployment'));
  if (marker.sha !== expectedSha) throw new Error('Production changed during crawl; state not saved');
  await submitUrls(config, changed);
  await mkdir('.indexnow-state', { recursive: true });
  await writeFile(statePath, JSON.stringify({ version: 1, origin: config.origin, sha: expectedSha, pages }, null, 2));
  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, `Checked ${urls.length} pages across five languages. Submitted ${changed.length} new/updated URLs. Receipt does not guarantee indexing.\n`);
  }
}
