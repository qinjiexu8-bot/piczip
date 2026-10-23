import { locales, languageTags } from "@/lib/i18n/config";
import { hasLocalePage, localePath, stripLocale } from "@/lib/i18n/routes";
import { absoluteUrl } from "./site";

/** HTML metadata and XML sitemap use the same available language cluster. */
export function languageAlternates(path: string, includeChinese = true): Record<string, string> {
  const available = locales.filter(locale => hasLocalePage(path, locale) && (includeChinese || locale !== "zh"));
  return {
    ...Object.fromEntries(available.map(locale => [locale === "zh" ? "zh" : languageTags[locale], absoluteUrl(localePath(path, locale))])),
    "x-default": absoluteUrl(stripLocale(path)),
  };
}
