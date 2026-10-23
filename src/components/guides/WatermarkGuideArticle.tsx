import Link from "next/link";
import { ContentPage } from "@/components/site/ContentPage";
import { cropGuides } from "@/lib/guides/crop-guide";
import { watermarkGuides } from "@/lib/guides/watermark-guide";
import { watermarkMessages } from "@/lib/image-tools/watermark-messages";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/routes";
export function WatermarkGuideArticle({locale}:{locale:Locale}) {
 const t=watermarkGuides[locale], ui=cropGuides[locale], w=watermarkMessages[locale];const link="font-medium text-teal-700 underline underline-offset-4";
 return <ContentPage title={w.guide} description={w.description} locale={locale} breadcrumbLabel={w.guide}><div className="space-y-8 text-base leading-8 text-slate-700">
 <Link className={link} href={localePath("/watermark-image",locale)}>{w.title} →</Link>
 <section><h2 className="mb-4 text-2xl font-semibold text-foreground">{ui.stepsTitle}</h2><ol className="list-decimal space-y-3 pl-6">{t.steps.map(step=><li key={step}>{step}</li>)}</ol></section>
 {t.sections.map(([heading,text])=><section key={heading}><h2 className="mb-3 text-xl font-semibold text-foreground">{heading}</h2><p>{text}</p></section>)}
 <section><h2 className="mb-4 text-2xl font-semibold text-foreground">{ui.faqTitle}</h2>{t.faqs.map(([q,a])=><details key={q} className="mb-3 rounded-xl border border-black/10 bg-white p-4"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-3">{a}</p></details>)}</section>
 <aside className="rounded-xl border border-teal-800/15 bg-white p-5"><h2 className="font-semibold">{ui.related}</h2><ul>{[["/watermark-image",w.title],["/",ui.compress],["/guides/crop-rotate-flip-images",ui.title],["/guide",ui.all]].map(([path,label])=><li key={path}><Link className={link} href={localePath(path,locale)}>{label} →</Link></li>)}</ul></aside>
 </div></ContentPage>;
}
