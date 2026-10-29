import { ImageToolPage } from "@/components/image-tools/ImageToolPage";
import { toolCatalog } from "@/lib/image-tools/catalog";
import { createMetadata } from "@/lib/seo/metadata";
const [title, description] = toolCatalog.padding["en"];
export const metadata = createMetadata({ title, description, path: "/pad-image" });
export default function Page() { return <ImageToolPage tool="padding" locale="en" />; }
