import type { Size } from "./geometry";
export type MosaicRegion = { x: number; y: number; width: number; height: number };
export type MosaicOptions = { mode: "pixelate" | "solid"; blockSize: number; color: string; regions: MosaicRegion[] };
export const MAX_MOSAIC_REGIONS = 20;
export const defaultMosaic: MosaicOptions = { mode: "pixelate", blockSize: 12, color: "#173c36", regions: [] };
export function validMosaic(value: unknown): value is MosaicOptions {
  if (!value || typeof value !== "object") return false;
  const v = value as MosaicOptions;
  return ["pixelate", "solid"].includes(v.mode) && Number.isInteger(v.blockSize) && v.blockSize >= 4 && v.blockSize <= 100
    && typeof v.color === "string" && /^#[a-f\d]{6}$/i.test(v.color) && Array.isArray(v.regions) && v.regions.length <= MAX_MOSAIC_REGIONS
    && v.regions.every(r => !!r && typeof r === "object" && [r.x, r.y, r.width, r.height].every(Number.isFinite)
      && r.x >= 0 && r.y >= 0 && r.width >= 0.1 && r.height >= 0.1 && r.x + r.width <= 100.000001 && r.y + r.height <= 100.000001);
}
export function mosaicRectangle(size: Size, region: MosaicRegion) {
  const x = Math.min(size.width - 1, Math.floor(size.width * region.x / 100));
  const y = Math.min(size.height - 1, Math.floor(size.height * region.y / 100));
  return { x, y, width: Math.max(1, Math.min(size.width, Math.ceil(size.width * (region.x + region.width) / 100)) - x), height: Math.max(1, Math.min(size.height, Math.ceil(size.height * (region.y + region.height) / 100)) - y) };
}
type Context = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type Surface = HTMLCanvasElement | OffscreenCanvas;
export function drawMosaic(context: Context, image: CanvasImageSource, size: Size, value: MosaicOptions, makeCanvas: (width: number, height: number) => Surface, scale = 1, matte?: string) {
  if (!validMosaic(value) || !value.regions.length) throw new Error("invalid-mosaic");
  for (const region of value.regions) {
    const r = mosaicRectangle(size, region);
    context.save();
    if (value.mode === "solid") { context.fillStyle = value.color; context.fillRect(r.x, r.y, r.width, r.height); }
    else {
      const block = Math.max(1, Math.round(value.blockSize * scale));
      const w = Math.max(1, Math.ceil(r.width / block)), h = Math.max(1, Math.ceil(r.height / block));
      const small = makeCanvas(w, h), sample = small.getContext("2d") as Context | null;
      if (!sample) throw new Error("browser");
      sample.drawImage(image, r.x, r.y, r.width, r.height, 0, 0, w, h);
      // Replace the region, so transparent samples cannot reveal original detail.
      context.clearRect(r.x, r.y, r.width, r.height);
      if (matte) { context.fillStyle = matte; context.fillRect(r.x, r.y, r.width, r.height); }
      context.imageSmoothingEnabled = false;
      context.drawImage(small, 0, 0, w, h, r.x, r.y, r.width, r.height);
      small.width = 1; small.height = 1;
    }
    context.restore();
  }
}
