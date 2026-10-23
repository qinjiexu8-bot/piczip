/// <reference lib="webworker" />
import { resizeDimensions, stitchLayout, validateOutput } from "@/lib/image-tools/geometry";
import type { Format, ToolFile, ToolOptions, ToolResponse } from "@/lib/image-tools/types";
import { cropOutput, defaultCrop, drawCrop } from "@/lib/image-tools/crop";
import { drawWatermark, validWatermark } from "@/lib/image-tools/watermark";
const ctx = self as unknown as DedicatedWorkerGlobalScope;
const send = (message: ToolResponse) => ctx.postMessage(message);
async function decode(file: File) {
  if (file.size > 50 * 1024 * 1024) throw new Error("input-limit");
  if (!/\.(jpe?g|png|webp)$/i.test(file.name)) throw new Error("unsupported");
  let image: ImageBitmap;
  try { image = await createImageBitmap(file); } catch { throw new Error("decode"); }
  if (image.width * image.height > 40_000_000) { image.close(); throw new Error("input-limit"); }
  return image;
}
function canvasFor(width: number, height: number, options: ToolOptions, format: Format) {
  validateOutput({ width, height });
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("browser");
  if (format === "jpeg" || (options.tool === "stitch" && !options.transparent)) {
    context.fillStyle = options.background;
    context.fillRect(0, 0, width, height);
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  return { canvas, context };
}
async function encode(canvas: OffscreenCanvas, format: Format, quality: number) {
  const mime = `image/${format}`;
  const blob = await canvas.convertToBlob({ type: mime, quality: quality / 100 });
  // Safari can silently fall back to PNG when WebP encoding is unavailable.
  if (blob.type === mime) return blob;
  if (format === "webp") {
    const { encode } = await import("@jsquash/webp");
    const data = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height);
    return new Blob([await encode(data, { quality })], { type: mime });
  }
  throw new Error("browser");
}
function formatFor(file: File, options: ToolOptions): Format {
  return options.format !== "original" ? options.format : /\.png$/i.test(file.name) ? "png" : /\.webp$/i.test(file.name) ? "webp" : "jpeg";
}
const outputName = (name: string, tool: string, format: Format) => `${name.replace(/\.[^.]+$/, "")}-${tool}.${format === "jpeg" ? "jpg" : format}`;
ctx.onmessage = async (event: MessageEvent<{ files: ToolFile[]; options: ToolOptions }>) => {
  const { files, options } = event.data;
  let logo: ImageBitmap | undefined;
  try {
    if (options.tool === "watermark") {
      if (!validWatermark(options.watermark)) throw new Error("invalid-watermark");
      if (options.watermark.kind === "logo") logo = await createImageBitmap(await (await fetch(options.watermark.logo)).blob());
    }
    if (options.tool === "stitch") {
      const sizes = [];
      for (const { file } of files) {
        try {
          const image = await decode(file);
          sizes.push({ width: image.width, height: image.height });
          image.close();
        } catch (error) {
          send({ type: "error", name: file.name, error: error instanceof Error ? error.message : "failed" });
          return;
        }
      }
      const layout = stitchLayout(sizes, options.direction, options.edge, options.gap);
      const format = options.format === "original" ? "png" : options.format;
      const { canvas, context } = canvasFor(layout.width, layout.height, options, format);
      for (let i = 0; i < files.length; i++) {
        send({ type: "progress", current: i + 1, total: files.length });
        const image = await decode(files[i].file);
        const box = layout.items[i];
        try { context.drawImage(image, box.x, box.y, box.width, box.height); } finally { image.close(); }
      }
      const blob = await encode(canvas, format, options.quality);
      send({ type: "result", result: { id: "stitched", name: outputName("piczip", "stitched", format), blob, width: layout.width, height: layout.height } });
    } else {
      for (let i = 0; i < files.length; i++) {
        const { id, file } = files[i];
        send({ type: "progress", current: i + 1, total: files.length });
        try {
          const image = await decode(file);
          try {
            const size = options.tool === "resize" ? resizeDimensions(image, options.resize) : options.tool === "crop" ? cropOutput(image, options.crop ?? defaultCrop) : validateOutput(image);
            const format = formatFor(file, options);
            const { canvas, context } = canvasFor(size.width, size.height, options, format);
            if (options.tool === "crop") drawCrop(context, image, image, options.crop ?? defaultCrop);
            else context.drawImage(image, 0, 0, size.width, size.height);
            if (options.tool === "watermark") drawWatermark(context, size.width, size.height, options.watermark!, logo);
            const blob = await encode(canvas, format, options.quality);
            send({ type: "result", result: { id, name: outputName(file.name, options.tool, format), blob, ...{ width: size.width, height: size.height } } });
          } finally { image.close(); }
        } catch (error) { send({ type: "error", name: file.name, error: error instanceof Error ? error.message : "failed" }); }
      }
    }
  } catch (error) { send({ type: "error", name: "", error: error instanceof Error ? error.message : "failed" }); }
  finally { logo?.close(); send({ type: "done" }); }
};
