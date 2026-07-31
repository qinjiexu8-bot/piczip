# Test Record: Reduce Image Size Without Changing Dimensions

- Test date: 2026-07-30
- Article review date: 2026-07-31
- PicZip build: local production build based on commit `83e551b`
- Browser: Chromium
- Operating system: macOS
- Source image: PicZip coastal test fixture
- Original file: PNG, 1536×1024, 2,976,317 bytes
- Settings: target 0KB, quality 82, maximum width 0

| Output | Dimensions | Exact size | Change from source | Outcome |
| --- | --- | ---: | ---: | --- |
| JPG | 1536×1024 | 287,599 bytes | 90.34% smaller | Pass |
| WebP | 1536×1024 | 268,434 bytes | 90.98% smaller | Pass |
| PNG | 1536×1024 | 3,449,964 bytes | 15.91% larger | Failed reduction |

Both successful results preserved the source dimensions exactly. They did not preserve every original pixel: JPG and WebP use lossy encoding at the tested setting. Re-encoding the photograph as PNG increased its size by 473,647 bytes, which is why the article recommends changing format before changing dimensions when transparency is not required.
