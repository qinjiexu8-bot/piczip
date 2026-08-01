# How to Compress PNG Without Losing Transparency

Publication route: `/guides/compress-png-without-losing-transparency`

The article answers the transparency question immediately and defines fully transparent, partially transparent, and opaque pixels. It uses an 800×600 RGBA fixture and records exact alpha counts before and after PicZip encoding.

The PNG result retained every tested alpha category but grew from 1,617,783 to 1,720,597 bytes. The article tells readers to keep the original when re-encoding grows the file. A WebP comparison reached 96,120 bytes and retained alpha counts, with an explicit warning that color data is lossy and destination support must be checked.

The public route contains the complete copy, two PicZip screenshots, numbered steps, limitations, FAQ, testing note, About link, correction contact, and CTA to `/compress-png`.
