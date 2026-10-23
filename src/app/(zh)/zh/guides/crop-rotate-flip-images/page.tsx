import { CropGuideArticle } from "@/components/guides/CropGuideArticle";
import { cropGuides, cropGuidePath } from "@/lib/guides/crop-guide";
import { localePath } from "@/lib/i18n/routes";
import { createMetadata } from "@/lib/seo/metadata";
const t = cropGuides["zh"];
export const metadata = createMetadata({ title: t.title, description: t.description, path: localePath(cropGuidePath, "zh"), type: "article" });
export default function Page() { return <CropGuideArticle locale="zh" />; }
