import { ToolIntro } from "@/components/site/ToolIntro";
import Link from "next/link";
import { CompressorApp } from "@/components/compressor/CompressorApp";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

type SeoLandingPageProps = {
  title: string;
  description: string;
  bullets: string[];
  guideTitle: string;
  guide: string[];
  locale?: "en" | "zh";
  breadcrumbLabel: string;
  compressorDefaults?: {
    targetKb?: number;
    format?: "auto" | "jpeg" | "png" | "webp";
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  relatedGuides?: Array<{
    label: string;
    href: string;
  }>;
};

export function SeoLandingPage({
  title,
  description,
  guideTitle,
  guide,
  faqs,
  locale = "en",
  breadcrumbLabel,
  compressorDefaults,
  relatedGuides = [],
}: SeoLandingPageProps) {
  const isChinese = locale === "zh";
  const labels = {
    faq: isChinese ? "常见问题" : "FAQ",
    related: isChinese ? "相关压缩任务" : "Related compression tasks",
  };
  const relatedTools = isChinese
    ? [
        ["压缩 JPG", "/zh/compress-jpg"],
        ["压缩 PNG", "/zh/compress-png"],
        ["压缩 WebP", "/zh/compress-webp"],
        ["图片压缩到 100KB", "/zh/compress-image-to-100kb"],
        ["不上传图片压缩", "/zh/compress-image-without-upload"],
      ]
    : [
        ["Compress JPG", "/compress-jpg"],
        ["Compress PNG", "/compress-png"],
        ["Compress WebP", "/compress-webp"],
        ["Compress image to 100KB", "/compress-image-to-100kb"],
        ["Compress without upload", "/compress-image-without-upload"],
      ];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description: description,
    step: guide.map((stepText, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: isChinese ? `步骤 ${index + 1}` : `Step ${index + 1}`,
      text: stepText,
    })),
  };

  return (
    <div className="grain flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-10 sm:px-8">
        <div className="tool-breadcrumb"><Breadcrumb locale={locale} items={[{ label: breadcrumbLabel }]} /></div>
        <ToolIntro title={title} description={description} />

        <section>
          <CompressorApp
            locale={locale}
            initialTargetKb={compressorDefaults?.targetKb}
            initialFormat={compressorDefaults?.format}
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <article className="rounded-xl border border-[var(--line)] bg-white p-6">
            <h2 className="text-xl font-semibold">{guideTitle}</h2>
            <ol className="mt-5 grid gap-4">
              {guide.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e8f0e5] text-sm font-medium text-[#315b46]">
                    {index + 1}
                  </span>
                  <span className="leading-7 text-slate-600">{step}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className="rounded-xl border border-[var(--line)] bg-white p-6">
            <h2 className="text-xl font-semibold">{labels.faq}</h2>
            <div className="mt-5 grid gap-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="rounded-lg border border-slate-200 bg-white p-4">
                  <summary className="cursor-pointer text-sm font-medium">{faq.question}</summary>
                  <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-6 rounded-xl border border-[var(--line)] bg-white p-6">
          <h2 className="font-black">{labels.related}</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {relatedGuides.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-black text-teal-800 hover:border-teal-700"
              >
                {label}
              </Link>
            ))}
            {relatedTools.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black hover:border-foreground"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Footer />
    </div>
  );
}
