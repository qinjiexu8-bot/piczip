import { ToolsDirectoryPage, toolsDirectoryMetadata } from "@/components/site/ToolsDirectoryPage";
import { notFound } from "next/navigation";
import { isAddedLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/routes";
import { createMetadata } from "@/lib/seo/metadata";
import { ImageToolPage } from "@/components/image-tools/ImageToolPage";
import { InfoPage, infoMetadata } from "@/components/site/InfoPage";

import { toolCatalog } from "@/lib/image-tools/catalog";
const tools = { "watermark-image": "watermark", "crop-image": "crop", "resize-image": "resize", "convert-image": "convert", "stitch-images": "stitch" } as const;
type Props = { params: Promise<{ locale: string; tool: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return [...Object.keys(tools), "faq", "about", "tools"].map(tool => ({ tool })); }
export async function generateMetadata({ params }: Props) {
  const { locale, tool } = await params;
  if (!isAddedLocale(locale) || (!(tool in tools) && tool !== "faq" && tool !== "about" && tool !== "tools")) notFound();
  if (tool === "tools") return toolsDirectoryMetadata(locale);
  if (tool === "faq" || tool === "about") return infoMetadata(locale, tool);
  const [title, description] = toolCatalog[tools[tool as keyof typeof tools]][locale];
  return createMetadata({ title, description, path: localePath(`/${tool}`, locale) });
}
export default async function Page({ params }: Props) {
  const { locale, tool } = await params;
  if (!isAddedLocale(locale)) notFound();
  if (tool === "tools") return <ToolsDirectoryPage locale={locale} />;
  if (tool === "faq" || tool === "about") return <InfoPage locale={locale} kind={tool} />;
  if (!(tool in tools)) notFound();
  return <ImageToolPage locale={locale} tool={tools[tool as keyof typeof tools]} />;
}
