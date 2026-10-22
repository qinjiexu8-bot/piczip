import { ToolGuideArticle, toolGuideMetadata } from "@/components/guides/ToolGuideArticle";

export const metadata = toolGuideMetadata("convert", "zh");

export default function Page() {
  return <ToolGuideArticle tool="convert" locale="zh" />;
}
