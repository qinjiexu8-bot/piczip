import test from 'node:test';
import assert from 'node:assert/strict';
import { resizeDimensions, stitchLayout, validateOutput } from '../../src/lib/image-tools/geometry.ts';
const options = { mode: 'pixels', width: 200, height: 200, percent: 50, lock: true };
test('resize preserves ratio inside bounds and handles automatic sides', () => {
  assert.deepEqual(resizeDimensions({ width: 400, height: 200 }, options), { width: 200, height: 100 });
  assert.deepEqual(resizeDimensions({ width: 100, height: 200 }, { ...options, width: 0 }), { width: 100, height: 200 });
  assert.deepEqual(resizeDimensions({ width: 400, height: 200 }, { ...options, lock: false }), { width: 200, height: 200 });
  assert.deepEqual(resizeDimensions({ width: 400, height: 200 }, { ...options, mode: 'percent', percent: 25 }), { width: 100, height: 50 });
});
test('resize rejects missing, fractional, negative and unbounded dimensions', () => {
  for (const patch of [{ width: 0, height: 0 }, { width: -1 }, { width: 1.5 }, { width: 0, lock: false }, { mode: 'percent', percent: 0 }, { mode: 'percent', percent: NaN }, { mode: 'percent', percent: 401 }]) assert.throws(() => resizeDimensions({ width: 400, height: 200 }, { ...options, ...patch }));
  assert.throws(() => validateOutput({ width: 5000, height: 5000 }), /output-limit/);
  assert.throws(() => validateOutput({ width: 8193, height: 1 }), /output-limit/);
});
test('stitch lays out unequal aspect ratios with exact gap and no trailing padding', () => {
  const sizes = [{ width: 400, height: 200 }, { width: 200, height: 400 }];
  assert.deepEqual(stitchLayout(sizes, 'vertical', 100, 10), { width: 100, height: 260, items: [{ width: 100, height: 50, x: 0, y: 0 }, { width: 100, height: 200, x: 0, y: 60 }] });
  assert.deepEqual(stitchLayout(sizes, 'horizontal', 100, 0), { width: 250, height: 100, items: [{ width: 200, height: 100, x: 0, y: 0 }, { width: 50, height: 100, x: 200, y: 0 }] });
  assert.throws(() => stitchLayout(sizes, 'vertical', 8000, 0), /output-limit/);
  assert.throws(() => stitchLayout(sizes, 'vertical', 100, -1), /invalid-layout/);
  assert.throws(() => stitchLayout([sizes[0]], 'vertical', 100, 0), /invalid-layout/);
});
