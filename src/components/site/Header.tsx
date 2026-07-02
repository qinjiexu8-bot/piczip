"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { alternateLanguagePath, isChinesePath, localizedHref, stripLocale } from "@/lib/i18n/routes";

export function Header() {
  const pathname = usePathname();
  const isChinese = isChinesePath(pathname);
  const normalizedPath = stripLocale(pathname);
  const languageHref = alternateLanguagePath(pathname);
  const languageLabel = isChinese ? "EN" : "ZH";
  const navItems = [
    {
      label: isChinese ? "压缩" : "Compress",
      href: localizedHref(pathname, "/"),
      active:
        normalizedPath === "/" ||
        normalizedPath.startsWith("/compress") ||
        normalizedPath === "/local-image-compressor" ||
        normalizedPath === "/batch-image-compressor",
    },
    { label: isChinese ? "指南" : "Guide", href: localizedHref(pathname, "/guide"), active: normalizedPath === "/guide" },
    { label: "FAQ", href: localizedHref(pathname, "/faq"), active: normalizedPath === "/faq" },
    { label: isChinese ? "关于" : "About", href: localizedHref(pathname, "/about"), active: normalizedPath === "/about" },
    { label: isChinese ? "隐私" : "Privacy", href: localizedHref(pathname, "/privacy"), active: normalizedPath === "/privacy" },
  ];

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-7 sm:px-8">
      <Link href="/" className="flex items-center gap-3 font-black text-2xl tracking-normal">
        <span className="grid size-11 place-items-center rounded-xl border-2 border-foreground bg-[var(--lime)] shadow-[4px_4px_0_var(--foreground)]">
          <Zap className="size-5" strokeWidth={3} />
        </span>
        PicZip
      </Link>

      <nav className="hidden items-center gap-1 rounded-full border border-black/10 bg-[rgba(255,253,247,0.78)] p-1.5 backdrop-blur md:flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            className={navLinkClass(item.active)}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
        <Link className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-black/5" href={languageHref} hrefLang={isChinese ? "en" : "zh"}>
          {languageLabel}
        </Link>
      </nav>
    </header>
  );
}

function navLinkClass(active: boolean) {
  return active
    ? "rounded-full bg-foreground px-4 py-2 text-sm font-bold text-white"
    : "rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-black/5";
}
