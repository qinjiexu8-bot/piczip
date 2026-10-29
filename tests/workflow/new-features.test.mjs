import test from 'node:test';
import assert from 'node:assert/strict';
import { pdfLayout } from '../../src/lib/pdf/layout.ts';
import { parsePipelines, pipelineInputAllowed, stepFromPreset, validPipeline } from '../../src/lib/workflow/pipelines.ts';
const compression = { tool: 'compress', name: 'Small', settings: { format: 'jpeg', quality: 82, targetKb: 200, maxWidth: 1200 } };
const options = { tool: 'resize', format: 'png', quality: 90, resize: { mode: 'pixels', width: 100, height: 0, percent: 50, lock: true }, background: '#ffffff', transparent: false, direction: 'vertical', edge: 800, gap: 0 };
const resize = { tool: 'resize', name: '100px', settings: options };

test('PDF dimensions, margins and proportional fitting preserve complete images', () => {
  assert.deepEqual(pdfLayout({ width: 200, height: 100 }, 'auto', 'portrait', 0), { width: 150, height: 75, x: 0, y: 0, imageWidth: 150, imageHeight: 75 });
  const box = pdfLayout({ width: 200, height: 100 }, 'a4', 'landscape', 10);
  assert.equal(box.width, 841.89); assert.equal(box.height, 595.28);
  assert.ok(Math.abs(box.x - 10 * 72 / 25.4) < .001);
  assert.equal(box.imageWidth / box.imageHeight, 2);
  assert.ok(box.y > box.x);
  assert.throws(() => pdfLayout({ width: 10000, height: 10000 }, 'a4', 'portrait', 10));
  assert.throws(() => pdfLayout({ width: 20, height: 10 }, 'letter', 'portrait', -1));
});
test('saved workflows snapshot presets, reject corrupt data and survive source-preset changes', () => {
  const preset = { id: 'original', ...resize, settings: structuredClone(options) };
  const snapshot = stepFromPreset(preset); preset.settings.resize.width = 999;
  assert.equal(snapshot.settings.resize.width, 100);
  const flow = { id: 'flow', name: 'Product images', steps: [snapshot, compression] };
  assert.equal(validPipeline(flow), true);
  assert.deepEqual(parsePipelines(JSON.stringify([flow])), [flow]);
  assert.throws(() => parsePipelines('{broken'));
  assert.throws(() => parsePipelines(JSON.stringify([{ ...flow, steps: [{ ...compression, settings: {} }, resize] }])));
  assert.equal(validPipeline({ ...flow, steps: [compression] }), false);
  assert.equal(validPipeline({ ...flow, steps: Array(7).fill(compression) }), false);
  const stitch = { tool: 'stitch', name: 'join', settings: { ...options, tool: 'stitch' } };
  assert.equal(validPipeline({ ...flow, steps: [stitch, stitch] }), false);
});
test('workflow batch limits account for a stitching step and reject incompatible files', () => {
  const image = { name: 'x.png', blob: { size: 1024, type: 'image/png' } };
  assert.equal(pipelineInputAllowed([image], [resize, compression]), true);
  assert.equal(pipelineInputAllowed(Array(51).fill(image), [resize, compression]), false);
  const stitch = { tool: 'stitch', name: 'join', settings: { ...options, tool: 'stitch' } };
  assert.equal(pipelineInputAllowed([image], [stitch, compression]), false);
  assert.equal(pipelineInputAllowed(Array(20).fill(image), [stitch, compression]), true);
  assert.equal(pipelineInputAllowed(Array(21).fill(image), [stitch, compression]), false);
  assert.equal(pipelineInputAllowed([{ ...image, blob: { size: 10, type: 'application/pdf' } }], [resize, compression]), false);
});
