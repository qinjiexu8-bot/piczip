import { ToolIntro } from "@/components/site/ToolIntro";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ImageToolApp } from "./ImageToolApp";
import { ToolLinks } from "./ToolLinks";
import { toolCatalog } from "@/lib/image-tools/catalog";
import type { ToolKind } from "@/lib/image-tools/types";
export function ImageToolPage({ tool, locale }: { tool: ToolKind; locale: "en" | "zh" }) {
  const [title, description] = toolCatalog[tool][locale];
  return <div className="grain flex min-h-screen flex-col overflow-x-clip"><Header /><main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-7 sm:px-8">
    <ToolIntro title={title} description={description} />
    <ImageToolApp key={`${tool}-${locale}`} tool={tool} locale={locale} /><ToolLinks locale={locale} current={tool} />
  </main><Footer /></div>;
}
