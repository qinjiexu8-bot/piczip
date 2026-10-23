import { GuidePublication } from "./GuidePublication";
import Link from "next/link";
import { ContentPage } from "@/components/site/ContentPage";
import { cropGuides } from "@/lib/guides/crop-guide";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/routes";
export function CropGuideArticle({ locale }: { locale: Locale }) {
  const t = cropGuides[locale];
  const linkClass = "font-medium text-teal-700 underline decoration-teal-700/30 underline-offset-4 hover:decoration-teal-700";
  return <ContentPage title={t.title} description={t.description} locale={locale} breadcrumbLabel={t.title}>
    <div className="space-y-8 text-base leading-8 text-slate-700">
      <GuidePublication locale={locale} path="/guides/crop-rotate-flip-images" title={t.title} description={t.description} />
      <Link className={linkClass} href={localePath("/crop-image", locale)}>{t.open} →</Link>
      <section><h2 className="mb-4 text-2xl font-semibold text-foreground">{t.stepsTitle}</h2><ol className="list-decimal space-y-3 pl-6">{t.steps.map(step => <li key={step}>{step}</li>)}</ol></section>
      {t.sections.map(([title, text]) => <section key={title}><h2 className="mb-3 text-xl font-semibold text-foreground">{title}</h2><p>{text}</p></section>)}
      <section><h2 className="mb-4 text-2xl font-semibold text-foreground">{t.faqTitle}</h2><div className="space-y-4">{t.faqs.map(([question, answer]) => <details key={question} className="rounded-xl border border-black/10 bg-white p-4"><summary className="cursor-pointer font-semibold text-foreground">{question}</summary><p className="mt-3">{answer}</p></details>)}</div></section>
      <aside className="rounded-xl border border-teal-800/15 bg-white p-5"><h2 className="mb-3 text-xl font-semibold text-foreground">{t.related}</h2><ul className="space-y-2">{[["/crop-image", t.open], ["/guides/resize-images-by-pixels-or-percentage", t.resize], ["/", t.compress], ["/guide", t.all]].map(([path, label]) => <li key={path}><Link className={linkClass} href={localePath(path, locale)}>{label} →</Link></li>)}</ul></aside>
    </div>
  </ContentPage>;
}
