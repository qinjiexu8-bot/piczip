export const locales = ["en", "zh", "es", "pt-br", "ja"] as const;
export type Locale = typeof locales[number];
export const addedLocales = ["es", "pt-br", "ja"] as const;
export type AddedLocale = typeof addedLocales[number];
export const localeNames: Record<Locale, string> = { en: "English", zh: "简体中文", es: "Español", "pt-br": "Português (Brasil)", ja: "日本語" };
export const languageTags: Record<Locale, string> = { en: "en", zh: "zh-CN", es: "es", "pt-br": "pt-BR", ja: "ja" };
export function isLocale(value: string): value is Locale { return (locales as readonly string[]).includes(value); }
export function isAddedLocale(value: string): value is AddedLocale { return (addedLocales as readonly string[]).includes(value); }
export function interpolate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}
