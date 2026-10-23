import { WatermarkGuideArticle } from "@/components/guides/WatermarkGuideArticle";
import { watermarkMessages } from "@/lib/image-tools/watermark-messages";
import { createMetadata } from "@/lib/seo/metadata";
const t=watermarkMessages["en"];
export const metadata=createMetadata({title:t.guide,description:t.description,path:"/guides/batch-watermark-and-rename-images",type:"article"});
export default function Page(){return <WatermarkGuideArticle locale="en"/>;}
