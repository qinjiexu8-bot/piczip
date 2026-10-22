import type { ToolKind } from "./types";
export const toolCatalog: Record<ToolKind, { path: string; en: [string, string]; zh: [string, string] }> = {
  resize: { path: "/resize-image", en: ["Resize images", "The right dimensions, every time. Resize by pixels or percentage, one image or a whole batch."], zh: ["图片尺寸调整", "按像素或百分比调整尺寸，一张图片或一整批，都能轻松处理。"] },
  convert: { path: "/convert-image", en: ["Convert image formats", "JPG, PNG or WebP. Choose the format you need and keep every image on your device."], zh: ["图片格式转换", "在 JPG、PNG 和 WebP 之间自由转换，图片始终留在你的设备上。"] },
  stitch: { path: "/stitch-images", en: ["Stitch images together", "Turn a few images into one story. Arrange, space and join them horizontally or vertically."], zh: ["图片拼接", "把几张图片，连成一个故事。自由排序、设置间距，横向或纵向拼成一张。"] },
};
