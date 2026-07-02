import type { MetadataRoute } from "next";
import { englishRoutes, localizedRoutes, stripLocale, toEnglishPath, toLocalizedPath } from "@/lib/i18n/routes";
import { absoluteUrl } from "@/lib/seo/site";

const routes = [...englishRoutes, ...localizedRoutes];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
    alternates: {
      languages: {
        en: absoluteUrl(toEnglishPath(route)),
        zh: absoluteUrl(toLocalizedPath(route)),
        "x-default": absoluteUrl(stripLocale(route)),
      },
    },
  }));
}
