import { CropRelatedLinks } from "@/components/image-tools/CropRelatedLinks";
import Image from "next/image";
import Link from "next/link";
import { GuideArticlePage } from "@/components/site/GuideArticlePage";

import { localePath } from "@/lib/i18n/routes";
import guides from "@/lib/guides/translations/zh.json";

import evidence from "@/lib/guides/guide-evidence.json";


const headingClass = "mb-4 text-2xl font-semibold leading-snug text-foreground";
const linkClass = "font-medium text-teal-700 underline decoration-teal-700/30 underline-offset-4 hover:decoration-teal-700";

export function ChineseCompressionGuide({ slug }: { slug: keyof typeof guides }) {
  const locale = "zh" as const;
  const guide = guides[slug];
  const proof = evidence[slug];
  const related = (Object.keys(guides) as (keyof typeof guides)[]).filter(other => other !== slug).slice(0, 3);
  const t = { steps: "操作步骤", faq: "常见问题", contents: "本文内容", openTool: "打开图片压缩工具", fullImage: "查看完整实测截图", screenshot: "截图来自原始测试，实际结果因图片和设置而异。", related: "继续阅读", allGuides: "全部指南" };
  const body = JSON.stringify(guide);
  const minutes = Math.max(3, Math.ceil(body.length / 550));
  const toc = [{ id: "steps", title: t.steps }, ...guide.sections.map(([title], i) => ({ id: `section-${i + 1}`, title })), { id: "questions", title: t.faq }];
  return <GuideArticlePage locale={locale} title={guide.title} description={guide.description}
    path={localePath(`/guides/${slug}`, locale)} publishedAt="2026-10-29" verifiedAt={proof.verifiedAt} modifiedAt="2026-10-29"
    readingTime={`${minutes} 分钟阅读`} howToSteps={guide.steps} breadcrumbLabel={guide.title} image={proof.image}>
    <p><Link className={linkClass} href={localePath(proof.tool, locale)}>{t.openTool} →</Link></p>
    <nav aria-label={t.contents} className="rounded-xl border border-black/10 bg-white/70 p-5">
      <p className="mb-2 text-sm font-semibold text-foreground">{t.contents}</p>
      <ul className="grid gap-x-5 gap-y-2 text-sm sm:grid-cols-2">{toc.map(item => <li key={item.id}><a className={linkClass} href={`#${item.id}`}>{item.title}</a></li>)}</ul>
    </nav>
    <section id="steps" className="scroll-mt-24 pt-5">
      <h2 className={headingClass}>{t.steps}</h2>
      <ol className="list-decimal space-y-3 pl-6 marker:font-semibold marker:text-teal-700">{guide.steps.map(step => <li key={step} className="pl-1">{step}</li>)}</ol>
    </section>
    {guide.sections.map(([title, ...paragraphs], i) => <section id={`section-${i + 1}`} key={title} className="scroll-mt-24 space-y-4 pt-5">
      <h2 className={headingClass}>{title}</h2>
      {paragraphs.map(text => <p key={text}>{text}</p>)}
      {i === 0 && <>
        <div className="overflow-x-auto rounded-xl border border-black/10" role="region" aria-label={title} tabIndex={0}>
          <table className="w-full min-w-[480px] text-left text-sm leading-6">
            <caption className="sr-only">{title}</caption>
            <thead className="bg-teal-50 text-teal-900"><tr>{guide.table.headers.map(header => <th key={header} scope="col" className="px-4 py-3 font-semibold">{header}</th>)}</tr></thead>
            <tbody>{guide.table.rows.map(row => <tr key={row[0]} className="border-t border-black/10 bg-white/70">{row.map((cell, column) => column === 0
              ? <th key={column} scope="row" className="px-4 py-3 font-medium">{cell}</th>
              : <td key={column} className="px-4 py-3">{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <figure className="pt-2">
          <a href={proof.image} target="_blank" rel="noreferrer" aria-label={t.fullImage}>
            <Image src={proof.image} alt={guide.caption} width={proof.width} height={proof.height} sizes="(max-width: 639px) calc(100vw - 40px), 832px" className="h-auto w-full rounded-xl border border-black/10" />
          </a>
          <figcaption className="mt-3 text-sm leading-6 text-slate-500">{guide.caption} {t.screenshot}</figcaption>
        </figure>
      </>}
    </section>)}
    <section id="questions" className="scroll-mt-24 space-y-5 pt-5">
      <h2 className={headingClass}>{t.faq}</h2>
      {guide.faqs.map(([question, answer]) => <div key={question}><h3 className="mb-1 text-lg font-semibold text-foreground">{question}</h3><p>{answer}</p></div>)}
    </section>
    <aside className="mt-8 rounded-xl border border-teal-800/15 bg-white p-5 sm:p-6" aria-label={t.related}>
      <h2 className="text-xl font-semibold text-foreground">{t.related}</h2>
      <ul className="mt-4 space-y-3 text-sm leading-6">
        {related.map(other => <li key={other}><Link className={linkClass} href={localePath(`/guides/${other}`, locale)}>{guides[other].title}</Link></li>)}
      </ul>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link className={linkClass} href={localePath(proof.tool, locale)}>{t.openTool} →</Link>
        <Link className={linkClass} href={localePath("/guide", locale)}>{t.allGuides}</Link>
      </div>
    </aside>
    <CropRelatedLinks locale={locale} />
  </GuideArticlePage>;
}
