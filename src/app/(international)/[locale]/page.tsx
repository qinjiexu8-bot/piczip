import { notFound } from "next/navigation";
import { HomePage } from "@/components/site/HomePage";
import { isAddedLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/routes";
import { siteMessages } from "@/lib/i18n/messages";
import { createMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isAddedLocale(locale)) notFound();
  const t = siteMessages[locale].home;
  return createMetadata({ title: t.title, description: t.description, path: localePath("/", locale) });
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isAddedLocale(locale)) notFound();
  const { home, common } = siteMessages[locale];
  return <HomePage copy={{ locale, ...home,
    popularLinks: [[common.resize, localePath("/resize-image", locale)], [common.convert, localePath("/convert-image", locale)], [common.stitch, localePath("/stitch-images", locale)], [common.faq, localePath("/faq", locale)]],
    guideLink: [home.guideLabel, localePath("/guide", locale)],
  }} />;
}
