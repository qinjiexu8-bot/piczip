import { FeaturePage } from './FeaturePage';
import { HeicApp } from './HeicApp';
import { PdfApp } from './PdfApp';
import { PipelineApp } from './PipelineApp';
import type { Locale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/routes';
import { featureCopy, featurePaths, type NewFeature } from '@/lib/next-features/catalog';
import { createMetadata } from '@/lib/seo/metadata';
export function featureMetadata(locale: Locale, kind: NewFeature) {
  const t = featureCopy(locale, kind);
  return createMetadata({ title: t.title, description: t.description, path: localePath(featurePaths[kind], locale) });
}
export function FeatureRoute({ locale, kind }: { locale: Locale; kind: NewFeature }) {
  return <FeaturePage locale={locale} kind={kind}>{kind === 'heic' ? <HeicApp locale={locale} /> : kind === 'pdf' ? <PdfApp locale={locale} /> : <PipelineApp locale={locale} />}</FeaturePage>;
}
