import guides from "./canvas-guides.json";
import messages from "../image-tools/canvas-messages.json";
import type { Locale } from "../i18n/config";
export const canvasGuideSlugs = { padding: "add-image-padding-and-expand-canvas", mosaic: "pixelate-and-redact-images" } as const;
export type CanvasGuideKind = keyof typeof canvasGuideSlugs;
export type CanvasGuideSlug = typeof canvasGuideSlugs[CanvasGuideKind];
export const canvasToolPaths = { padding: "/pad-image", mosaic: "/mosaic-image" } as const;
export function canvasGuidePath(kind: CanvasGuideKind) { return `/guides/${canvasGuideSlugs[kind]}` as const; }
export function canvasGuide(locale: Locale, kind: CanvasGuideKind) {
  const copy = messages[locale][kind];
  return { ...guides[locale][kind], title: copy.guide, description: copy.guideDescription, summary: copy.guideDescription, table: { headers: [], rows: [] }, caption: "" };
}
