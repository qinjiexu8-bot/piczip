Synthetic PicZip fixtures, generated locally with four solid-color quadrants (320 × 200 pixels): red/green on top and blue/yellow below. `sips` encoded the source PNG as HEIC.

- `quadrants.heic`: no rotation.
- `quadrants-clockwise.heic`: identical encoded pixels, with the existing HEIF `irot` property changed from 0 to 3 (90° clockwise). Expected displayed dimensions: 200 × 320; expected top-left quadrant: blue.

The second fixture exercises container orientation rather than pre-rotated pixels. These images contain no external photos or personal data.
