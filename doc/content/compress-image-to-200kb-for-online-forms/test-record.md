# Test Record: Compress an Image to 200KB for Online Forms

## Environment

- Test date: 2026-07-30
- Page: `http://localhost:3000/compress-image-to-200kb`
- Source: PicZip privacy-safe coastal test fixture
- Source format: PNG
- Source dimensions: 1536×1024
- Source size: 2,976,317 bytes

## Shared settings

- Target: 200KB (204,800 bytes)
- Output: Auto
- Quality: 82

## Run A: Preserve dimensions

- Maximum width: 0 (disabled)
- Output: WebP
- Output dimensions: 1536×1024
- Output size: 196,308 bytes
- Headroom below target: 8,492 bytes
- Reduction: 2,780,009 bytes, about 93.40%

## Run B: Moderate width reduction

- Maximum width: 1200px
- Output: WebP
- Output dimensions: 1200×800
- Output size: 157,426 bytes
- Headroom below target: 47,374 bytes
- Reduction: 2,818,891 bytes, about 94.71%

## Conclusion

Both outputs met the target. Run A retained more pixels and is the safer choice for scans or minimum-dimension rules. Run B created more byte headroom and is appropriate for ordinary form photos when 1200px satisfies the destination. Neither setting is a universal recommendation.
