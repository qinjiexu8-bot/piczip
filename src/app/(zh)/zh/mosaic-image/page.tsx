import { ImageToolPage } from "@/components/image-tools/ImageToolPage";
import { toolCatalog } from "@/lib/image-tools/catalog";
import { createMetadata } from "@/lib/seo/metadata";
const [title, description] = toolCatalog.mosaic["zh"];
export const metadata = createMetadata({ title, description, path: "/zh/mosaic-image" });
export default function Page() { return <ImageToolPage tool="mosaic" locale="zh" />; }
