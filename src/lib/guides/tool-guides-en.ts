import type { ToolGuide } from "./tool-guide-types";
export const toolGuidesEn: ToolGuide[] = [
  {
    tool: "resize", slug: "resize-images-by-pixels-or-percentage",
    title: "How to resize images by pixels or percentage",
    description: "Set image width and height, keep the original proportions, or resize a batch by percentage. See tested examples and learn when resizing differs from compression.",
    label: "Resize by pixels or percentage", readingTime: "6 min read",
    summary: "To resize an image without stretching it, choose Pixels, keep Keep aspect ratio checked, and enter one dimension. Leave the other empty so PicZip calculates it. Choose Percentage when every image should shrink by the same proportion. This guide is for preparing product photos, article images and other assets with a required pixel size.",
    steps: [
      "Open Resize images and select JPG, PNG or WebP files. Check the destination’s requirements: pixel dimensions and a KB limit are different constraints.",
      "Set Resize by to Pixels. For a fixed width, enter Width (px) and clear Height (px). Keep Keep aspect ratio checked. Alternatively, choose Percentage and enter Scale (%).",
      "Choose the output format. Keep original format retains each file’s format; choosing JPG, PNG or WebP gives the batch one output format.",
      "Click Resize images. Check the dimensions displayed below each result, then open the preview to inspect text, edges and proportions.",
      "Download individual results or use Download ZIP when several images are ready. After changing a setting, click Resize images again to update the results."
    ],
    example: {
      title: "Tested example: a 400 × 200 image",
      intro: "We used the same 400 × 200 PNG for three runs. The table shows decoded output dimensions, not just the numbers typed into the controls. The first example is pictured below.",
      headers: ["Settings", "Output", "What changes"],
      rows: [["200 × 200 bounds; ratio locked", "200 × 100 px", "Fits inside the bounds"], ["200 × 200; ratio unlocked", "200 × 200 px", "Stretches the original"], ["50% scale", "200 × 100 px", "Halves both dimensions"]],
      caption: "A 400 × 200 source fits within 200 × 200 bounds as a 200 × 100 result when the aspect ratio is locked.",
      note: "At 50%, width and height each halve. Pixel count falls from 80,000 to 20,000, or one quarter of the original. File size does not necessarily fall to one quarter: image content, format and encoding also affect the number of bytes."
    },
    sections: [
      { id: "pixels-or-percentage", title: "Choose pixels for a target size, percentage for proportional batches", paragraphs: [
        "Pixels are useful when a layout has a known width. If an article needs a 1200-pixel-wide image, set width to 1200 and leave height empty. Portrait and landscape images will keep different heights. If you fill in both dimensions while the ratio is locked, they become maximum bounds: the whole image fits inside them without cropping or adding a border.",
        "Percentage applies the same scale to every file. A batch containing 400 × 200 and 200 × 400 images becomes 200 × 100 and 100 × 200 at 50%. That preserves their relative sizes; it does not make all outputs identical. PicZip accepts values from 1% to 400%, rounds dimensions to whole pixels, and keeps each side at least 1 pixel."
      ] },
      { id: "avoid-distortion", title: "Avoid stretching a photo to meet an exact shape", paragraphs: [
        "A required square is a different problem from a required width. Turning a 2:1 landscape image into a square while keeping every part of the picture requires either empty space or distortion. With the ratio unlocked, PicZip stretches to the exact width and height you enter. Faces, logos and circles may look wrong.",
        "Keep the ratio locked for ordinary photos. If the destination requires an exact square with an undistorted subject, prepare a crop or a padded canvas in an editor first. This resize tool does not offer cropping or canvas padding. Enlarging a small image also does not recover detail that was missing from the source."
      ] },
      { id: "file-size", title: "A smaller width is not a guaranteed KB target", paragraphs: [
        "Use resizing when dimensions need to change. Use compression when the main requirement is a file-size limit, such as 100 KB. You can combine the two: resize, download the result, then select it in the compressor. The tools do not automatically pass files between pages.",
        "For a mixed batch, inspect one landscape image and one portrait image before downloading everything. Check the actual output dimensions and reopen a result at its normal display size. Keep the source files available so a later change can start from the originals rather than an already reduced copy."
      ] },
      { id: "limits", title: "Batch and output limits to check", paragraphs: [
        "Resize up to 50 files per batch. Each source must be at most 50 MB and 40 megapixels, with a 200 MB total selection limit. Each output must fit within 8192 pixels on either side and 16 megapixels overall. A valid input can still produce an invalid output when enlarged too far.",
        "If an output-limit error appears, reduce the width, height or percentage and run again. Animated inputs export as a still image. For PNG output, the quality slider is disabled because the PNG encoder does not use that setting."
      ] }
    ],
    faqs: [
      { question: "Why did entering 200 × 200 produce 200 × 100?", answer: "With Keep aspect ratio checked, both values define a bounding box. Your 2:1 source fits inside it at 200 × 100. Unlocking the ratio forces a square but stretches the image." },
      { question: "Does 50% mean the file will be half as large?", answer: "No. It halves each dimension, leaving roughly one quarter of the pixels. The byte size depends on the image and the selected encoding. Use the compressor for a KB target." },
      { question: "Can I batch resize images to the same width?", answer: "Yes. Choose Pixels, enter a width, leave height empty and keep the ratio locked. Every output gets that width with its own proportional height, provided it stays within the output limits." }
    ],
    cta: "Open Resize images"
  },
  {
    tool: "convert", slug: "convert-jpg-png-webp",
    title: "How to convert JPG, PNG and WebP images",
    description: "Convert image formats in a batch, choose a JPG background and preserve transparency in PNG or WebP. Learn why changing format may make a file larger.",
    label: "Convert JPG, PNG and WebP", readingTime: "6 min read",
    summary: "To convert an image, select it in Convert image formats, choose JPG, PNG or WebP, and click Convert images. Pixel dimensions stay the same. If the source has a transparent background, choose PNG or WebP to keep it; JPG replaces transparent areas with the selected background color. Start with the format accepted by the destination.",
    steps: [
      "Open Convert image formats and select your JPG, PNG or WebP files. You can mix these input formats in one batch.",
      "Set Output format to the format required by your website, form or editor. All selected images will use that output format.",
      "For JPG or WebP, set Quality. For JPG, also choose Background color if any source contains transparent areas. PNG does not use the quality slider.",
      "Click Convert images. Check the preview and the file size shown below it. Inspect transparent edges and small text before deciding the result is suitable.",
      "Download a result or use Download ZIP for several results. If the new format is too large, adjust the settings and run again, or download it and continue in the compressor."
    ],
    example: {
      title: "Tested example: one transparent PNG, three outputs",
      intro: "Our 200 × 100 PNG has a transparent left half and a green right half. We converted it at the default quality of 90, using white for the JPG background. All three outputs retained the source dimensions.",
      headers: ["Output", "Dimensions", "Transparent corner"],
      rows: [["JPG", "200 × 100 px", "Opaque white"], ["PNG", "200 × 100 px", "Still transparent"], ["WebP", "200 × 100 px", "Still transparent"]],
      caption: "Converting the transparent fixture to JPG fills its left half with the selected white background.",
      note: "The test decoded each exported file and checked its corner pixel. JPG returned white with full opacity; PNG and WebP returned zero opacity at the same position. These results demonstrate transparency handling, not a general file-size ranking."
    },
    sections: [
      { id: "choose-format", title: "Choose a format for the next place the image will go", paragraphs: [
        "Use JPG when the destination asks for a JPEG photo and no transparency is needed. Use PNG when retaining transparent edges or crisp graphic content matters more than keeping a photograph small. Try WebP when the receiving website or application accepts it and you want to compare another encoding option.",
        "A form that accepts JPG and PNG may reject WebP even if your browser opens it successfully. Read the upload instructions before converting a large batch. If several destinations have different requirements, keep the originals and export a separate batch for each destination."
      ] },
      { id: "transparent-background", title: "Check transparent edges before exporting JPG", paragraphs: [
        "Transparent pixels need a visible color in a JPG result. PicZip uses the Background color setting, which starts at white. Choose the color of the surface where the image will appear, then inspect the preview. A logo prepared for a white card can look like a white rectangle when placed on a dark page.",
        "Select PNG or WebP when the same image must work over different background colors. Converting a JPG back to PNG does not remove its background: once transparent areas have been filled, those areas are ordinary image pixels. This tool converts formats; it does not cut out subjects or remove backgrounds."
      ] },
      { id: "quality-and-size", title: "Why the converted file can be larger", paragraphs: [
        "Format conversion changes how pixels are stored. It does not promise a smaller file. A photograph already stored efficiently as JPG can become much larger as PNG. A very simple graphic can behave differently. Compare your own output rather than treating one format as the smallest in every situation.",
        "The quality control ranges from 20 to 100 for JPG and WebP. Start at the default 90, then lower it only if the result still looks acceptable for its intended size. An identical quality number is not a promise of identical appearance or byte size across formats or browsers. PNG output ignores the quality setting.",
        "Saving a blurry JPG as PNG cannot restore lost detail. Work from the best available source and avoid repeatedly converting a previously lossy result. If the destination also has a strict KB limit, download the conversion and select that file in the compressor for a separate size-targeting pass."
      ] },
      { id: "batch-checks", title: "Check dimensions, file type and batch limits", paragraphs: [
        "The converter keeps pixel dimensions; it does not resize. If a form asks for 600 × 400 pixels as well as a JPG file, use Resize images first, download that result, and then convert if needed. Resize images also offers a format selector, so you can often complete both changes there.",
        "Select up to 50 files, at most 50 MB and 40 megapixels per source, and 200 MB in total. Outputs are limited to 16 megapixels and 8192 pixels per side. Since conversion keeps dimensions, an oversized source may need resizing first. Supported inputs are JPG, PNG and WebP; animated inputs produce a still image rather than an animated export."
      ] }
    ],
    faqs: [
      { question: "Is renaming .png to .jpg enough?", answer: "No. Renaming a file does not change its encoded contents. Use the converter to generate a real JPG, then download the new file." },
      { question: "Can PNG conversion make a blurry JPG sharp again?", answer: "No. It can save the decoded image in a new format, but it cannot recover detail already lost. Start from a higher-quality original if one is available." },
      { question: "Will a PNG or WebP export remove a white background?", answer: "No. It preserves existing transparency; it does not turn white image pixels into transparent pixels. Background removal requires a separate editing step." }
    ],
    cta: "Open Convert image formats"
  },
  {
    tool: "stitch", slug: "stitch-images-horizontally-vertically",
    title: "How to stitch images vertically or horizontally",
    description: "Combine several pictures into one image. Set the order, shared width or height, spacing and background, with tested examples for portrait and landscape sources.",
    label: "Stitch pictures into one image", readingTime: "6 min read",
    summary: "To join pictures into one image, select 2–20 files, choose Vertical or Horizontal, set a shared edge and click Stitch images. Vertical stitching gives every picture the same width; horizontal stitching gives them the same height. PicZip scales each picture proportionally without cropping, then adds the spacing you choose between neighbors.",
    steps: [
      "Open Stitch images together and select 2–20 JPG, PNG or WebP images. Use the up and down arrows in the file list to arrange their reading order.",
      "Choose Direction. For Vertical, set Shared width (px). For Horizontal, set Shared height (px). Each picture scales to that shared edge while keeping its proportions.",
      "Set Spacing (px) from 0 to 200. Choose a background color, or enable Transparent background with PNG or WebP output.",
      "Choose Output format and click Stitch images. Inspect the first and last pictures, the order and the gaps in the result preview.",
      "Download the combined image. If you change direction, spacing or order, click Stitch images again before downloading the updated result."
    ],
    example: {
      title: "Tested example: one landscape and one portrait image",
      intro: "The first source is 400 × 200 pixels; the second is 200 × 400. We used a 200-pixel shared edge and a 16-pixel gap. The same pair produces different canvas dimensions depending on the direction.",
      headers: ["Direction", "Scaled pictures", "Combined output"],
      rows: [["Vertical; width 200", "200 × 100 + 200 × 400", "200 × 516 px"], ["Horizontal; height 200", "400 × 200 + 100 × 200", "516 × 200 px"]],
      caption: "Vertical stitching: the 100-pixel and 400-pixel heights plus one 16-pixel gap produce a 516-pixel-tall image.",
      note: "For a vertical result, add the scaled heights and the gaps. For a horizontal result, add the scaled widths and the gaps. Two pictures have one gap; five pictures have four. Spacing is inserted between pictures, with no extra outside border."
    },
    sections: [
      { id: "choose-direction", title: "Choose a direction based on how the result will be read", paragraphs: [
        "Vertical stitching suits a sequence that should be read from top to bottom, such as several instruction panels. Horizontal stitching works for a side-by-side comparison with a clear left-to-right order. Check the destination’s preview area: a very wide strip can be displayed too small on a phone, while a long vertical result may be clipped by a social feed.",
        "This tool puts pictures next to one another. It does not detect overlapping screenshot content, remove repeated headers or align a panorama. Crop away unwanted overlap in an editor first if you need a continuous-looking page. It also does not create a multi-row collage grid."
      ] },
      { id: "shared-edge", title: "Use a shared edge that keeps the smallest source readable", paragraphs: [
        "In vertical mode, shared width controls every picture’s width. Each height follows from that picture’s original proportions. In horizontal mode the reverse applies: the shared height is fixed, and widths vary. A portrait image may therefore occupy much more vertical space than a landscape image in the same stack.",
        "Choosing a shared edge larger than a source can enlarge that source. Enlarging small text does not recover detail, so inspect the smallest screenshot before exporting a full sequence. For a comparison, keep similar subjects at comparable scales in the original images when possible; matching image edges alone does not guarantee matching subject sizes."
      ] },
      { id: "spacing-and-background", title: "Choose spacing and background together", paragraphs: [
        "Set spacing to 0 for directly touching edges. A modest gap separates independent panels and makes their boundaries easier to see. The background color appears in those gaps and behind transparent parts of the sources. It does not add a margin around the outside of the finished image.",
        "For transparent gaps, choose PNG or WebP and enable Transparent background. JPG cannot store transparency, so it uses the selected color instead. If you need to add a frame, labels or annotations around the combined result, download it and finish those additions in an editor."
      ] },
      { id: "long-images", title: "Keep a long image within the output limits", paragraphs: [
        "The finished image must be no more than 8192 pixels on either side and no more than 16 megapixels in total. A batch of individually acceptable pictures can exceed those limits when combined. Reduce the shared width or height, reduce spacing, or split a long sequence into two outputs.",
        "You can select 2–20 pictures. Each source is limited to 50 MB and 40 megapixels, and all selected files together must fit within 200 MB. Animated inputs become still images. If the final image also needs to meet a KB limit, download it and select it in the compressor; stitching itself has no target-KB setting."
      ] }
    ],
    faqs: [
      { question: "Can I combine pictures with different dimensions?", answer: "Yes. Vertical stitching makes their widths equal; horizontal stitching makes their heights equal. Their other dimensions change proportionally, without cropping." },
      { question: "Why is the combined image taller than the originals?", answer: "PicZip adds the heights after scaling each picture to the shared width, then adds the gaps. A narrow original may be enlarged. Check the shared width and the calculated example above." },
      { question: "Can I change the order after seeing the preview?", answer: "Yes. Use the arrows beside each file, then click Stitch images again. Reordering changes the settings for the next run; it does not silently rewrite a result already generated." }
    ],
    cta: "Open Stitch images together"
  }
];
