import Link from 'next/link';
import { Header } from '@/components/site/Header';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ToolIntro } from '@/components/site/ToolIntro';
import { directoryTools } from '@/lib/navigation/directory';
import { localePath } from '@/lib/i18n/routes';
import messages from '@/lib/next-features/messages.json';
import type { Locale } from '@/lib/i18n/config';
import type { ReactNode } from 'react';
import { featureGuideSlugs, type NewFeature } from '@/lib/next-features/catalog';
export function FeaturePage({ locale, kind, children }: { locale: Locale; kind: NewFeature; children: ReactNode }) {
  const t = messages[locale][kind], c = messages[locale].common;
  return <div className="grain flex min-h-screen flex-col overflow-x-clip"><Header /><main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-7 sm:px-8">
    <ToolIntro title={t.title} description={t.description} />
    {children}
    <nav className="feature-related" aria-label={c.allTools}>
      <Link href={localePath(`/guides/${featureGuideSlugs[kind]}`, locale)}>{t.guide} →</Link>
      <Link href={localePath('/tools', locale)}>{c.allTools} →</Link>
      {directoryTools(locale).slice(0, 3).map(tool => <Link key={tool.id} href={localePath(tool.path, locale)}>{tool.label} →</Link>)}
    </nav>
    <p className="feature-license"><a href="/licenses/README.txt">{c.licenses}</a></p>
  </main><SiteFooter locale={locale} /></div>;
}
