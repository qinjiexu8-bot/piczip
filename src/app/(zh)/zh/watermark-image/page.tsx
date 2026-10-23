import { ImageToolPage } from "@/components/image-tools/ImageToolPage";
import { toolCatalog } from "@/lib/image-tools/catalog";
import { createMetadata } from "@/lib/seo/metadata";
const [title, description] = toolCatalog.watermark["zh"];
export const metadata = createMetadata({ title, description, path: "/zh/watermark-image" });
export default function Page() { return <ImageToolPage tool="watermark" locale="zh" />; }
