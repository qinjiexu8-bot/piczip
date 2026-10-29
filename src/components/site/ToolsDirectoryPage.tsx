import Link from "next/link";
import { ArrowUpRight, BookOpen, CircleHelp, Grid2X2 } from "lucide-react";
import { Header } from "./Header";
import { SiteFooter } from "./SiteFooter";
import { Breadcrumb } from "./Breadcrumb";
import { directoryCopy, directoryTools } from "@/lib/navigation/directory";
import { localePath } from "@/lib/i18n/routes";
import { siteMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/config";
import { createMetadata } from "@/lib/seo/metadata";

export function toolsDirectoryMetadata(locale: Locale) {
  const t = directoryCopy[locale];
  return createMetadata({ title: t.all, description: t.description, path: localePath("/tools", locale) });
}

export function ToolsDirectoryPage({ locale }: { locale: Locale }) {
  const t = directoryCopy[locale];
  const common = siteMessages[locale].common;
  const tools = directoryTools(locale);
  return <div className="grain flex min-h-screen flex-col">
    <Header />
    <main className="tools-directory mx-auto w-full max-w-6xl flex-1 px-5 pb-10 sm:px-8">
      <div className="tool-breadcrumb"><Breadcrumb locale={locale} items={[{ label: t.all }]} /></div>
      <section className="directory-intro">
        <div className="directory-eyebrow"><Grid2X2 size={15} aria-hidden="true" />{t.all}</div>
        <h1>{t.title}</h1><p>{t.description}</p>
        <span className="directory-count">{t.count}</span>
      </section>
      <div className="directory-grid">
        {tools.map(tool => <article key={tool.id} className="directory-card" data-tool-category={tool.group}>
          <Link data-directory-tool={tool.id} href={localePath(tool.path, locale)} prefetch={false} className="directory-tool-link">
            <span className="directory-tool-icon"><tool.icon size={22} strokeWidth={1.6} aria-hidden="true" /></span>
            <span className="directory-category">{t.groups[tool.group]}</span>
            <ArrowUpRight className="directory-tool-arrow" size={17} aria-hidden="true" />
            <h2>{tool.label}</h2><p>{tool.description}</p>
          </Link>
          <Link className="directory-guide-link" href={localePath(tool.guide, locale)} prefetch={false}><BookOpen size={13} aria-hidden="true" />{t.guide}<span className="sr-only"> · {tool.label}</span></Link>
        </article>)}
      </div>
      <aside className="directory-help"><div><h2>{t.helpTitle}</h2><p>{t.helpText}</p></div><nav aria-label={t.resources}>
        <Link href={localePath("/guide", locale)}><BookOpen size={17} aria-hidden="true" />{common.guides}</Link>
        <Link href={localePath("/faq", locale)}><CircleHelp size={17} aria-hidden="true" />{common.faq}</Link>
      </nav></aside>
    </main><SiteFooter locale={locale} />
  </div>;
}
