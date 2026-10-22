import { ToolGuideArticle, toolGuideMetadata } from "@/components/guides/ToolGuideArticle";

export const metadata = toolGuideMetadata("resize", "zh");

export default function Page() {
  return <ToolGuideArticle tool="resize" locale="zh" />;
}
