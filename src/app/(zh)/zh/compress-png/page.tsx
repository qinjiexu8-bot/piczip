import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { createMetadata } from "@/lib/seo/metadata";
import { zhBaseBullets, zhDefaultGuide, zhSharedFaqs } from "@/lib/seo/zh-landing-pages";

export const metadata = createMetadata({
  title: "PNG 图片压缩 - 免费，不上传",
  description: "免费压缩 PNG 图片，无需注册，不上传服务器。适合截图、透明图和网站素材。",
  path: "/zh/compress-png",
});

export default function Page() {
  return (
    <SeoLandingPage
      locale="zh"
      title="压缩 PNG 图片，文件保留在本地"
      description="减小 PNG 文件体积，适合截图、透明图片、UI 图和网站素材。压缩在浏览器中完成，图片不会上传服务器。"
      bullets={["适合截图和透明背景图片的 PNG 压缩。", ...zhBaseBullets]}
      guideTitle="如何压缩 PNG 图片"
      guide={zhDefaultGuide}
      faqs={zhSharedFaqs}
      breadcrumbLabel="压缩 PNG"
    />
  );
}
