import { locales, languageTags, type Locale } from "@/lib/i18n/config";
import type { Metadata } from "next";
import { stripLocale, getLocale, hasLocalePage, localePath } from "@/lib/i18n/routes";
import { absoluteUrl, siteConfig } from "./site";

type PageMetadata = {
  title: string;
  description: string;
  path: string;
  robots?: Metadata["robots"];
  hasChineseVersion?: boolean;
  type?: "website" | "article";
};

export function createMetadata({
  title,
  description,
  path,
  robots,
  hasChineseVersion = true,
  type = "website",
}: PageMetadata): Metadata {
  const url = absoluteUrl(path);
  const canonicalPath = path === "/zh" ? "/zh" : path;
  const locale = getLocale(path);
  const ogLocales: Record<Locale, string> = { en: "en_US", zh: "zh_CN", es: "es_ES", "pt-br": "pt_BR", ja: "ja_JP" };
  const translatedLocales = locales.filter(value => hasLocalePage(path, value) && (hasChineseVersion || value !== "zh"));

  const ogImageUrl = absoluteUrl("/og-image.jpg");

  return {
    title,
    description,
    robots,
    alternates: {
      canonical: absoluteUrl(canonicalPath),
      languages: {
        ...Object.fromEntries(translatedLocales.map(value => [value === "zh" ? "zh" : languageTags[value], absoluteUrl(localePath(path, value))])),
        "x-default": absoluteUrl(stripLocale(path)),
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: ogLocales[locale],
      alternateLocale: translatedLocales.filter(value => value !== locale).map(value => ogLocales[value]),
      type,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}
