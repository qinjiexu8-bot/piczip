import { watermarkGuideSlug, watermarkGuides } from "./watermark-guide";
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
export const translatedGuides = { es, "pt-br": pt, ja } satisfies Record<AddedLocale, Record<Exclude<GuideSlug, typeof cropGuideSlug | typeof watermarkGuideSlug>, TranslatedGuide>>;
export function isGuideSlug(slug: string): slug is GuideSlug { return (guideSlugs as readonly string[]).includes(slug); }
export function getTranslatedGuide(locale: AddedLocale, slug: GuideSlug): TranslatedGuide { if (slug === watermarkGuideSlug) {
 const t=watermarkGuides[locale],w=watermarkMessages[locale];
 return {title:w.guide,description:w.description,summary:w.description,steps:t.steps,sections:t.sections,faqs:t.faqs,table:{headers:[],rows:[]},caption:""};
} if (slug === cropGuideSlug) {
  const t = cropGuides[locale];
  return { title: t.title, description: t.description, summary: t.description, steps: t.steps, sections: t.sections, faqs: t.faqs, table: { headers: [], rows: [] }, caption: "" };
} return translatedGuides[locale][slug]; }
