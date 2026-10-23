"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { locales, localeNames, languageTags, type Locale } from "@/lib/i18n/config";
import { hasLocalePage, localePath } from "@/lib/i18n/routes";
import { siteMessages } from "@/lib/i18n/messages";

const labels = { en: "EN", zh: "中文", es: "ES", "pt-br": "PT-BR", ja: "日本語" };
export function LanguageMenu({ locale, pathname }: { locale: Locale; pathname: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const copy = siteMessages[locale].common;
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) ref.current?.removeAttribute("open"); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  // Safari does not focus clicked links: a null blur target must not hide them before click.
  return <details className="language-menu" ref={ref}
    onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) event.currentTarget.removeAttribute("open"); }}
    onKeyDown={event => { if (event.key === "Escape") { ref.current?.removeAttribute("open"); ref.current?.querySelector("summary")?.focus(); } }}>
    <summary className="language-link" aria-label={copy.language}><Languages size={14} aria-hidden="true" /><span>{labels[locale]}</span><ChevronDown size={13} aria-hidden="true" /></summary>
    <nav className="language-options" aria-label={copy.language}>
      {locales.map(target => hasLocalePage(pathname, target)
        ? <Link key={target} href={localePath(pathname, target)} hrefLang={languageTags[target]} lang={languageTags[target]} aria-current={target === locale ? "true" : undefined} prefetch={false} onClick={() => ref.current?.removeAttribute("open")}>
            {localeNames[target]}{target === locale && <Check size={15} aria-hidden="true" />}
          </Link>
        : <span key={target} aria-disabled="true" title={copy.unavailable}><span lang={languageTags[target]}>{localeNames[target]}</span><small>{copy.unavailable}</small></span>)}
    </nav>
  </details>;
}
