import { validateOutput, type Size } from "./geometry.ts";
export const cropRatios = ["none", "free", "original", "1:1", "4:3", "3:4", "16:9", "9:16"] as const;
export type CropOptions = { ratio: typeof cropRatios[number]; x: number; y: number; width: number; height: number; rotation: 0 | 90 | 180 | 270; flipX: boolean; flipY: boolean };
export const defaultCrop: CropOptions = { ratio: "none", x: 0, y: 0, width: 100, height: 100, rotation: 0, flipX: false, flipY: false };
export function validCrop(value: unknown): value is CropOptions {
  if (!value || typeof value !== "object") return false;
  const c = value as CropOptions;
  return cropRatios.includes(c.ratio) && [c.x,c.y,c.width,c.height].every(Number.isFinite) && c.x >= 0 && c.y >= 0 && c.width >= 1 && c.height >= 1 && c.x+c.width <= 100.00001 && c.y+c.height <= 100.00001 && [0,90,180,270].includes(c.rotation) && typeof c.flipX === "boolean" && typeof c.flipY === "boolean";
}
/** Percentages describe bounds in the original image; a fixed ratio fits centrally inside them. */
export function cropRectangle(input: Size, c: CropOptions) {
  if (!validCrop(c) || input.width <= 0 || input.height <= 0) throw new Error("invalid-crop");
  let x = c.ratio === "none" ? 0 : input.width * c.x / 100;
  let y = c.ratio === "none" ? 0 : input.height * c.y / 100;
  let width = c.ratio === "none" ? input.width : input.width * c.width / 100;
  let height = c.ratio === "none" ? input.height : input.height * c.height / 100;
  if (c.ratio !== "none" && c.ratio !== "free") {
    const parts = c.ratio.split(":").map(Number);
    const ratio = c.ratio === "original" ? input.width / input.height : parts[0] / parts[1];
    const w = Math.min(width, height * ratio), h = w / ratio;
    x += (width-w)/2; y += (height-h)/2; width=w; height=h;
  }
  const left = Math.min(input.width-1, Math.round(x)), top = Math.min(input.height-1, Math.round(y));
  return { x: left, y: top, width: Math.max(1, Math.min(input.width-left, Math.round(width))), height: Math.max(1, Math.min(input.height-top, Math.round(height))) };
}
export function cropOutput(input: Size, c: CropOptions) {
  const rect = cropRectangle(input, c);
  return validateOutput(c.rotation % 180 ? { width: rect.height, height: rect.width } : rect);
}
/** Crop first, rotate clockwise, then flip along the output's axes. */
export function drawCrop(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, image: CanvasImageSource, input: Size, c: CropOptions) {
  const rect = cropRectangle(input, c);
  const size = c.rotation % 180 ? { width: rect.height, height: rect.width } : rect;
  context.save();
  context.translate(size.width/2, size.height/2);
  context.scale(c.flipX ? -1 : 1, c.flipY ? -1 : 1);
  context.rotate(c.rotation * Math.PI/180);
  context.drawImage(image, rect.x, rect.y, rect.width, rect.height, -rect.width/2, -rect.height/2, rect.width, rect.height);
  context.restore();
}
