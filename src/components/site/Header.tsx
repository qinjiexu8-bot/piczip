"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ImageIcon, Menu } from "lucide-react";
import { alternateLanguagePath, isChinesePath, localizedHref, stripLocale } from "@/lib/i18n/routes";

export function Header() {
  const pathname = usePathname();
  const isChinese = isChinesePath(pathname);
  const normalized = stripLocale(pathname);
  const items = [
    { label: isChinese ? "图片压缩" : "Compress", href: localizedHref(pathname, "/"), active: normalized === "/" || normalized.startsWith("/compress") || normalized === "/local-image-compressor" || normalized === "/batch-image-compressor" },
    { label: isChinese ? "尺寸调整" : "Resize", href: localizedHref(pathname, "/resize-image"), active: normalized === "/resize-image" },
    { label: isChinese ? "格式转换" : "Convert", href: localizedHref(pathname, "/convert-image"), active: normalized === "/convert-image" },
    { label: isChinese ? "图片拼接" : "Stitch", href: localizedHref(pathname, "/stitch-images"), active: normalized === "/stitch-images" },
    { label: isChinese ? "使用指南" : "Guides", href: localizedHref(pathname, "/guide"), active: normalized === "/guide" || normalized.startsWith("/guides/") },
    { label: isChinese ? "常见问题" : "FAQ", href: localizedHref(pathname, "/faq"), active: normalized === "/faq" },
  ];

  return (
    <header className="site-header">
      <Link href={localizedHref(pathname, "/")} className="brand" aria-label={isChinese ? "PicZip 首页" : "PicZip home"}>
        <span className="brand-mark"><ImageIcon size={23} strokeWidth={1.8} /></span>
        PicZip<span className="brand-dot">.</span>
      </Link>
      <div className="flex items-center gap-3 sm:gap-7">
        <nav aria-label={isChinese ? "主导航" : "Main navigation"} className="hidden items-center gap-5 lg:gap-7 md:flex">
          {items.map(item => (
            <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined} className={`site-nav-link ${item.active ? "is-active" : ""}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="language-link" href={alternateLanguagePath(pathname)} hrefLang={isChinese ? "en" : "zh"} aria-label={isChinese ? "Switch to English" : "切换为中文"}>
          {isChinese ? "EN" : "中文"}<ChevronDown size={13} aria-hidden="true" />
        </Link>
        <details className="mobile-menu md:hidden">
          <summary aria-label={isChinese ? "打开导航菜单" : "Open navigation menu"}><Menu size={22} /></summary>
          <nav aria-label={isChinese ? "手机导航" : "Mobile navigation"}>
            {items.map(item => (
              <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined} onClick={event => event.currentTarget.closest("details")?.removeAttribute("open")}>
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
