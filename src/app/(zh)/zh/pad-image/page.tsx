import { ImageToolPage } from "@/components/image-tools/ImageToolPage";
import { toolCatalog } from "@/lib/image-tools/catalog";
import { createMetadata } from "@/lib/seo/metadata";
const [title, description] = toolCatalog.padding["zh"];
export const metadata = createMetadata({ title, description, path: "/zh/pad-image" });
export default function Page() { return <ImageToolPage tool="padding" locale="zh" />; }
