"use client";

import { cropMessages } from "@/lib/image-tools/crop-messages";
import Link from "next/link";
import { LanguageMenu } from "./LanguageMenu";
import { siteMessages } from "@/lib/i18n/messages";
import { usePathname } from "next/navigation";
import { ImageIcon, Menu } from "lucide-react";
import { getLocale, localizedHref, stripLocale, hasLocalePage } from "@/lib/i18n/routes";

export function Header() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = siteMessages[locale].common;
  const normalized = stripLocale(pathname);
  const items = [
    { label: t.compress, href: localizedHref(pathname, "/"), active: normalized === "/" || normalized.startsWith("/compress") || normalized === "/local-image-compressor" || normalized === "/batch-image-compressor" },
    { label: t.resize, href: localizedHref(pathname, "/resize-image"), active: normalized === "/resize-image" },
    { label: t.convert, href: localizedHref(pathname, "/convert-image"), active: normalized === "/convert-image" },
    { label: cropMessages[locale].nav, href: localizedHref(pathname, "/crop-image"), active: normalized === "/crop-image" },
    { label: t.stitch, href: localizedHref(pathname, "/stitch-images"), active: normalized === "/stitch-images" },
    { label: hasLocalePage("/guide", locale) ? t.guides : `${t.guides} (${t.english})`, href: localizedHref(pathname, "/guide"), active: normalized === "/guide" || normalized.startsWith("/guides/") },
    { label: t.faq, href: localizedHref(pathname, "/faq"), active: normalized === "/faq" },
  ];

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href={localizedHref(pathname, "/")} className="brand" aria-label={`PicZip · ${t.home}`}>
          <span className="brand-mark"><ImageIcon size={23} strokeWidth={1.8} /></span>
          PicZip<span className="brand-dot">.</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-7">
          <nav aria-label={t.mainNav} className="hidden items-center gap-4 xl:flex">
            {items.map(item => (
              <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined} className={`site-nav-link ${item.active ? "is-active" : ""}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <LanguageMenu key={pathname} locale={locale} pathname={pathname} />
          <details className="mobile-menu xl:hidden">
            <summary aria-label={t.openMenu}><Menu size={22} /></summary>
            <nav aria-label={t.mobileNav}>
              {items.map(item => (
                <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined} onClick={event => event.currentTarget.closest("details")?.removeAttribute("open")}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
