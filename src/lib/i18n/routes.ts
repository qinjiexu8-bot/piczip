export const englishRoutes = [
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
] as const;

export const localizedRoutes = englishRoutes.map((route) => toLocalizedPath(route));

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
  return isChinesePath(pathname) ? toEnglishPath(pathname) : toLocalizedPath(pathname);
}

export function localizedHref(pathname: string, englishHref: string) {
  return isChinesePath(pathname) ? toLocalizedPath(englishHref) : englishHref;
}
