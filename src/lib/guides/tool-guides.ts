import { toolGuidesEn } from "./tool-guides-en";
import { toolGuidesZh } from "./tool-guides-zh";
import type { GuideLocale } from "./tool-guide-types";
import type { ToolKind } from "@/lib/image-tools/types";
export function getToolGuides(locale: GuideLocale) {
  return locale === "zh" ? toolGuidesZh : toolGuidesEn;
}
export function getToolGuide(tool: ToolKind, locale: GuideLocale) {
  const guide = getToolGuides(locale).find(guide => guide.tool === tool);
  if (!guide) throw new Error(`Missing ${locale} guide for ${tool}`);
  return guide;
}
export function toolGuidePath(slug: string, locale: GuideLocale) {
  return `${locale === "zh" ? "/zh" : ""}/guides/${slug}`;
}
