import { ChineseCompressionGuide } from "@/components/guides/ChineseCompressionGuide";
import guides from "@/lib/guides/translations/zh.json";
import { createMetadata } from "@/lib/seo/metadata";
const slug = "why-compressed-image-is-still-too-large";
export const metadata = createMetadata({ ...guides[slug], path: `/zh/guides/${slug}`, type: "article" });
export default function Page() { return <ChineseCompressionGuide slug={slug} />; }
