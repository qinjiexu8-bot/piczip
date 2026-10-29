import { CanvasGuideArticle } from "@/components/guides/CanvasGuideArticle";
import { canvasGuide } from "@/lib/guides/canvas-guides";
import { createMetadata } from "@/lib/seo/metadata";
const guide = canvasGuide("zh", "padding");
export const metadata = createMetadata({ title: guide.title, description: guide.description, path: "/zh/guides/add-image-padding-and-expand-canvas", type: "article" });
export default function Page() { return <CanvasGuideArticle locale="zh" kind="padding" />; }
