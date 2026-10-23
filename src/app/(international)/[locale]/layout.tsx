import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { notFound } from "next/navigation";
import { addedLocales, isAddedLocale, languageTags } from "@/lib/i18n/config";
import "../../globals.css";

const font = Noto_Sans({ variable: "--font-noto-sans", display: "swap", subsets: ["latin"] });
export const metadata: Metadata = { metadataBase: new URL("https://piczip.app"), title: { default: "PicZip", template: "%s | PicZip" }, icons: { icon: "/icon.svg", shortcut: "/favicon.ico" } };
export const dynamicParams = false;
export function generateStaticParams() { return addedLocales.map(locale => ({ locale })); }
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAddedLocale(locale)) notFound();
  return <html lang={languageTags[locale]} className={font.variable}><body className="min-h-full flex flex-col">{children}<Analytics /></body></html>;
}
