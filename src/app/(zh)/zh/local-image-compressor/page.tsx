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
      title="适合隐私文件的本地图片压缩工具"
      description="在自己的设备上完成图片压缩，适合隐私文件、重复上传任务、网站图片、批量下载和指定大小限制。"
      bullets={["在浏览器中运行，不需要把图片上传到服务器。", ...zhBaseBullets]}
      guideTitle="如何使用本地图片压缩"
      guide={zhDefaultGuide}
      faqs={zhSharedFaqs}
    />
  );
}
