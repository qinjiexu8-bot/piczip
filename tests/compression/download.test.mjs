import test from 'node:test';
import assert from 'node:assert/strict';
import { zipSync, unzipSync } from 'fflate';
import { createZipEntries } from '../../src/lib/compression/download.ts';

const result = (outputName, byte) => ({ outputName, buffer: Uint8Array.of(byte).buffer });

test('same names and generated suffix collisions all survive an actual ZIP roundtrip', () => {
  const results = [result('photo-piczip.jpg', 1), result('photo-piczip.jpg', 2), result('photo-piczip (2).jpg', 3), result('PHOTO-PICZIP.JPG', 4)];
  const archive = unzipSync(zipSync(createZipEntries(results)));
  assert.equal(Object.keys(archive).length, results.length);
  assert.deepEqual(Object.values(archive).map(bytes => bytes[0]), [1, 2, 3, 4]);
  assert.equal(new Set(Object.keys(archive).map(name => name.toLowerCase())).size, results.length);
});

test('50 repeated output names preserve every file and its bytes', () => {
  const results = Array.from({ length: 50 }, (_, i) => result('image.webp', i));
  const archive = unzipSync(zipSync(createZipEntries(results)));
  assert.equal(Object.keys(archive).length, 50);
  assert.deepEqual(Object.values(archive).map(bytes => bytes[0]), results.map((_, i) => i));
});

test('entry names cannot introduce directories and prototype names remain ordinary keys', () => {
  const files = createZipEntries([result('../photo.jpg', 1), result('folder\\photo.jpg', 2), result('__proto__', 3)]);
  assert.equal(Object.getPrototypeOf(files), null);
  assert.equal(Object.keys(files).length, 3);
  assert.ok(Object.keys(files).every(name => !/[\\/]/.test(name)));
  assert.equal(files.__proto__[0], 3);
});
