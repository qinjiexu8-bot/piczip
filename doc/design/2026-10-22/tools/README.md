# PicZip local image toolkit

Implemented 2026-10-22 in the existing A visual style. Local preview: http://localhost:3101/zh.

## Features

- Resize (`/resize-image`, `/zh/resize-image`): batch pixel bounds, automatic missing side, optional aspect lock, exact stretching, percentage scaling, original/JPG/PNG/WebP export and ZIP.
- Convert (`/convert-image`, `/zh/convert-image`): batch JPG/PNG/WebP conversion, JPEG matte color, quality control, transparent PNG/WebP and ZIP.
- Stitch (`/stitch-images`, `/zh/stitch-images`): horizontal/vertical composition, ordered queue with keyboard-accessible arrow buttons, proportional shared edge, spacing, colored/transparent background, export preview and download.
- All six routes are in the localization registry; existing sitemap consumes that registry without changing the pre-existing sitemap working file. Added desktop/mobile primary navigation and homepage discovery cards.

## Processing and boundaries

A dedicated Worker runs sequential jobs with per-file failures for resize/conversion. Stitching validates every image before composition and identifies corrupt inputs. Cancellation terminates the Worker; old results are ignored, timers cleared and Blob URLs revoked on clear/removal/unmount. Changed options mark previous output as stale. Native encoders verify the MIME type; WebP has a jSquash fallback for Safari.

JPG/PNG/WebP only. Animated files export a still frame. Up to 50 batch images or 20 stitched images, 50 MB/file, 200 MB queue, 40 MP decoded input, 16 MP output and 8192 px maximum output side. Stitch uses the shared edge without cropping. Browser export can increase file size. No cross-tool file handoff in this iteration.

## Validation

- `npm run lint`: clean.
- `npm run build`: successful, 50 static entries including the six new routes.
- `npm test`: 18/18 passed.
- `PICZIP_TEST_URL=http://127.0.0.1:3102 npm run test:e2e`: Chromium 15/15 passed.
- Same suite with `PICZIP_TEST_BROWSER=webkit`: WebKit 15/15 passed.
- Both browser suites include the nine existing compressor tests plus six new tool tests. New checks decode actual output and verify dimensions, pixel colors/transparency, file MIME/signature, PNG/JPG/WebP input, duplicate ZIP names, stitch order/spacing, invalid files/size limits, cancellation/clear/recovery, Chinese mobile navigation and locale switching. No upload requests or unhandled page errors.
- Browser tests wait for the exact destination URL and hydrated file control after navigation; image controls remain disabled until hydration.
- Real-photo desktop/mobile screenshots in this directory, captured against the final production build.
- All 14 pre-existing SEO working files remain byte-identical to the pre-task SHA-256 manifest. SEO changes are excluded from the feature commit.
