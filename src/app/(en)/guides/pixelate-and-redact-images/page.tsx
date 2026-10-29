import { CanvasGuideArticle } from "@/components/guides/CanvasGuideArticle";
import { canvasGuide } from "@/lib/guides/canvas-guides";
import { createMetadata } from "@/lib/seo/metadata";
const guide = canvasGuide("en", "mosaic");
export const metadata = createMetadata({ title: guide.title, description: guide.description, path: "/guides/pixelate-and-redact-images", type: "article" });
export default function Page() { return <CanvasGuideArticle locale="en" kind="mosaic" />; }
