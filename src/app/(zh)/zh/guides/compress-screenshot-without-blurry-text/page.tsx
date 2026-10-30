import { ChineseCompressionGuide } from "@/components/guides/ChineseCompressionGuide";
import guides from "@/lib/guides/translations/zh.json";
import { createMetadata } from "@/lib/seo/metadata";
const slug = "compress-screenshot-without-blurry-text";
export const metadata = createMetadata({ ...guides[slug], path: `/zh/guides/${slug}`, type: "article" });
export default function Page() { return <ChineseCompressionGuide slug={slug} />; }
