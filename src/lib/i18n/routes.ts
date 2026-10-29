import { guideSlugs } from "@/lib/guides/guide-slugs";
import { addedLocales, isLocale, type Locale } from "./config";
/** Pages available in Spanish, Brazilian Portuguese and Japanese. Chinese availability is listed separately below. */
export const multilingualRoutes = ["/", "/watermark-image", "/resize-image", "/crop-image", "/convert-image", "/stitch-images", "/faq", "/about", "/tools", "/guide", ...guideSlugs.map(slug => `/guides/${slug}`)] as const;


export const localizedEnglishRoutes = [
  "/",
  "/tools",
  "/watermark-image",
  "/resize-image", "/crop-image",
  "/convert-image",
  "/stitch-images",
  "/compress-jpg",
  "/compress-png",
  "/compress-webp",
  "/compress-image-to-100kb",
  "/compress-image-to-200kb",
  "/compress-image-without-upload",
  "/local-image-compressor",
  "/batch-image-compressor",
  "/guide",
  "/guides/batch-watermark-and-rename-images",
  "/guides/crop-rotate-flip-images",
  "/guides/resize-images-by-pixels-or-percentage",
  "/guides/convert-jpg-png-webp",
  "/guides/stitch-images-horizontally-vertically",
  "/faq",
  "/privacy",
  "/terms",
  "/about",
  "/guides/compress-image-to-100kb-without-uploading",
] as const;

export const englishOnlyRoutes = [
  "/guides/compress-image-to-200kb-for-online-forms",
  "/guides/reduce-image-size-for-email-attachments",
  "/guides/jpg-vs-png-vs-webp-file-size",
  "/guides/compress-screenshot-without-blurry-text",
  "/guides/reduce-image-size-without-changing-dimensions",
  "/guides/why-compressed-image-is-still-too-large",
  "/guides/compress-png-without-losing-transparency",
  "/guides/reduce-png-size-for-email-signature",
] as const;

export const englishRoutes = [...localizedEnglishRoutes, ...englishOnlyRoutes] as const;

export const localizedRoutes = [
  ...localizedEnglishRoutes.map((route) => toLocalizedPath(route)),
  ...addedLocales.flatMap(locale => multilingualRoutes.map(route => localePath(route, locale))),
];

export function hasLocalizedVersion(pathname: string) {
  const normalized = stripLocale(pathname);
  return (localizedEnglishRoutes as readonly string[]).includes(normalized);
}

export function isChinesePath(pathname: string) {
  return pathname === "/zh" || pathname.startsWith("/zh/");
}

export function stripLocale(pathname: string) {
  const segment = pathname.split("/")[1];
  if (isLocale(segment) && segment !== "en") return pathname.slice(segment.length + 1) || "/";
  return pathname || "/";
}

export function toLocalizedPath(pathname: string) {
  const normalized = stripLocale(pathname);
  return normalized === "/" ? "/zh" : `/zh${normalized}`;
}

export function toEnglishPath(pathname: string) {
  return stripLocale(pathname);
}

export function alternateLanguagePath(pathname: string) {
  if (isChinesePath(pathname)) return toEnglishPath(pathname);
  return hasLocalizedVersion(pathname) ? toLocalizedPath(pathname) : "/zh/guide";
}

export function localizedHref(pathname: string, englishHref: string) {
  const locale = getLocale(pathname);
  return hasLocalePage(englishHref, locale) ? localePath(englishHref, locale) : englishHref;
}

export function getLocale(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : "en";
}

export function hasLocalePage(pathname: string, locale: Locale) {
  const path = stripLocale(pathname);
  if (locale === "en") return (englishRoutes as readonly string[]).includes(path);
  if (locale === "zh") return hasLocalizedVersion(path);
  return (multilingualRoutes as readonly string[]).includes(path);
}

export function localePath(pathname: string, locale: Locale) {
  const path = stripLocale(pathname);
  return locale === "en" ? path : path === "/" ? `/${locale}` : `/${locale}${path}`;
}
