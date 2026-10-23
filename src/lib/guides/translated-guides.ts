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
export const translatedGuides = { es, "pt-br": pt, ja } satisfies Record<AddedLocale, Record<GuideSlug, TranslatedGuide>>;
export function isGuideSlug(slug: string): slug is GuideSlug { return (guideSlugs as readonly string[]).includes(slug); }
export function getTranslatedGuide(locale: AddedLocale, slug: GuideSlug): TranslatedGuide { return translatedGuides[locale][slug]; }
