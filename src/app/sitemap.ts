import type { MetadataRoute } from "next";
import { englishRoutes, localizedRoutes } from "@/lib/i18n/routes";
import { languageAlternates } from "@/lib/seo/languages";
import { lastModifiedFor } from "@/lib/seo/content-dates";
import { absoluteUrl } from "@/lib/seo/site";

const routes = [...englishRoutes, ...localizedRoutes];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => {
    const lastModified = lastModifiedFor(route);

    return {
      url: absoluteUrl(route),
      // Omitted for routes without a verifiable date. A `<lastmod>` of every build's
      // timestamp is a false freshness signal; omitting it is valid and honest.
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: route === "/" ? "weekly" : "monthly",
      priority: route === "/" ? 1 : 0.7,
      alternates: { languages: languageAlternates(route) },
    };
  });
}
