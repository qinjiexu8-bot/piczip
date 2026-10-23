import Link from "next/link";
import { Footer } from "./Footer";
import { siteMessages } from "@/lib/i18n/messages";
import { type Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/routes";

/** Preserve the existing footer, including its pending SEO edits. */
export function SiteFooter({ locale }: { locale: Locale }) {
  if (locale === "en" || locale === "zh") return <Footer />;
  const t = siteMessages[locale].common;
  const links = [[t.guides, "/guide"], [t.about, "/about"], [t.privacy, "/privacy"], [t.terms, "/terms"]];
  return <footer className="mx-auto flex w-full max-w-6xl flex-col gap-4 border-t border-[var(--line)] px-5 py-6 text-[11px] text-[#788373] sm:px-8 md:flex-row md:items-center md:justify-between">
    <p>{t.footer}</p><nav className="flex flex-wrap gap-x-5 gap-y-2 font-medium">
      <Link href={localePath("/faq", locale)} prefetch={false}>{t.faq}</Link>
      {links.map(([label, href]) => <Link key={href} href={href} hrefLang="en" prefetch={false}>{label} ({t.english})</Link>)}
    </nav>
  </footer>;
}
