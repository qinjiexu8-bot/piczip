import { ToolGuideArticle, toolGuideMetadata } from "@/components/guides/ToolGuideArticle";

export const metadata = toolGuideMetadata("stitch", "zh");

export default function Page() {
  return <ToolGuideArticle tool="stitch" locale="zh" />;
}
