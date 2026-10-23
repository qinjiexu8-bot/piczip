// Generate the input fixture, then compress it through PicZip's real browser UI.
// Run with the local app running: node doc/content/home-comparison/generate.mjs
import sharp from 'sharp';
import { chromium } from 'playwright';
import { stat, writeFile } from 'node:fs/promises';
const original = 'public/images/comparison/coast-original.jpg';
const compressed = 'public/images/comparison/coast-compressed.webp';
await sharp('doc/content/compress-image-to-100kb-without-uploading/evidence/coastal-town-source.png').resize(1200, 800).jpeg({ quality: 92 }).toFile(original);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ acceptDownloads: true });
  await page.addInitScript(() => Object.defineProperty(window, 'showSaveFilePicker', { value: undefined }));
  await page.goto(process.env.PICZIP_TEST_URL || 'http://localhost:3101');
  await page.getByLabel('Target size', { exact: true }).fill('0');
  await page.getByLabel('Max width', { exact: true }).fill('0');
  await page.getByRole('group', { name: 'Output', exact: true }).getByRole('button', { name: 'WebP', exact: true }).click();
  await page.getByLabel('Quality', { exact: true }).fill('75');
  await page.locator('input[type=file]').setInputFiles(original);
  await page.getByRole('button', { name: 'Compress images', exact: true }).click();
  await page.locator('[data-compressed-bytes]').waitFor();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download coast-original.jpg', exact: true }).click();
  await (await downloadEvent).saveAs(compressed);
  const before = await stat(original), after = await stat(compressed);
  const metadata = { width: 1200, height: 800, originalBytes: before.size, compressedBytes: after.size, quality: 75, output: 'WebP', targetBytes: 0 };
  await writeFile('public/images/comparison/metadata.json', JSON.stringify(metadata, null, 2) + '\n');
  console.log(metadata);
} finally { await browser.close(); }
