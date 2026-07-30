export const localizedEnglishRoutes = [
  "/",
  "/compress-jpg",
  "/compress-png",
  "/compress-webp",
  "/compress-image-to-100kb",
  "/compress-image-to-200kb",
  "/compress-image-without-upload",
  "/local-image-compressor",
  "/batch-image-compressor",
  "/guide",
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
] as const;

export const englishRoutes = [...localizedEnglishRoutes, ...englishOnlyRoutes] as const;

export const localizedRoutes = localizedEnglishRoutes.map((route) => toLocalizedPath(route));

export function hasLocalizedVersion(pathname: string) {
  const normalized = stripLocale(pathname);
  return (localizedEnglishRoutes as readonly string[]).includes(normalized);
}

export function isChinesePath(pathname: string) {
  return pathname === "/zh" || pathname.startsWith("/zh/");
}

export function stripLocale(pathname: string) {
  if (pathname === "/zh") return "/";
  if (pathname.startsWith("/zh/")) return pathname.slice(3) || "/";
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
  return isChinesePath(pathname) ? toLocalizedPath(englishHref) : englishHref;
}
