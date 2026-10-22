export type Size = { width: number; height: number };
export type ResizeOptions = { mode: "pixels" | "percent"; width: number; height: number; percent: number; lock: boolean };
export const MAX_OUTPUT_PIXELS = 16_000_000;
export function validateOutput(size: Size): Size {
  if (![size.width, size.height].every(n => Number.isInteger(n) && n > 0 && n <= 8192) || size.width * size.height > MAX_OUTPUT_PIXELS) throw new Error("output-limit");
  return size;
}
export function resizeDimensions(input: Size, options: ResizeOptions): Size {
  let { width, height } = options;
  if (options.mode === "percent") {
    if (!Number.isFinite(options.percent) || options.percent < 1 || options.percent > 400) throw new Error("invalid-size");
    width = Math.max(1, Math.round(input.width * options.percent / 100));
    height = Math.max(1, Math.round(input.height * options.percent / 100));
  } else {
    if (![width, height].every(n => Number.isInteger(n) && n >= 0) || (!width && !height)) throw new Error("invalid-size");
    if (options.lock) {
      const ratio = Math.min(width ? width / input.width : Infinity, height ? height / input.height : Infinity);
      width = Math.max(1, Math.round(input.width * ratio));
      height = Math.max(1, Math.round(input.height * ratio));
    } else if (!width || !height) throw new Error("invalid-size");
  }
  return validateOutput({ width, height });
}
export function stitchLayout(sizes: Size[], direction: "vertical" | "horizontal", edge: number, gap: number) {
  if (sizes.length < 2 || sizes.length > 20 || !Number.isInteger(edge) || edge < 1 || !Number.isInteger(gap) || gap < 0 || gap > 200) throw new Error("invalid-layout");
  let cursor = 0;
  const items = sizes.map(size => {
    const vertical = direction === "vertical";
    const width = vertical ? edge : Math.max(1, Math.round(size.width * edge / size.height));
    const height = vertical ? Math.max(1, Math.round(size.height * edge / size.width)) : edge;
    const item = { width, height, x: vertical ? 0 : cursor, y: vertical ? cursor : 0 };
    cursor += (vertical ? height : width) + gap;
    return item;
  });
  return { ...validateOutput({ width: direction === "vertical" ? edge : cursor - gap, height: direction === "vertical" ? cursor - gap : edge }), items };
}
