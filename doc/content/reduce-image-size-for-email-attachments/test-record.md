# Test Record: Reduce Image Size for Email Attachments

## Environment

- Test date: 2026-07-30
- Page: `http://localhost:3000/batch-image-compressor`
- Files: Three PicZip-owned, privacy-safe images
- Combined original size: 3,910,559 bytes

## Inputs

| File | Format | Size |
| --- | --- | ---: |
| Coastal town fixture | PNG | 2,976,317 bytes |
| PicZip social preview | JPG | 483,929 bytes |
| Homepage mockup | PNG | 450,313 bytes |

## Settings

- Target: 300KB per image
- Output: Auto
- Quality: 82
- Maximum width: 1600px

## Outputs

| File | Format | Dimensions | Size |
| --- | --- | --- | ---: |
| Coastal town fixture | WebP | 1536×1024 | 268,434 bytes |
| PicZip social preview | WebP | 1376×768 | 30,022 bytes |
| Homepage mockup | WebP | 1440×1200 | 82,578 bytes |

- Combined output size: 381,034 bytes
- Saved image data: 3,529,525 bytes
- Reduction: about 90.26%
- ZIP size: 381,092 bytes
- ZIP overhead versus outputs: 58 bytes

## Conclusion

The batch became small enough for a lightweight email, but the ZIP did not materially compress the already-compressed WebP files. ZIP is useful for packaging. Individual files remain better for previews and selective downloading.
