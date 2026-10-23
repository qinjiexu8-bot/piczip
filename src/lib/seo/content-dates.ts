import { stripLocale } from "@/lib/i18n/routes";

/**
 * Real per-route content dates, used as `<lastmod>` in the sitemap.
 *
 * Why this file exists: the sitemap previously used `new Date()`, so every build
 * told search engines that all routes had just changed. That is never true, and
 * a `<lastmod>` that always says "now" is a signal crawlers learn to ignore.
 *
 * Rule: only routes with a verifiable date get a `<lastmod>`; everything else
 * omits the field (which is valid and means "unknown"). When you revise a guide,
 * update its `verifiedAt` on the article page **and** the date here so the two
 * stay in sync.
 */
// These guides were first published on 2026-10-23 (Git 29fd731 / 6fb93fa).
export const newGuideDates = {
  "/guides/crop-rotate-flip-images": { published: "2026-10-23", modified: "2026-10-23" },
  "/guides/batch-watermark-and-rename-images": { published: "2026-10-23", modified: "2026-10-23" },
} as const;

export const guideLastModified: Record<string, string> = {
  ...Object.fromEntries(Object.entries(newGuideDates).map(([path, dates]) => [path, dates.modified])),
  "/guides/resize-images-by-pixels-or-percentage": "2026-10-22",
  "/guides/convert-jpg-png-webp": "2026-10-22",
  "/guides/stitch-images-horizontally-vertically": "2026-10-22",
  "/guides/compress-image-to-100kb-without-uploading": "2026-07-29",
  "/guides/compress-image-to-200kb-for-online-forms": "2026-07-30",
  "/guides/reduce-image-size-for-email-attachments": "2026-07-30",
  "/guides/jpg-vs-png-vs-webp-file-size": "2026-07-30",
  "/guides/compress-screenshot-without-blurry-text": "2026-07-30",
  "/guides/reduce-image-size-without-changing-dimensions": "2026-07-31",
  "/guides/why-compressed-image-is-still-too-large": "2026-07-31",
  "/guides/compress-png-without-losing-transparency": "2026-08-01",
  "/guides/reduce-png-size-for-email-signature": "2026-08-01",
};

/**
 * The `/guide` hub lists every guide, so its rendered content genuinely changes
 * whenever a guide is added or updated. Derive it instead of hard-coding, so it
 * cannot drift.
 */
export const latestGuideDate = Object.values(guideLastModified).reduce(
  (latest, date) => (date > latest ? date : latest),
  "",
);

/** Returns the `<lastmod>` for a route, or `undefined` when no real date exists. */
export function lastModifiedFor(route: string): Date | undefined {
  const normalized = stripLocale(route);
  const date = guideLastModified[normalized] ?? (normalized === "/guide" ? latestGuideDate : undefined);

  return date ? new Date(`${date}T00:00:00Z`) : undefined;
}
