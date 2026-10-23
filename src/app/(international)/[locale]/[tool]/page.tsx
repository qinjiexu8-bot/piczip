import { notFound } from "next/navigation";
import { isAddedLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/routes";
import { siteMessages } from "@/lib/i18n/messages";
import { createMetadata } from "@/lib/seo/metadata";
import { ImageToolPage } from "@/components/image-tools/ImageToolPage";
import { LocalizedFaqPage } from "@/components/site/LocalizedFaqPage";

import { toolCatalog } from "@/lib/image-tools/catalog";
const tools = { "crop-image": "crop", "resize-image": "resize", "convert-image": "convert", "stitch-images": "stitch" } as const;
type Props = { params: Promise<{ locale: string; tool: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return [...Object.keys(tools), "faq"].map(tool => ({ tool })); }
export async function generateMetadata({ params }: Props) {
  const { locale, tool } = await params;
  if (!isAddedLocale(locale) || (!(tool in tools) && tool !== "faq")) notFound();
  const t = siteMessages[locale];
  const [title, description] = tool === "faq" ? [t.common.faq, t.home.faqDescription] : toolCatalog[tools[tool as keyof typeof tools]][locale];
  return createMetadata({ title, description, path: localePath(`/${tool}`, locale) });
}
export default async function Page({ params }: Props) {
  const { locale, tool } = await params;
  if (!isAddedLocale(locale)) notFound();
  if (tool === "faq") return <LocalizedFaqPage locale={locale} />;
  if (!(tool in tools)) notFound();
  return <ImageToolPage locale={locale} tool={tools[tool as keyof typeof tools]} />;
}
