# Test Record: Why Is My Compressed Image Still Too Large?

- Test date: 2026-07-30
- Article review date: 2026-07-31
- PicZip build: local production build based on commit `83e551b`
- Browser: Chromium
- Operating system: macOS
- Source image: PicZip coastal test fixture
- Original file: PNG, 1536×1024, 2,976,317 bytes

| Attempt | Settings | Result | Outcome |
| --- | --- | --- | --- |
| PNG re-encode | Target 0KB, quality 82, max width 0, PNG output | 1536×1024, 3,449,964 bytes | Failed: 15.91% larger |
| Original dimensions | Target 200KB, automatic output, original dimensions | WebP, 1536×1024, 196,308 bytes | Pass |
| Width-limited | Target 200KB, automatic output, max width 1200 | WebP, 1200×800, 157,426 bytes | Pass with more margin |

The failed attempt shows that a compressor cannot guarantee a smaller result when the selected format is a poor match for the image. The two 200KB attempts show that PicZip's target is best effort and that reducing dimensions gives the encoder more room when a strict portal limit matters.
