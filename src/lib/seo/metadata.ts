import type { Metadata } from "next";
import { stripLocale, toEnglishPath, toLocalizedPath } from "@/lib/i18n/routes";
import { absoluteUrl, siteConfig } from "./site";

type PageMetadata = {
  title: string;
  description: string;
  path: string;
};

export function createMetadata({ title, description, path }: PageMetadata): Metadata {
  const url = absoluteUrl(path);
  const englishPath = toEnglishPath(path);
  const chinesePath = toLocalizedPath(path);
  const canonicalPath = path === "/zh" ? "/zh" : path;
  const isChinesePage = path === "/zh" || path.startsWith("/zh/");

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(canonicalPath),
      languages: {
        en: absoluteUrl(englishPath),
        zh: absoluteUrl(chinesePath),
        "x-default": absoluteUrl(stripLocale(path)),
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: isChinesePage ? "zh_CN" : siteConfig.locale,
      alternateLocale: isChinesePage ? ["en_US"] : ["zh_CN"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
