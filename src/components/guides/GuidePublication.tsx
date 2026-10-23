import Link from "next/link";
import { languageTags, type Locale } from "@/lib/i18n/config";
import { localizedHref, localePath } from "@/lib/i18n/routes";
import { newGuideDates } from "@/lib/seo/content-dates";
import { absoluteUrl } from "@/lib/seo/site";

const labels = {
  en: ["By", "Published", "Updated"], zh: ["作者", "发布于", "更新于"],
  es: ["Por", "Publicado", "Actualizado"], "pt-br": ["Por", "Publicado", "Atualizado"],
  ja: ["著者", "公開日", "更新日"],
};
export function GuidePublication({locale, path, title, description}: {locale:Locale; path:keyof typeof newGuideDates; title:string; description:string}) {
  const dates = newGuideDates[path];
  const url = absoluteUrl(localePath(path, locale));
  const about = localizedHref(localePath(path, locale), "/about");
  const t = labels[locale];
  const author = { "@type": "Organization", name: "PicZip", url: absoluteUrl(about) };
  const schema = {
    "@context": "https://schema.org", "@type": "Article", "@id": `${url}#article`,
    headline: title, description, url, mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: languageTags[locale], datePublished: dates.published, dateModified: dates.modified,
    author, publisher: { "@type": "Organization", name: "PicZip", url: absoluteUrl("/") },
  };
  const format = (date:string) => new Intl.DateTimeFormat(languageTags[locale], {year:"numeric",month:"short",day:"numeric",timeZone:"UTC"}).format(new Date(`${date}T00:00:00Z`));
  return <>
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500" data-guide-publication>
      <span>{t[0]} <Link className="font-medium text-teal-700" href={about}>PicZip</Link></span>
      <span>{t[1]} <time dateTime={dates.published}>{format(dates.published)}</time></span>
      <span>{t[2]} <time dateTime={dates.modified}>{format(dates.modified)}</time></span>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}} />
  </>;
}
