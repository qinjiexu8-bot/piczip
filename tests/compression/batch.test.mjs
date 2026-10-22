import test from 'node:test';
import assert from 'node:assert/strict';
import { CompressionBatch } from '../../src/lib/compression/batch.ts';

const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
const callbacks = (events) => ({
  start: item => events.push(`start:${item.id}`),
  success: item => events.push(`done:${item.id}`),
  failure: item => events.push(`error:${item.id}`),
});

test('cancelling during preparation skips results and all remaining files', async () => {
  const batch = new CompressionBatch(); const wait = deferred(); const events = []; let signal;
  const pending = batch.run(items, async (_, s) => { signal = s; await wait.promise; }, callbacks(events));
  batch.cancel();
  assert.equal(signal.aborted, true);
  wait.resolve(); await pending;
  assert.deepEqual(events, ['start:a']);
});

test('removing the active file aborts it and continues remaining files', async () => {
  const batch = new CompressionBatch(); const wait = deferred(); const events = []; let signal;
  const pending = batch.run(items, async (item, s) => {
    if (item.id === 'a') { signal = s; await wait.promise; throw new DOMException('Cancelled', 'AbortError'); }
  }, callbacks(events));
  batch.remove('a'); assert.equal(signal.aborted, true);
  wait.resolve(); await pending;
  assert.deepEqual(events, ['start:a', 'start:b', 'done:b', 'start:c', 'done:c']);
});

test('removed queued files never start and errors do not stop subsequent files', async () => {
  const batch = new CompressionBatch(); const events = [];
  batch.remove('b');
  await batch.run(items, async item => { if (item.id === 'a') throw new Error('bad image'); }, callbacks(events));
  assert.deepEqual(events, ['start:a', 'error:a', 'start:c', 'done:c']);
});

test('an old cancelled batch cannot publish after a new batch completes', async () => {
  const old = new CompressionBatch(); const wait = deferred(); const events = [];
  const pending = old.run(items, async () => wait.promise, callbacks(events));
  old.cancel();
  await new CompressionBatch().run([{ id: 'new' }], async () => 'ok', callbacks(events));
  wait.resolve(); await pending;
  assert.deepEqual(events, ['start:a', 'start:new', 'done:new']);
});
