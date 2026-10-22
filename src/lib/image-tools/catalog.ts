import type { ToolKind } from "./types";
export const toolCatalog: Record<ToolKind, { path: string; en: [string, string]; zh: [string, string] }> = {
  resize: { path: "/resize-image", en: ["Resize images", "The right dimensions, every time. Resize by pixels or percentage, one image or a whole batch."], zh: ["图片尺寸调整", "按像素或百分比调整尺寸，一张图片或一整批，都能轻松处理。"] },
  convert: { path: "/convert-image", en: ["Convert image formats", "Convert between JPG, PNG and WebP. Set image quality, choose a background and download your batch."], zh: ["图片格式转换", "在 JPG、PNG 和 WebP 之间转换，可调整画质、选择背景，批量导出图片。"] },
  stitch: { path: "/stitch-images", en: ["Stitch images together", "Turn a few images into one story. Arrange, space and join them horizontally or vertically."], zh: ["图片拼接", "把几张图片，连成一个故事。自由排序、设置间距，横向或纵向拼成一张。"] },
};
