import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultPadding, paddingLayout, validPadding } from '../../src/lib/image-tools/padding.ts';
import { defaultMosaic, mosaicRectangle, validMosaic } from '../../src/lib/image-tools/mosaic.ts';
import { parsePresets, validSettings } from '../../src/lib/workflow/settings.ts';
import { transferAllowed } from '../../src/lib/workflow/transfer.ts';

const image = { width: 200, height: 100 };
test('padding adds exact borders and keeps original pixels unscaled', () => {
  const layout = paddingLayout(image, { ...defaultPadding, top: 10, right: 20, bottom: 10, left: 20 });
  assert.deepEqual(layout, { width: 240, height: 120, x: 20, y: 10, imageWidth: 200, imageHeight: 100 });
  assert.deepEqual(paddingLayout(image, { ...defaultPadding, mode: 'ratio', ratio: '1:1' }), { width: 200, height: 200, x: 0, y: 50, imageWidth: 200, imageHeight: 100 });
});
test('fixed canvas fits without enlargement or cropping and honors nine-point alignment', () => {
  assert.deepEqual(paddingLayout(image, { ...defaultPadding, mode: 'canvas', width: 300, height: 300 }), { width: 300, height: 300, x: 50, y: 100, imageWidth: 200, imageHeight: 100 });
  assert.deepEqual(paddingLayout(image, { ...defaultPadding, mode: 'canvas', width: 100, height: 100, position: 8 }), { width: 100, height: 100, x: 0, y: 50, imageWidth: 100, imageHeight: 50 });
  assert.equal(validPadding({ ...defaultPadding, top: NaN }), false);
  assert.equal(validPadding({ ...defaultPadding, left: -1 }), false);
  assert.equal(validPadding({ ...defaultPadding, position: 9 }), false);
  assert.throws(() => paddingLayout(image, { ...defaultPadding, mode: 'canvas', width: 8192, height: 8192 }), /output-limit/);
});
test('mosaic percentage regions cover the same relative area at batch dimensions', () => {
  const region = { x: 25, y: 25, width: 50, height: 50 };
  assert.deepEqual(mosaicRectangle(image, region), { x: 50, y: 25, width: 100, height: 50 });
  assert.deepEqual(mosaicRectangle({ width: 400, height: 200 }, region), { x: 100, y: 50, width: 200, height: 100 });
  assert.equal(validMosaic({ ...defaultMosaic, regions: [region] }), true);
  assert.equal(validMosaic({ ...defaultMosaic, regions: [{ ...region, width: 80 }] }), false);
  assert.equal(validMosaic({ ...defaultMosaic, blockSize: 3 }), false);
  assert.equal(validMosaic({ ...defaultMosaic, regions: Array(21).fill(region) }), false);
});
test('new canvas presets coexist with existing compression data and transfer destinations', () => {
  const base = { tool: 'padding', format: 'png', quality: 82, resize: { mode: 'pixels', width: 0, height: 0, percent: 100, lock: true }, background: '#ffffff', transparent: false, direction: 'vertical', edge: 800, gap: 0 };
  const padding = { ...base, padding: defaultPadding };
  const mosaic = { ...base, tool: 'mosaic', format: 'original', mosaic: { ...defaultMosaic, regions: [{ x: 25, y: 25, width: 50, height: 50 }] } };
  assert.equal(validSettings('padding', padding), true);
  assert.equal(validSettings('mosaic', mosaic), true);
  assert.equal(validSettings('mosaic', { ...mosaic, mosaic: { ...mosaic.mosaic, blockSize: 101 } }), false);
  const old = { id: 'a', name: 'old', tool: 'compress', settings: { format: 'webp', quality: 82, targetKb: 200, maxWidth: 2400 } };
  assert.equal(parsePresets(JSON.stringify([old, { id: 'b', name: 'border', tool: 'padding', settings: padding }, { id: 'c', name: 'cover', tool: 'mosaic', settings: mosaic }])).length, 3);
  assert.equal(transferAllowed([{ name: 'x.png', blob: { size: 100, type: 'image/png' } }], 'padding'), true);
  assert.equal(transferAllowed([{ name: 'x.png', blob: { size: 100, type: 'image/png' } }], 'mosaic'), true);
});
