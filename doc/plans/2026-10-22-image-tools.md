# Image tools implementation plan

**Goal:** Add local resize, convert and stitch tools in the existing A visual style, with English/Chinese routes and primary navigation.
**Architecture:** Shared tool UI and bounded Worker image processing. Pure geometry functions handle resize and composition. Worker cancellation terminates work; per-file errors allow batch continuation. Existing compression code and pre-existing SEO working files are preserved.
**Tech stack:** Next.js, React, TypeScript, OffscreenCanvas, jSquash WebP, fflate, Playwright.

1. Add validated geometry and Worker pipeline in src/lib/image-tools and src/workers/image-tools.worker.ts. Test dimensions, layout and allocation limits.
2. Add shared client in src/components/image-tools with file queue, settings, ordering, previews, cancellation, download and ZIP.
3. Add six localized pages, metadata, route mapping, primary navigation and homepage discovery. Keep sitemap and existing SEO files byte-identical.
4. Run lint, build, unit and Chromium/WebKit browser tests. Verify actual output dimensions, MIME, transparent/JPG backgrounds, stitching order, ZIP names, cancellation and mobile navigation. Inspect screenshots.
5. Record results and compare all pre-existing modified-file hashes. Leave changes uncommitted for review.

Limits: JPG/PNG/WebP still-image processing; animated input exports one frame. 50 files (20 for stitching), 50 MB per file, 200 MB per selection queue, 40 MP input, 16 MP output, 8192 px output edge. Stitch normalizes to a shared width/height without cropping. Resize maintains aspect by fitting within supplied bounds or stretches when unlocked. No AI, server uploads or account required.
