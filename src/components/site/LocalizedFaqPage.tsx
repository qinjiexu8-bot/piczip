import Link from "next/link";
import { Header } from "./Header";
import { SiteFooter } from "./SiteFooter";
import { ToolIntro } from "./ToolIntro";
import { Plus } from "lucide-react";
import { faqMessages, siteMessages } from "@/lib/i18n/messages";
import { localePath } from "@/lib/i18n/routes";
import type { Locale } from "@/lib/i18n/config";

export function LocalizedFaqPage({ locale }: { locale: Locale }) {
  const { common, home } = siteMessages[locale];
  return <div className="grain flex min-h-screen flex-col"><Header /><main className="mx-auto w-full max-w-4xl flex-1 px-5 pb-10 sm:px-8">
    <Link href={localePath("/", locale)} className="inline-flex min-h-11 items-center text-xs text-teal-700">← {common.home}</Link>
    <ToolIntro title={common.faq} description={home.faqDescription} />
    <div className="home-faq-list">{faqMessages[locale].map(([question, answer]) => <details key={question}><summary>{question}<Plus size={18} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqMessages[locale].map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }) }} />
  </main><SiteFooter locale={locale} /></div>;
}
