import { ToolGuideArticle, toolGuideMetadata } from "@/components/guides/ToolGuideArticle";

export const metadata = toolGuideMetadata("stitch", "en");

export default function Page() {
  return <ToolGuideArticle tool="stitch" locale="en" />;
}
