# PicZip

PicZip is a privacy-first image compressor built with Next.js for Vercel. Images are compressed locally in the browser with Wasm codecs; files are not uploaded to a server for processing.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- jSquash Wasm codecs for JPG, PNG, and WebP
- Vercel deployment target

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

Use Node.js 22.13 or later for the TypeScript regression tests.

```bash
npm run lint
npm test
npm run build
```

Browser regression checks use a production server and Playwright:

```bash
npx playwright install chromium webkit
npm run build
npm start -- --port 3100
```

In another terminal:

```bash
npm run test:e2e
PICZIP_TEST_BROWSER=webkit npm run test:e2e
```

Set `PICZIP_TEST_URL` to test a different local server URL. Tests cover real Wasm
compression, ZIP downloads with duplicate names, failed images, worker failure
recovery, cancelling, clearing, removing queued files, and Chinese phone controls.
Worker faults and slow tasks are injected only inside the test browser context.

Compression jobs have a 120-second worker timeout and a 50MB input file limit.
Cancelling or clearing terminates the active worker; the next compression creates
a fresh worker. Images remain local to the browser.

## SEO Pages

- `/`
- `/compress-jpg`
- `/compress-png`
- `/compress-webp`
- `/compress-image-to-100kb`
- `/compress-image-to-200kb`
- `/compress-image-without-upload`
- `/local-image-compressor`
- `/batch-image-compressor`
- `/guide`
- `/faq`
- `/privacy`
- `/terms`
- `/sitemap.xml`
- `/robots.txt`
