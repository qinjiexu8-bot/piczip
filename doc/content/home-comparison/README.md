# Homepage compression comparison

The homepage uses a fixed sample, separate from the user's selected files. Both locales share one interactive component and six collapsed, server-rendered FAQ entries. The tool remains above the sample; desktop uses a two-column card, mobile stacks the content. The range supports pointer capture, touch, arrow keys, Home and End. The focus ring is shown for keyboard interaction only; pointer input suppresses it without removing focus. An explicit tab index keeps the slider reachable in Safari keyboard navigation. No animation runs automatically.

## Sample provenance and reproduction

Source: the existing repository fixture `doc/content/compress-image-to-100kb-without-uploading/evidence/coastal-town-source.png`.

With the local site running on port 3101, run:

```sh
node doc/content/home-comparison/generate.mjs
```

The script prepares a 1200 × 800 JPG at quality 92 with Sharp, then uploads it to the actual PicZip compression UI and downloads its WebP output (quality 75, no target-size or width limit). The committed original is 314,849 bytes; output is 129,698 bytes, a rounded 59% reduction. Metadata lives beside the files and supplies the displayed sizes. Both images retain identical dimensions and alignment. Next Image optimization is disabled for this demo to avoid re-encoding either sample; lazy loading remains enabled.

## Verification

```sh
PICZIP_TEST_URL=http://localhost:3101 node --test tests/e2e/homepage.test.mjs
PICZIP_TEST_URL=http://localhost:3101 PICZIP_TEST_BROWSER=webkit node --test tests/e2e/homepage.test.mjs
```

Checks cover both languages at 375px and 1440px, image decoding and dimensions, mouse dragging, touch positioning, keyboard endpoints/steps, FAQ keyboard toggling, all answers, FAQ destination links, overflow and runtime errors.

This change does not edit metadata, the sitemap, existing guide content or the footer. Previously uncommitted SEO files are preserved.
