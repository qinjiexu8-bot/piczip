import { FeatureRoute, featureMetadata } from '@/components/next-features/FeatureRoute';
import { featureForRoute, featurePaths } from '@/lib/next-features/catalog';
import { ToolsDirectoryPage, toolsDirectoryMetadata } from "@/components/site/ToolsDirectoryPage";
import { notFound } from "next/navigation";
import { isAddedLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/routes";
import { createMetadata } from "@/lib/seo/metadata";
import { ImageToolPage } from "@/components/image-tools/ImageToolPage";
import { InfoPage, infoMetadata } from "@/components/site/InfoPage";

import { toolCatalog } from "@/lib/image-tools/catalog";
const tools = { "pad-image": "padding", "mosaic-image": "mosaic", "watermark-image": "watermark", "crop-image": "crop", "resize-image": "resize", "convert-image": "convert", "stitch-images": "stitch" } as const;
type Props = { params: Promise<{ locale: string; tool: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return [...Object.keys(tools), ...Object.values(featurePaths).map(path => path.slice(1)), "faq", "about", "tools"].map(tool => ({ tool })); }
export async function generateMetadata({ params }: Props) {
  const { locale, tool } = await params;
  if (!isAddedLocale(locale) || (!featureForRoute(tool) && !(tool in tools) && tool !== "faq" && tool !== "about" && tool !== "tools")) notFound();
  const feature = featureForRoute(tool);
  if (feature) return featureMetadata(locale, feature);
  if (tool === "tools") return toolsDirectoryMetadata(locale);
  if (tool === "faq" || tool === "about") return infoMetadata(locale, tool);
  const [title, description] = toolCatalog[tools[tool as keyof typeof tools]][locale];
  return createMetadata({ title, description, path: localePath(`/${tool}`, locale) });
}
export default async function Page({ params }: Props) {
  const { locale, tool } = await params;
  if (!isAddedLocale(locale)) notFound();
  const feature = featureForRoute(tool);
  if (feature) return <FeatureRoute locale={locale} kind={feature} />;
  if (tool === "tools") return <ToolsDirectoryPage locale={locale} />;
  if (tool === "faq" || tool === "about") return <InfoPage locale={locale} kind={tool} />;
  if (!(tool in tools)) notFound();
  return <ImageToolPage locale={locale} tool={tools[tool as keyof typeof tools]} />;
}
