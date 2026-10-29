import Link from 'next/link';
import { ContentPage } from '@/components/site/ContentPage';
import { GuidePublication } from './GuidePublication';
import type { Locale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/routes';
import { featureGuidePath, featurePaths, type NewFeature } from '@/lib/next-features/catalog';
import { featureGuide } from '@/lib/next-features/guides';
import copy from '@/lib/next-features/messages.json';
export function FeatureGuideArticle({ locale, kind }: { locale: Locale; kind: NewFeature }) {
  const guide = featureGuide(locale, kind), c = copy[locale].common;
  const link = 'font-medium text-teal-700 underline underline-offset-4';
  return <ContentPage locale={locale} title={guide.title} description={guide.description} breadcrumbLabel={guide.title}>
    <GuidePublication locale={locale} path={featureGuidePath(kind)} title={guide.title} description={guide.description} />
    <p><Link className={link} href={localePath(featurePaths[kind], locale)}>{copy[locale][kind].title} →</Link></p>
    <ol className="list-decimal space-y-4 pl-6">{guide.steps.map(step => <li key={step}>{step}</li>)}</ol>
    {guide.sections.map(([title, text]) => <section key={title}><h2 className="mb-3 text-xl font-semibold">{title}</h2><p className="leading-8 text-slate-600">{text}</p></section>)}
    <aside className="rounded-xl border border-black/10 bg-white p-5"><ul className="space-y-3">
      <li><Link className={link} href={localePath(featurePaths[kind], locale)}>{copy[locale][kind].nav} →</Link></li>
      {(['heic', 'pdf', 'flow'] as const).filter(k => k !== kind).map(k => <li key={k}><Link className={link} href={localePath(featureGuidePath(k), locale)}>{copy[locale][k].guide}</Link></li>)}
      <li><Link className={link} href={localePath('/tools', locale)}>{c.allTools} →</Link></li>
    </ul></aside>
  </ContentPage>;
}
