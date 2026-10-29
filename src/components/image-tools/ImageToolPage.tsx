import { canvasGuidePath } from "@/lib/guides/canvas-guides";
import canvasMessages from "@/lib/image-tools/canvas-messages.json";
import Link from "next/link";
import { watermarkMessages } from "@/lib/image-tools/watermark-messages";
import { watermarkGuidePath } from "@/lib/guides/watermark-guide";
import { localePath } from "@/lib/i18n/routes";
import { CropRelatedLinks } from "./CropRelatedLinks";
import type { Locale } from "@/lib/i18n/config";
import { ToolIntro } from "@/components/site/ToolIntro";
import { Header } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ImageToolApp } from "./ImageToolApp";
import { ToolLinks } from "./ToolLinks";
import { toolCatalog } from "@/lib/image-tools/catalog";
import type { ToolKind } from "@/lib/image-tools/types";
export function ImageToolPage({ tool, locale }: { tool: ToolKind; locale: Locale }) {
  const [title, description] = toolCatalog[tool][locale];
  return <div className="grain flex min-h-screen flex-col overflow-x-clip"><Header /><main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-7 sm:px-8">
    <ToolIntro title={title} description={description} />
    <ImageToolApp key={`${tool}-${locale}`} tool={tool} locale={locale} /><ToolLinks locale={locale} current={tool} />
    {(tool === "padding" || tool === "mosaic") && <aside className="my-6 rounded-xl border border-black/10 bg-white p-5"><Link className="text-teal-700 underline underline-offset-4" href={localePath(canvasGuidePath(tool), locale)}>{canvasMessages[locale][tool].guide} →</Link></aside>}
    {tool === "watermark" && <aside className="my-6 rounded-xl border border-black/10 bg-white p-5"><Link className="text-teal-700 underline underline-offset-4" href={localePath(watermarkGuidePath,locale)}>{watermarkMessages[locale].guide} →</Link></aside>}
    {tool === "crop" && <CropRelatedLinks locale={locale} fromTool />}
  </main><SiteFooter locale={locale} /></div>;
}
