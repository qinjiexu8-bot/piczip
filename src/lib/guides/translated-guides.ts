import { isFeatureGuide, featureForGuide, type FeatureGuideSlug } from "../next-features/catalog";
import { featureGuide } from "../next-features/guides";
import { canvasGuide, type CanvasGuideSlug } from "./canvas-guides";
import { watermarkGuideSlug, watermarkGuides, watermarkGuideDescriptions } from "./watermark-guide";
import { watermarkMessages } from "../image-tools/watermark-messages";
import { cropGuides, cropGuideSlug } from "./crop-guide";
import es from "./translations/es.json";
import pt from "./translations/pt-br.json";
import ja from "./translations/ja.json";
import type { AddedLocale } from "@/lib/i18n/config";
import { guideSlugs } from "./guide-slugs";

export type GuideSlug = typeof guideSlugs[number];
export type TranslatedGuide = {
  title: string;
  description: string;
  summary: string;
  steps: string[];
  table: { headers: string[]; rows: string[][] };
  sections: string[][];
  faqs: string[][];
  caption: string;
};
export const translatedGuides = { es, "pt-br": pt, ja } satisfies Record<AddedLocale, Record<Exclude<GuideSlug, typeof cropGuideSlug | typeof watermarkGuideSlug | CanvasGuideSlug | FeatureGuideSlug>, TranslatedGuide>>;
export function isGuideSlug(slug: string): slug is GuideSlug { return (guideSlugs as readonly string[]).includes(slug); }
export function getTranslatedGuide(locale: AddedLocale, slug: GuideSlug): TranslatedGuide {
 if (isFeatureGuide(slug)) return featureGuide(locale, featureForGuide(slug)!);
 if (slug === "add-image-padding-and-expand-canvas" || slug === "pixelate-and-redact-images") return canvasGuide(locale, slug === "add-image-padding-and-expand-canvas" ? "padding" : "mosaic");
 if (slug === watermarkGuideSlug) {
 const t=watermarkGuides[locale],w=watermarkMessages[locale];
 return {title:w.guide,description:watermarkGuideDescriptions[locale],summary:watermarkGuideDescriptions[locale],steps:t.steps,sections:t.sections,faqs:t.faqs,table:{headers:[],rows:[]},caption:""};
} if (slug === cropGuideSlug) {
  const t = cropGuides[locale];
  return { title: t.title, description: t.description, summary: t.description, steps: t.steps, sections: t.sections, faqs: t.faqs, table: { headers: [], rows: [] }, caption: "" };
} return translatedGuides[locale][slug]; }
