import test from 'node:test';
import assert from 'node:assert/strict';
import { CompressionWorkerClient } from '../../src/lib/compression/worker-client.ts';

class FakeWorker extends EventTarget {
  terminated = false;
  sent = [];
  postMessage(job) { this.sent.push(job); }
  terminate() { this.terminated = true; }
  reply(data) { this.dispatchEvent(new MessageEvent('message', { data })); }
}
const job = () => ({ id: 'request-1', name: 'a.png', type: 'image/png', buffer: new ArrayBuffer(1), options: { outputFormat: 'auto', quality: 82 } });
const setup = (timeoutMs = 1000) => {
  const workers = [];
  const client = new CompressionWorkerClient(() => {
    const worker = new FakeWorker(); workers.push(worker); return worker;
  }, timeoutMs);
  return { client, workers };
};

test('matches request IDs and resolves successful results', async () => {
  const { client, workers } = setup();
  const pending = client.run(job());
  workers[0].reply({ id: 'stale', ok: true, result: 'wrong' });
  workers[0].reply({ id: 'request-1', ok: true, result: 'result' });
  assert.equal(await pending, 'result');
  client.dispose();
});

for (const event of ['error', 'messageerror']) {
  test(`${event} rejects and the next request creates a fresh worker`, async () => {
    const { client, workers } = setup();
    const pending = client.run(job());
    const rejection = assert.rejects(pending, { code: 'worker' });
    workers[0].dispatchEvent(new Event(event));
    await rejection;
    assert.equal(workers[0].terminated, true);
    const next = client.run(job());
    workers[1].reply({ id: 'request-1', ok: true, result: 'recovered' });
    assert.equal(await next, 'recovered');
    client.dispose();
  });
}

test('timeout rejects, terminates, and permits retry', async () => {
  const { client, workers } = setup(5);
  await assert.rejects(client.run(job()), { code: 'timeout' });
  assert.equal(workers[0].terminated, true);
  const next = client.run(job());
  workers[1].reply({ id: 'request-1', ok: true, result: 'retry' });
  assert.equal(await next, 'retry');
  client.dispose();
});

test('abort settles the request and prevents stale worker results', async () => {
  const { client, workers } = setup();
  const controller = new AbortController();
  const pending = client.run(job(), controller.signal);
  const rejection = assert.rejects(pending, { name: 'AbortError' });
  controller.abort();
  await rejection;
  assert.equal(workers[0].terminated, true);
  const next = client.run(job());
  workers[0].reply({ id: 'request-1', ok: true, result: 'stale' });
  workers[1].reply({ id: 'request-1', ok: true, result: 'fresh' });
  assert.equal(await next, 'fresh');
  client.dispose();
});

test('business failure settles without blocking subsequent requests', async () => {
  const { client, workers } = setup();
  const pending = client.run(job());
  const rejection = assert.rejects(pending, /bad image/);
  workers[0].reply({ id: 'request-1', ok: false, error: 'bad image' });
  await rejection;
  const next = client.run(job());
  workers[0].reply({ id: 'request-1', ok: true, result: 'ok' });
  assert.equal(await next, 'ok');
  client.dispose();
});

test('postMessage and worker initialization failures settle immediately', async () => {
  const failedInit = new CompressionWorkerClient(() => { throw new Error('blocked'); });
  await assert.rejects(failedInit.run(job()), { code: 'unavailable' });
  const worker = new FakeWorker();
  worker.postMessage = () => { throw new Error('clone failed'); };
  const client = new CompressionWorkerClient(() => worker);
  await assert.rejects(client.run(job()), { code: 'worker' });
  assert.equal(worker.terminated, true);
});

test('dispose rejects active requests and already-aborted signals never start a worker', async () => {
  const { client, workers } = setup();
  const controller = new AbortController(); controller.abort();
  await assert.rejects(client.run(job(), controller.signal), { name: 'AbortError' });
  assert.equal(workers.length, 0);
  const pending = client.run(job());
  const rejection = assert.rejects(pending, { name: 'AbortError' });
  client.dispose();
  await rejection;
  assert.equal(workers[0].terminated, true);
});
