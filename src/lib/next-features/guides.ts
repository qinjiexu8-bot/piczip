import data from './guides.json';
import copy from './messages.json';
import type { Locale } from '../i18n/config';
import type { NewFeature } from './catalog';
export function featureGuide(locale: Locale, kind: NewFeature) {
  const t = data[locale][kind], m = copy[locale][kind];
  return { title: m.guide, description: t.description, summary: t.description, steps: t.steps, sections: [[t.section, t.body], [copy[locale].common.limitsHeading, m.note]], faqs: [], table: { headers: [], rows: [] }, caption: '' };
}
