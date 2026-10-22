import { ToolGuideArticle, toolGuideMetadata } from "@/components/guides/ToolGuideArticle";

export const metadata = toolGuideMetadata("convert", "en");

export default function Page() {
  return <ToolGuideArticle tool="convert" locale="en" />;
}
