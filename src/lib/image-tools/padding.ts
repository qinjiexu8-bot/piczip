import { validateOutput, type Size } from "./geometry.ts";

export const canvasRatios = ["1:1", "4:3", "3:4", "16:9", "9:16"] as const;
export type PaddingOptions = {
  mode: "border" | "canvas" | "ratio";
  top: number; right: number; bottom: number; left: number;
  width: number; height: number;
  ratio: typeof canvasRatios[number];
  position: number;
};
export const defaultPadding: PaddingOptions = { mode: "border", top: 32, right: 32, bottom: 32, left: 32, width: 1200, height: 1200, ratio: "1:1", position: 4 };
export function validPadding(value: unknown): value is PaddingOptions {
  if (!value || typeof value !== "object") return false;
  const v = value as PaddingOptions;
  return ["border", "canvas", "ratio"].includes(v.mode)
    && [v.top, v.right, v.bottom, v.left].every(n => Number.isInteger(n) && n >= 0 && n <= 4096)
    && [v.width, v.height].every(n => Number.isInteger(n) && n >= 1 && n <= 8192)
    && canvasRatios.includes(v.ratio) && Number.isInteger(v.position) && v.position >= 0 && v.position <= 8;
}
export function paddingLayout(input: Size, value: PaddingOptions) {
  if (!validPadding(value)) throw new Error("invalid-padding");
  let width = input.width, height = input.height, imageWidth = width, imageHeight = height;
  if (value.mode === "border") {
    return { ...validateOutput({ width: width + value.left + value.right, height: height + value.top + value.bottom }), x: value.left, y: value.top, imageWidth, imageHeight };
  }
  if (value.mode === "canvas") {
    width = value.width; height = value.height;
    const scale = Math.min(1, width / input.width, height / input.height);
    imageWidth = Math.max(1, Math.round(input.width * scale)); imageHeight = Math.max(1, Math.round(input.height * scale));
  } else {
    const [a, b] = value.ratio.split(":").map(Number);
    if (width / height > a / b) height = Math.ceil(width * b / a);
    else width = Math.ceil(height * a / b);
  }
  validateOutput({ width, height });
  return { width, height, imageWidth, imageHeight, x: Math.round((width - imageWidth) * (value.position % 3) / 2), y: Math.round((height - imageHeight) * Math.floor(value.position / 3) / 2) };
}
