"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BookOpen, ChevronDown, CircleHelp, Grid2X2, ImageIcon, Menu } from "lucide-react";
import { LanguageMenu } from "./LanguageMenu";
import { siteMessages } from "@/lib/i18n/messages";
import { getLocale, localePath, stripLocale } from "@/lib/i18n/routes";
import { directoryCopy, directoryTools, isToolActive, toolGroups } from "@/lib/navigation/directory";

export function Header() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = siteMessages[locale].common;
  const copy = directoryCopy[locale];
  const normalized = stripLocale(pathname);
  const tools = directoryTools(locale);
  const header = useRef<HTMLElement>(null);
  const guideActive = normalized === "/guide" || normalized.startsWith("/guides/");
  const directoryActive = normalized === "/tools" || tools.slice(3).some(tool => isToolActive(normalized, tool.path));

  const closeMenus = () => header.current?.querySelectorAll<HTMLDetailsElement>(".nav-disclosure[open]").forEach(menu => menu.removeAttribute("open"));
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      header.current?.querySelectorAll<HTMLDetailsElement>(".nav-disclosure[open]").forEach(menu => {
        if (!menu.contains(event.target as Node)) menu.removeAttribute("open");
      });
    };
    const closeOnResize = () => closeMenus();
    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("resize", closeOnResize);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("resize", closeOnResize);
    };
  }, []);

  const escapeMenu = (event: React.KeyboardEvent<HTMLDetailsElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    // Escape from a nested category dismisses the entire mobile panel.
    const menu = event.currentTarget;
    menu.removeAttribute("open");
    menu.querySelector("summary")?.focus();
  };

  return <header className="site-header" ref={header}>
    <div className="site-header-inner">
      <Link href={localePath("/", locale)} className="brand" aria-label={`PicZip · ${t.home}`} onClick={closeMenus}>
        <span className="brand-mark"><ImageIcon size={23} strokeWidth={1.8} /></span>PicZip<span className="brand-dot">.</span>
      </Link>
      <div className="header-actions">
        <nav aria-label={t.mainNav} className="site-desktop-nav hidden items-center lg:flex">
          {tools.slice(0, 3).map(tool => <Link key={tool.id} href={localePath(tool.path, locale)} onClick={closeMenus}
            aria-current={isToolActive(normalized, tool.path) ? "page" : undefined}
            className={`site-nav-link ${isToolActive(normalized, tool.path) ? "is-active" : ""}`}>
            <tool.icon size={17} strokeWidth={1.7} aria-hidden="true" /><span>{tool.label}</span>
          </Link>)}
          <details key={`tools-${pathname}`} className={`nav-tools-menu nav-disclosure ${directoryActive ? "has-active-tool" : ""}`} onKeyDown={escapeMenu}
            onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) event.currentTarget.removeAttribute("open"); }}>
            <summary className="site-nav-link"><Grid2X2 size={16} aria-hidden="true" /><span>{copy.all}</span><ChevronDown size={13} className="nav-chevron" aria-hidden="true" /></summary>
            <div className="nav-tools-panel">
              <div className="nav-tools-panel-heading"><span>{copy.all}</span><Link href={localePath("/tools", locale)} prefetch={false} onClick={closeMenus}>{copy.browse}<ArrowUpRight size={15} aria-hidden="true" /></Link></div>
              <div className="nav-tool-groups">
                {toolGroups.map(group => <section key={group} aria-label={copy.groups[group]}><h2>{copy.groups[group]}</h2>
                  {tools.filter(tool => tool.group === group).map(tool => <Link key={tool.id} href={localePath(tool.path, locale)} prefetch={false} className="nav-tool-entry" onClick={closeMenus}
                    aria-current={isToolActive(normalized, tool.path) ? "page" : undefined}>
                    <tool.icon size={19} strokeWidth={1.7} aria-hidden="true" /><span><strong>{tool.label}</strong><small>{tool.description}</small></span>
                  </Link>)}
                </section>)}
              </div>
              <div className="nav-tools-panel-footer"><Link href={localePath("/guide", locale)} onClick={closeMenus}><BookOpen size={15} aria-hidden="true" />{t.guides}</Link><Link href={localePath("/faq", locale)} onClick={closeMenus}><CircleHelp size={15} aria-hidden="true" />{t.faq}</Link></div>
            </div>
          </details>
          <Link href={localePath("/guide", locale)} className={`site-nav-link nav-secondary-start ${guideActive ? "is-active" : ""}`} aria-current={guideActive ? "page" : undefined} onClick={closeMenus}><BookOpen size={17} aria-hidden="true" />{t.guides}</Link>
        </nav>
        <LanguageMenu key={pathname} locale={locale} pathname={pathname} />
        <details key={`mobile-${pathname}`} className="mobile-menu nav-disclosure lg:hidden" onKeyDown={escapeMenu}
          onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) event.currentTarget.removeAttribute("open"); }}>
          <summary aria-label={t.openMenu}><Menu size={22} aria-hidden="true" /></summary>
          <nav aria-label={t.mobileNav} className="mobile-nav-panel">
            <Link className="mobile-all-tools" href={localePath("/tools", locale)} onClick={closeMenus} aria-current={normalized === "/tools" ? "page" : undefined}><Grid2X2 size={19} aria-hidden="true" /><span>{copy.all}</span><ArrowUpRight size={17} aria-hidden="true" /></Link>
            {toolGroups.map(group => <details className="mobile-category" key={group}>
              <summary><span>{copy.groups[group]}</span><ChevronDown size={16} aria-hidden="true" /></summary>
              <div>{tools.filter(tool => tool.group === group).map(tool => <Link key={tool.id} href={localePath(tool.path, locale)} onClick={closeMenus}
                aria-current={isToolActive(normalized, tool.path) ? "page" : undefined}><tool.icon size={18} strokeWidth={1.7} aria-hidden="true" /><span>{tool.label}</span></Link>)}</div>
            </details>)}
            <div className="mobile-nav-resources"><span>{copy.resources}</span>
              <Link href={localePath("/guide", locale)} onClick={closeMenus} aria-current={guideActive ? "page" : undefined}><BookOpen size={18} aria-hidden="true" />{t.guides}</Link>
              <Link href={localePath("/faq", locale)} onClick={closeMenus} aria-current={normalized === "/faq" ? "page" : undefined}><CircleHelp size={18} aria-hidden="true" />{t.faq}</Link>
            </div>
          </nav>
        </details>
      </div>
    </div>
  </header>;
}
