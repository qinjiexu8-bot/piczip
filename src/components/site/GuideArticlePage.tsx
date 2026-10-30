import descriptions from "@/lib/guides/legacy-descriptions.json";
import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { SiteFooter } from "@/components/site/SiteFooter";
import { articleCopy } from "@/lib/guides/article-copy";
import { languageTags, type Locale } from "@/lib/i18n/config";
import { localePath, localizedHref } from "@/lib/i18n/routes";
import { siteMessages } from "@/lib/i18n/messages";
import { Header } from "@/components/site/Header";
import { absoluteUrl } from "@/lib/seo/site";

type GuideArticlePageProps = {
  locale?: Locale;
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  verifiedAt: string;
  modifiedAt?: string;
  readingTime: string;
  howToSteps: string[];
  breadcrumbLabel: string;
  image: string;
  children: ReactNode;
};

export function GuideArticlePage({
  locale = "en",
  title,
  description,
  path,
  publishedAt,
  verifiedAt,
  modifiedAt,
  readingTime,
  howToSteps,
  breadcrumbLabel,
  image,
  children,
}: GuideArticlePageProps) {
  description = (descriptions as Record<string, string>)[path] ?? description;
  const isChinese = locale === "zh";
  const t = articleCopy[locale];
  const aboutPath = localizedHref(localePath("/", locale), "/about");
  const homePath = localePath("/", locale);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    inLanguage: languageTags[locale],
    description,
    url: absoluteUrl(path),
    datePublished: publishedAt,
    dateModified: modifiedAt ?? ((descriptions as Record<string, string>)[path] ? "2026-10-29" : verifiedAt),
    author: {
      "@type": "Organization",
      name: "PicZip",
      url: absoluteUrl(aboutPath),
    },
    publisher: {
      "@type": "Organization",
      name: "PicZip",
      url: absoluteUrl(homePath),
    },
    image: [absoluteUrl(image)],
    mainEntityOfPage: absoluteUrl(path),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description,
    step: howToSteps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: `${t.step} ${index + 1}`,
      text,
    })),
  };

  return (
    <div className="grain flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 pb-12 sm:px-8">
        <Breadcrumb
          locale={locale}
          items={[
            { label: siteMessages[locale].common.guides, href: localePath("/guide", locale) },
            { label: breadcrumbLabel },
          ]}
        />

        <article>
          <header className="border-b border-black/10 pb-8">
            <p className="text-sm font-black uppercase text-teal-700">
              {t.tested}
            </p>
            <h1 className="mt-4 font-sans text-3xl font-semibold leading-[1.25] tracking-tight sm:text-5xl sm:leading-[1.15]">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{description}</p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              <span>
                {t.by}
                <Link className="font-bold text-foreground" href={aboutPath}>PicZip</Link>
              </span>
              <span>
                {t.published}
                {formatDate(publishedAt, locale)}
              </span>
              <span>
                {isChinese && publishedAt > verifiedAt ? "原始测试：" : t.verified}
                {formatDate(verifiedAt, locale)}
              </span>
              <span>{readingTime}</span>
            </div>
            <p className="mt-5 rounded-lg bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-900">
              {t.note}
            </p>
          </header>

          <div className="article-content mt-9 space-y-5 text-[17px] leading-8 text-slate-700">
            {children}
          </div>

          <footer className="mt-10 border-t border-black/10 pt-6 text-sm leading-7 text-slate-600">
            <p>
              {t.contact}
              <a className="font-bold text-teal-700" href="mailto:support@piczip.app">
                support@piczip.app
              </a>
              {isChinese ? "。" : "."}
            </p>
          </footer>
        </article>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <SiteFooter locale={locale} />
    </div>
  );
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(languageTags[locale], {
    year: "numeric",
    month: locale === "zh" ? "long" : "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
