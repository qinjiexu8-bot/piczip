"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isChinesePath, localizedHref } from "@/lib/i18n/routes";

export function Footer() {
  const pathname = usePathname();
  const isChinese = isChinesePath(pathname);
  const footerLinks = [
    [isChinese ? "指南" : "Guide", localizedHref(pathname, "/guide")],
    ["FAQ", localizedHref(pathname, "/faq")],
    [isChinese ? "关于" : "About", localizedHref(pathname, "/about")],
    [isChinese ? "隐私" : "Privacy", localizedHref(pathname, "/privacy")],
    [isChinese ? "条款" : "Terms", localizedHref(pathname, "/terms")],
  ];

  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-slate-600 sm:px-8 md:flex-row md:items-center md:justify-between">
      <p>
        {isChinese
          ? "PicZip 在浏览器本地完成图片压缩。"
          : "PicZip runs image compression locally in your browser."}
      </p>
      <nav className="flex flex-wrap gap-x-5 gap-y-2 font-bold">
        {footerLinks.map(([label, href]) => (
          <Link key={href} href={href} className="hover:text-foreground">
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
