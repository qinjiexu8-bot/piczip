import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

test('end-to-end runner persists only accepted changes and safely repeats', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'piczip-indexnow-'));
  const root = resolve('.');
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const config = JSON.parse(await readFile('scripts/indexnow/config.json', 'utf8'));
  const mock = join(cwd, 'mock.mjs');
  await writeFile(mock, `
    const config = ${JSON.stringify(config)};
    globalThis.fetch = async (input, options) => {
      const url = new URL(input);
      if (options?.method === 'POST') {
        const body = JSON.parse(options.body);
        console.log('POST_COUNT=' + body.urlList.length);
        return new Response('', {status: Number(process.env.TEST_STATUS || 200)});
      }
      if (url.pathname === '/.well-known/indexnow-deployment') return Response.json({sha: process.env.DEPLOYMENT_SHA});
      if (url.pathname.endsWith('.txt')) return new Response(config.key);
      if (url.pathname === '/sitemap.xml') return new Response('<urlset>' + ['/', '/zh', '/es', '/pt-br', '/ja'].map(p => '<url><loc>' + config.origin + p + '</loc></url>').join('') + '</urlset>');
      return new Response('<html><body>' + url.pathname + (url.pathname === '/es' ? process.env.TEST_CONTENT || 'original' : '') + '</body></html>');
    };
  `);
  const run = (env = {}, args = []) => spawnSync(process.execPath, ['--import', mock, join(root, 'scripts/indexnow/submit.mjs'), ...args], {
    cwd, encoding: 'utf8', env: { ...process.env, GIT_DIR: join(root, '.git'), GIT_WORK_TREE: root, DEPLOYMENT_SHA: sha, ...env },
  });
  try {
    let result = run();
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /POST_COUNT=5/);
    const statePath = join(cwd, '.indexnow-state/pages.json');
    const before = await readFile(statePath, 'utf8');
    result = run();
    assert.equal(result.status, 0, result.stderr);
    assert.doesNotMatch(result.stdout, /POST_COUNT/);
    result = run({ TEST_CONTENT: 'updated', TEST_STATUS: '403' });
    assert.notEqual(result.status, 0);
    assert.equal(await readFile(statePath, 'utf8'), before);
    result = run({ TEST_CONTENT: 'updated' }, ['--dry-run']);
    assert.equal(result.status, 0, result.stderr);
    assert.doesNotMatch(result.stdout, /POST_COUNT/);
    assert.equal(await readFile(statePath, 'utf8'), before);
    result = run({ TEST_CONTENT: 'updated' });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /POST_COUNT=1/);
    result = run({ DEPLOYMENT_SHA: 'a'.repeat(40) });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Skipping superseded/);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
