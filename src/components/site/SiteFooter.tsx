import { directoryCopy } from "@/lib/navigation/directory";
import Link from "next/link";
import { Footer } from "./Footer";
import { articleCopy } from "@/lib/guides/article-copy";
import { siteMessages } from "@/lib/i18n/messages";
import { type Locale } from "@/lib/i18n/config";
import { hasLocalePage, localePath } from "@/lib/i18n/routes";

/** Keep the existing footer's pending SEO changes intact. */
export function SiteFooter({ locale }: { locale: Locale }) {
  const t = siteMessages[locale].common;
  const links = [[t.about, "/about"], [t.privacy, "/privacy"], [t.terms, "/terms"]];
  return <>
    {locale === "en" || locale === "zh" ? <Footer /> :
      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-4 border-t border-[var(--line)] px-5 py-6 text-[11px] text-[#788373] sm:px-8 md:flex-row md:items-center md:justify-between">
        <p>{t.footer}</p><nav className="flex flex-wrap gap-x-5 gap-y-2 font-medium">
          <Link href={localePath("/guide", locale)} prefetch={false}>{t.guides}</Link>
          <Link href={localePath("/faq", locale)} prefetch={false}>{t.faq}</Link>
          {links.map(([label, href]) => {
            const translated = hasLocalePage(href, locale);
            return <Link key={href} href={translated ? localePath(href, locale) : href} hrefLang={translated ? locale : "en"} prefetch={false}>{label}{translated ? "" : ` (${t.english})`}</Link>;
          })}
        </nav>
      </footer>}
    <nav aria-label={directoryCopy[locale].all} className="directory-footer-link"><Link href={localePath("/tools", locale)} prefetch={false}>{directoryCopy[locale].browse} <span aria-hidden="true">↗</span></Link></nav>
    <p data-site-copyright className="mx-auto w-full max-w-6xl px-5 pb-6 text-[11px] leading-5 text-[#788373] sm:px-8">© 2026 PicZip. {articleCopy[locale].copyright}</p>
  </>;
}
