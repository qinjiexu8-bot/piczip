import Link from "next/link";
import { ContentPage } from "@/components/site/ContentPage";
import { GuidePublication } from "./GuidePublication";
import { canvasGuide, canvasGuidePath, canvasToolPaths, type CanvasGuideKind } from "@/lib/guides/canvas-guides";
import messages from "@/lib/image-tools/canvas-messages.json";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/routes";
export function CanvasGuideArticle({ locale, kind }: { locale: Locale; kind: CanvasGuideKind }) {
  const guide = canvasGuide(locale, kind), c = messages[locale].common;
  const link = "font-medium text-teal-700 underline underline-offset-4";
  const other = kind === "padding" ? "mosaic" : "padding";
  return <ContentPage title={guide.title} description={guide.description} locale={locale} breadcrumbLabel={guide.title}>
    <GuidePublication locale={locale} path={canvasGuidePath(kind)} title={guide.title} description={guide.description} />
    <p><Link className={link} href={localePath(canvasToolPaths[kind], locale)}>{messages[locale][kind].title} →</Link></p>
    <section><h2 className="mb-4 text-2xl font-semibold">{c.steps}</h2><ol className="list-decimal space-y-3 pl-6">{guide.steps.map(step => <li key={step}>{step}</li>)}</ol></section>
    {guide.sections.map(([title, body]) => <section key={title}><h2 className="mb-3 text-xl font-semibold">{title}</h2><p className="leading-8 text-slate-600">{body}</p></section>)}
    <section><h2 className="mb-4 text-2xl font-semibold">{c.faq}</h2>{guide.faqs.map(([q, a]) => <details key={q} className="mb-3 rounded-xl border border-black/10 bg-white p-4"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-3 leading-8 text-slate-600">{a}</p></details>)}</section>
    <aside className="rounded-xl border border-black/10 bg-white p-5"><h2 className="mb-3 font-semibold">{c.related}</h2><ul className="space-y-3">
      <li><Link className={link} href={localePath(canvasToolPaths[kind], locale)}>{messages[locale][kind].title} →</Link></li>
      <li><Link className={link} href={localePath(canvasGuidePath(other), locale)}>{messages[locale][other].guide} →</Link></li>
      <li><Link className={link} href={localePath("/tools", locale)}>{c.allTools} →</Link></li>
      <li><Link className={link} href={localePath("/guide", locale)}>{c.allGuides} →</Link></li>
    </ul></aside>
  </ContentPage>;
}
