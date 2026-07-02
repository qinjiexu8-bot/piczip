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

```bash
npm run lint
npm run build
```

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
