# Test Record: Compress PNG Without Losing Transparency

- Test date: 2026-08-01
- PicZip build: local development build based on commit `0066d4f`
- Browser: Chromium
- Operating system: macOS
- Source: generated privacy-safe 800×600 RGBA fixture with a noisy color field and feathered circular alpha edge
- Original file: PNG, 800×600, 1,617,783 bytes
- Settings: target 0KB, maximum width 0, PNG or WebP output, quality 82

| Output | Dimensions | Exact size | Transparent | Partial alpha | Opaque | Outcome |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Original PNG | 800×600 | 1,617,783 bytes | 251,243 | 115,172 | 113,585 | Source |
| PNG | 800×600 | 1,720,597 bytes | 251,243 | 115,172 | 113,585 | Alpha pass; size failed |
| WebP | 800×600 | 96,120 bytes | 251,243 | 115,172 | 113,585 | Alpha pass; lossy color |

The PNG output was 102,814 bytes, or about 6.36%, larger than the source. WebP preserved the tested alpha values but used lossy color encoding at quality 82. These results apply to this fixture and these settings.
