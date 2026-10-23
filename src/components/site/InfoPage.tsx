import Link from "next/link";
import { ContentPage } from "./ContentPage";
import copy from "@/lib/i18n/info-pages.json";
import { faqMessages } from "@/lib/i18n/messages";
import { type Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/routes";
import { createMetadata } from "@/lib/seo/metadata";

const toolPaths = ["/", "/resize-image", "/crop-image", "/convert-image", "/stitch-images", "/watermark-image"];
export type InfoKind = "about" | "faq";

export function infoMetadata(locale: Locale, kind: InfoKind) {
  const t = copy[locale];
  const title = kind === "about" ? t.aboutTitle : t.faqTitle;
  const metadata = createMetadata({ title, description: kind === "about" ? t.aboutDescription : t.faqDescription, path: localePath(`/${kind}`, locale) });
  // About titles already contain the brand; bypass the layout's brand suffix.
  return kind === "about" ? { ...metadata, title: { absolute: title } } : metadata;
}

export function InfoPage({ locale, kind }: { locale: Locale; kind: InfoKind }) {
  const t = copy[locale];
  const faqs = [...faqMessages[locale].slice(0, 5), ...t.extraFaqs];
  return <ContentPage locale={locale} title={kind === "about" ? t.aboutTitle : t.faqTitle}
    description={kind === "about" ? t.aboutDescription : t.faqDescription}
    breadcrumbLabel={kind === "about" ? t.aboutTitle : t.faqTitle}>
    {kind === "about" ? <>
      {t.aboutSections.map(([heading, text]) => <section key={heading}><h2 className="mb-3 text-xl font-semibold tracking-tight">{heading}</h2><p className="leading-8 text-slate-600">{text}</p></section>)}
      <section><h2 className="mb-3 text-xl font-semibold tracking-tight">{t.contactTitle}</h2><p>{t.contact} <a className="text-teal-700 underline" href="mailto:support@piczip.app">support@piczip.app</a></p></section>
    </> : <>
      {faqs.map(([question, answer]) => <section data-info-faq key={question}><h2 className="mb-3 text-xl font-semibold tracking-tight">{question}</h2><p className="leading-8 text-slate-600">{answer}</p></section>)}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
      }).replace(/</g, "\\u003c") }} />
    </>}
    <section data-info-tool-links><h2 className="mb-3 text-xl font-semibold tracking-tight">{t.toolsTitle}</h2><ul className="grid gap-3 sm:grid-cols-2">
      {toolPaths.map((path, i) => <li key={path}><Link className="text-teal-700 underline underline-offset-4" href={localePath(path, locale)}>{t.tools[i]}</Link></li>)}
    </ul><p className="mt-5"><Link className="text-teal-700 underline underline-offset-4" href={localePath("/guide", locale)}>{t.guideLink}</Link></p></section>
  </ContentPage>;
}
