import { notFound } from "next/navigation";
import { TranslatedGuideArticle } from "@/components/guides/TranslatedGuideArticle";
import { isAddedLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/routes";
import { guideSlugs } from "@/lib/guides/guide-slugs";
import { isGuideSlug, getTranslatedGuide } from "@/lib/guides/translated-guides";
import { createMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string; slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return guideSlugs.map(slug => ({ slug })); }
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  if (!isAddedLocale(locale) || !isGuideSlug(slug)) notFound();
  const guide = getTranslatedGuide(locale, slug);
  return createMetadata({ title: guide.title, description: guide.description, path: localePath(`/guides/${slug}`, locale), type: "article" });
}
export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  if (!isAddedLocale(locale) || !isGuideSlug(slug)) notFound();
  return <TranslatedGuideArticle locale={locale} slug={slug} />;
}
