import { CanvasGuideArticle } from "@/components/guides/CanvasGuideArticle";
import { canvasGuide } from "@/lib/guides/canvas-guides";
import { createMetadata } from "@/lib/seo/metadata";
const guide = canvasGuide("en", "padding");
export const metadata = createMetadata({ title: guide.title, description: guide.description, path: "/guides/add-image-padding-and-expand-canvas", type: "article" });
export default function Page() { return <CanvasGuideArticle locale="en" kind="padding" />; }
