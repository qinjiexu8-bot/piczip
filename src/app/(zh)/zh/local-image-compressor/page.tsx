import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { createMetadata } from "@/lib/seo/metadata";
import { zhBaseBullets, zhDefaultGuide, zhSharedFaqs } from "@/lib/seo/zh-landing-pages";

export const metadata = createMetadata({
  title: "本地图片压缩工具 - 免费，不上传",
  description: "浏览器本地图片压缩工具，支持 JPG、PNG、WebP。免费使用，无需注册，不上传服务器。",
  path: "/zh/local-image-compressor",
});

export default function Page() {
  return (
    <SeoLandingPage
      locale="zh"
      title="本地图片压缩工具，适合隐私文件"
      description="在当前设备中本地压缩图片。适合证件照、表单上传、批量下载和严格大小限制。"
      bullets={["直接在浏览器运行，无需把文件上传到第三方服务器。", ...zhBaseBullets]}
      guideTitle="如何使用本地压缩"
      guide={zhDefaultGuide}
      faqs={zhSharedFaqs}
      breadcrumbLabel="本地图片压缩"
    />
  );
}
