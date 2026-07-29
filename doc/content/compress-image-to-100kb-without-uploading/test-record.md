# Test Record: Compress an Image to 100KB Without Uploading

Status: Reproduced

| Field | Value |
| --- | --- |
| Test date | 2026-07-29 |
| PicZip build | `ba9819e` plus the non-behavioral exact-byte result attribute |
| Test URL | `http://localhost:3000/compress-image-to-100kb` |
| Browser | Google Chrome 150.0.7871.182 through the Codex in-app browser |
| Operating system | macOS 26.3.1 (25D771280a) |
| Source image | `coastal-town-source.png`, privacy-safe AI-generated test fixture created for PicZip |
| Original file | PNG, 1536×1024, 2,976,317 bytes |
| Settings | Target 100KB; Output Auto; Quality 82; Max width 2400px |
| Result file | WebP, 1536×1024, 101,730 bytes |
| Outcome | Passed: output was below PicZip's 102,400-byte target |
| Reduction | 2,874,587 bytes saved; 96.58% smaller, displayed as 97% |
| Engine | WebP Wasm |
| Observations | PicZip selected WebP as the smaller Auto result. No resize was needed because the source width was already below 2400px. Fine roof and foliage detail was visibly softer at close inspection, but the image remained suitable for a small form upload. |

## Reproduction steps

1. Open `/compress-image-to-100kb`.
2. Add `coastal-town-source.png`.
3. Keep Target size at 100, Output at Auto, Quality at 82, and Max width at 2400.
4. Select Compress images.
5. Confirm that the result reports 99KB and `data-compressed-bytes="101730"`.

## Evidence

- `public/guides/compress-image-to-100kb-without-uploading/piczip-100kb-settings.jpg`
- `public/guides/compress-image-to-100kb-without-uploading/piczip-100kb-result.jpg`

## Interpretation

PicZip treats the target as a maximum best-effort size in binary kilobytes. For this test, 100KB means 102,400 bytes. The 101,730-byte result is 670 bytes below that limit. It is not exactly 100,000 bytes, and the article must not describe it as exact.
