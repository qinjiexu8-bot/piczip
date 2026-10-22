import { ImageToolPage } from "@/components/image-tools/ImageToolPage";
import { toolCatalog } from "@/lib/image-tools/catalog";
import { createMetadata } from "@/lib/seo/metadata";
const tool = toolCatalog.stitch;
export const metadata = createMetadata({ title: tool.zh[0], description: tool.zh[1], path: "/zh/stitch-images" });
export default function Page() { return <ImageToolPage tool="stitch" locale="zh" />; }
