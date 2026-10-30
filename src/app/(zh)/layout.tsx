import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";
import { siteConfig } from "@/lib/seo/site";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  display: "swap",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "PicZip - 免费图片压缩工具",
    template: `%s | ${siteConfig.name}`,
  },
  description: "在浏览器中压缩 JPG、PNG、WebP 图片。免费使用，无需注册，不上传服务器，支持指定 KB 大小和批量 ZIP 下载。",
  applicationName: siteConfig.name,
  keywords: [
    "图片压缩",
    "压缩图片",
    "本地图片压缩",
    "不上传压缩图片",
    "图片压缩到 100KB",
  ],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={notoSans.variable}>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
