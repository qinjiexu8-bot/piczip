# Test Record: Reduce PNG Size for an Email Signature

- Test date: 2026-08-01
- PicZip build: local development build based on commit `0066d4f`
- Browser: Chromium
- Operating system: macOS
- Source: generated privacy-safe 800×600 RGBA fixture
- Original file: PNG, 800×600, 1,617,783 bytes
- Settings: target 0KB, maximum width 320, quality 82, PNG or WebP output

| Output | Dimensions | Exact size | Change from source | Outcome |
| --- | --- | ---: | ---: | --- |
| PNG | 320×240 | 130,815 bytes | 91.91% smaller | Pass |
| WebP | 320×240 | 17,220 bytes | 98.94% smaller | Pass with compatibility caveat |

The WebP result was 113,595 bytes smaller than the resized PNG. The test demonstrates right-sizing and format comparison; 320 pixels is an example rather than a universal email-signature standard.
