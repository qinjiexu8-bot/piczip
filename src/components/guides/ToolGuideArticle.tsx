import Image from "next/image";
import Link from "next/link";
import { GuideArticlePage } from "@/components/site/GuideArticlePage";
import { getToolGuide, getToolGuides, toolGuidePath } from "@/lib/guides/tool-guides";
import type { GuideLocale } from "@/lib/guides/tool-guide-types";
import { toolCatalog } from "@/lib/image-tools/catalog";
import type { ToolKind } from "@/lib/image-tools/types";
import { createMetadata } from "@/lib/seo/metadata";

export function toolGuideMetadata(tool: ToolKind, locale: GuideLocale) {
  const guide = getToolGuide(tool, locale);
  return createMetadata({ title: guide.title, description: guide.description, path: toolGuidePath(guide.slug, locale), type: "article" });
}
const headingClass = "mb-4 text-2xl font-semibold leading-snug text-foreground";
const linkClass = "font-medium text-teal-700 underline decoration-teal-700/30 underline-offset-4 hover:decoration-teal-700";
export function ToolGuideArticle({ tool, locale }: { tool: ToolKind; locale: GuideLocale }) {
  const guide = getToolGuide(tool, locale);
  const zh = locale === "zh";
  const prefix = zh ? "/zh" : "";
  const image = `/guides/${guide.slug}/${locale}.png`;
  const workflowTitle = zh ? "操作步骤" : "Step-by-step instructions";
  const faqTitle = zh ? "常见问题" : "Frequently asked questions";
  const toc = [{ id: "steps", title: workflowTitle }, { id: "example", title: guide.example.title }, ...guide.sections, { id: "questions", title: faqTitle }];
  return <GuideArticlePage locale={locale} title={guide.title} description={guide.description} path={toolGuidePath(guide.slug, locale)} publishedAt="2026-10-22" verifiedAt="2026-10-22" readingTime={guide.readingTime} howToSteps={guide.steps} breadcrumbLabel={guide.label} image={image}>
    <p className="text-lg leading-8 text-foreground">{guide.summary}</p>
    <p><Link className={linkClass} href={`${prefix}${toolCatalog[tool].path}`}>{guide.cta} →</Link></p>
    <nav aria-label={zh ? "文章目录" : "On this page"} className="rounded-xl border border-black/10 bg-white/70 p-5">
      <p className="mb-2 text-sm font-semibold text-foreground">{zh ? "本文内容" : "On this page"}</p>
      <ul className="grid gap-x-5 gap-y-1 text-sm sm:grid-cols-2">{toc.map(item => <li key={item.id}><a className={linkClass} href={`#${item.id}`}>{item.title}</a></li>)}</ul>
    </nav>
    <section id="steps" className="scroll-mt-24 pt-5">
      <h2 className={headingClass}>{workflowTitle}</h2>
      <ol className="list-decimal space-y-3 pl-6 marker:font-semibold marker:text-teal-700">{guide.steps.map(step => <li key={step} className="pl-1">{step}</li>)}</ol>
    </section>
    <section id="example" className="scroll-mt-24 space-y-5 pt-5">
      <h2 className={headingClass}>{guide.example.title}</h2>
      <p>{guide.example.intro}</p>
      <div className="overflow-hidden rounded-xl border border-black/10">
        <table className="w-full table-fixed text-left text-sm leading-6 sm:text-base">
          <caption className="sr-only">{guide.example.title}</caption>
          <thead className="bg-teal-50 text-teal-900"><tr>{guide.example.headers.map(header => <th scope="col" key={header} className="break-words px-3 py-3 font-semibold sm:px-4">{header}</th>)}</tr></thead>
          <tbody>{guide.example.rows.map(row => <tr key={row[0]} className="border-t border-black/10 bg-white/70">{row.map((cell, index) => index === 0 ? <th scope="row" key={index} className="break-words px-3 py-3 font-medium sm:px-4">{cell}</th> : <td key={index} className="break-words px-3 py-3 sm:px-4">{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <figure>
        <a href={image} target="_blank" rel="noreferrer" aria-label={zh ? "打开完整操作截图（新窗口）" : "Open full screenshot (new window)"}>
          <Image src={image} alt={guide.example.caption} width={1088} height={tool === "resize" ? (zh ? 960 : 978) : tool === "convert" ? (zh ? 896 : 916) : (zh ? 1200 : 1219)} sizes="(max-width: 639px) calc(100vw - 40px), 832px" className="h-auto w-full rounded-xl border border-black/10" />
        </a>
        <figcaption className="mt-3 text-sm leading-6 text-slate-500">{guide.example.caption} {zh ? "点击可查看大图。" : "Open the image for a larger view."}</figcaption>
      </figure>
      <p>{guide.example.note}</p>
    </section>
    {guide.sections.map(section => <section id={section.id} key={section.id} className="scroll-mt-24 space-y-4 pt-5">
      <h2 className={headingClass}>{section.title}</h2>
      {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      {tool === "convert" && section.id === "choose-format" && <p className="text-sm text-slate-500">{zh ? "格式特性的参考资料：" : "Format reference: "}<a className={linkClass} href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types">{zh ? "MDN 图片格式指南" : "MDN image file type and format guide"}</a>{zh ? "（JPG 不支持透明通道；PNG 支持无损编码与透明；WebP 支持透明）。" : " (JPEG has no alpha channel; PNG supports lossless encoding and transparency; WebP supports transparency)."}</p>}
    </section>)}
    <section id="questions" className="scroll-mt-24 space-y-5 pt-5">
      <h2 className={headingClass}>{faqTitle}</h2>
      {guide.faqs.map(faq => <div key={faq.question}><h3 className="mb-1 text-lg font-semibold text-foreground">{faq.question}</h3><p>{faq.answer}</p></div>)}
    </section>
    <aside className="mt-8 rounded-xl border border-teal-800/15 bg-white p-5 sm:p-6" aria-label={zh ? "继续处理图片" : "Continue editing"}>
      <h2 className="text-xl font-semibold text-foreground">{zh ? "继续处理图片" : "Put the guide into practice"}</h2>
      <p className="mt-3"><Link className={linkClass} href={`${prefix}${toolCatalog[tool].path}`}>{guide.cta} →</Link></p>
      <ul className="mt-4 space-y-2 text-sm leading-6">
        {getToolGuides(locale).filter(item => item.tool !== tool).map(item => <li key={item.slug}><Link className={linkClass} href={toolGuidePath(item.slug, locale)}>{item.label}</Link></li>)}
        <li><Link className={linkClass} href={`${prefix}/guides/compress-image-to-100kb-without-uploading`}>{zh ? "图片压缩到 100KB：实测操作指南" : "Compress an image to 100KB: a tested walkthrough"}</Link></li>
        <li><Link className={linkClass} href={prefix || "/"}>{zh ? "打开图片压缩工具" : "Open the image compressor"}</Link></li>
      </ul>
    </aside>
  </GuideArticlePage>;
}
