import { ImageToolPage } from "@/components/image-tools/ImageToolPage";
import { toolCatalog } from "@/lib/image-tools/catalog";
import { createMetadata } from "@/lib/seo/metadata";
const tool = toolCatalog.stitch;
export const metadata = createMetadata({ title: tool.en[0], description: tool.en[1], path: "/stitch-images" });
export default function Page() { return <ImageToolPage tool="stitch" locale="en" />; }
