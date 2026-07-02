import Link from "next/link";
import { CompressorApp } from "@/components/compressor/CompressorApp";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

type SeoLandingPageProps = {
  title: string;
  description: string;
  bullets: string[];
  guideTitle: string;
  guide: string[];
  locale?: "en" | "zh";
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

export function SeoLandingPage({
  title,
  description,
  bullets,
  guideTitle,
  guide,
  faqs,
  locale = "en",
}: SeoLandingPageProps) {
  const isChinese = locale === "zh";
  const labels = {
    eyebrow: isChinese ? "免费 · 无需注册 · 不上传" : "Free · No sign-up · No upload",
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

  return (
    <div className="grain flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-10 sm:px-8">
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="pt-7 lg:pt-10">
            <p className="mb-4 inline-flex rounded-full border border-black/10 bg-[rgba(255,253,247,0.78)] px-3 py-2 text-sm font-black text-teal-700">
              {labels.eyebrow}
            </p>
            <h1 className="font-serif text-5xl font-black leading-none tracking-normal sm:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">{description}</p>
            <ul className="mt-6 grid gap-3">
              {bullets.map((bullet) => (
                <li key={bullet} className="rounded-xl border border-black/10 bg-[rgba(255,253,247,0.74)] p-4 font-bold">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          <CompressorApp locale={locale} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <article className="rounded-xl border border-black/10 bg-[rgba(255,253,247,0.78)] p-6">
            <h2 className="text-2xl font-black">{guideTitle}</h2>
            <ol className="mt-5 grid gap-4">
              {guide.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <span className="leading-7 text-slate-600">{step}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className="rounded-xl border border-black/10 bg-[rgba(255,253,247,0.78)] p-6">
            <h2 className="text-2xl font-black">{labels.faq}</h2>
            <div className="mt-5 grid gap-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="rounded-lg border border-slate-200 bg-white p-4">
                  <summary className="cursor-pointer font-black">{faq.question}</summary>
                  <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-6 rounded-xl border border-black/10 bg-[rgba(255,253,247,0.78)] p-6">
          <h2 className="font-black">{labels.related}</h2>
          <div className="mt-4 flex flex-wrap gap-3">
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
      <Footer />
    </div>
  );
}
