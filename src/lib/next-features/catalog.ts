import copy from './messages.json';
import type { Locale } from '../i18n/config';
export type NewFeature = 'heic' | 'pdf' | 'flow';
export const featurePaths = { heic: '/heic-to-jpg', pdf: '/images-to-pdf', flow: '/batch-workflow' } as const;
export const featureGuideSlugs = { heic: 'convert-heic-photos-to-jpg', pdf: 'combine-images-into-pdf', flow: 'automate-image-batch-workflow' } as const;
export type FeatureGuideSlug = typeof featureGuideSlugs[NewFeature];
export function featureGuidePath(kind: NewFeature) { return `/guides/${featureGuideSlugs[kind]}` as const; }
export function featureForRoute(route: string): NewFeature | undefined { return (Object.keys(featurePaths) as NewFeature[]).find(kind => featurePaths[kind] === `/${route}`); }
export function featureForGuide(slug: string): NewFeature | undefined { return (Object.keys(featureGuideSlugs) as NewFeature[]).find(kind => featureGuideSlugs[kind] === slug); }
export function isFeatureGuide(slug: string): slug is FeatureGuideSlug { return !!featureForGuide(slug); }
export function featureCopy(locale: Locale, kind: NewFeature) { return copy[locale][kind]; }
