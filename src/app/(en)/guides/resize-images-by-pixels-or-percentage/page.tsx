import { ToolGuideArticle, toolGuideMetadata } from "@/components/guides/ToolGuideArticle";

export const metadata = toolGuideMetadata("resize", "en");

export default function Page() {
  return <ToolGuideArticle tool="resize" locale="en" />;
}
