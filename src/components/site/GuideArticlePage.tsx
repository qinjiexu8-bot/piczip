import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { absoluteUrl } from "@/lib/seo/site";

type GuideArticlePageProps = {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  verifiedAt: string;
  readingTime: string;
  howToSteps: string[];
  breadcrumbLabel: string;
  image: string;
  children: ReactNode;
};

export function GuideArticlePage({
  title,
  description,
  path,
  publishedAt,
  verifiedAt,
  readingTime,
  howToSteps,
  breadcrumbLabel,
  image,
  children,
}: GuideArticlePageProps) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: absoluteUrl(path),
    datePublished: publishedAt,
    dateModified: verifiedAt,
    author: {
      "@type": "Organization",
      name: "PicZip",
      url: absoluteUrl("/about"),
    },
    publisher: {
      "@type": "Organization",
      name: "PicZip",
      url: absoluteUrl("/"),
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
      name: `Step ${index + 1}`,
      text,
    })),
  };

  return (
    <div className="grain flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 pb-12 sm:px-8">
        <Breadcrumb
          items={[
            { label: "Guide", href: "/guide" },
            { label: breadcrumbLabel },
          ]}
        />

        <article>
          <header className="border-b border-black/10 pb-8">
            <p className="text-sm font-black uppercase text-teal-700">Tested PicZip guide</p>
            <h1 className="mt-4 font-serif text-5xl font-black leading-[1.02] tracking-normal sm:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{description}</p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              <span>
                By <Link className="font-bold text-foreground" href="/about">PicZip</Link>
              </span>
              <span>Published {formatDate(publishedAt)}</span>
              <span>Verified {formatDate(verifiedAt)}</span>
              <span>{readingTime}</span>
            </div>
            <p className="mt-5 rounded-lg bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-900">
              Testing note: the figures and screenshots on this page come from a reproducible
              PicZip browser test using a privacy-safe image fixture.
            </p>
          </header>

          <div className="article-content mt-9 space-y-5 text-[17px] leading-8 text-slate-700">
            {children}
          </div>

          <footer className="mt-10 border-t border-black/10 pt-6 text-sm leading-7 text-slate-600">
            <p>
              Found an error or a result you cannot reproduce? Contact{" "}
              <a className="font-bold text-teal-700" href="mailto:support@piczip.app">
                support@piczip.app
              </a>
              .
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
      <Footer />
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
