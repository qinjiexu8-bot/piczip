import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { createMetadata } from "@/lib/seo/metadata";
import { zhBaseBullets, zhDefaultGuide, zhSharedFaqs } from "@/lib/seo/zh-landing-pages";

export const metadata = createMetadata({
  title: "JPG 图片压缩 - 免费，不上传",
  description: "免费压缩 JPG 图片，无需注册，不上传服务器。直接在浏览器中减小照片体积并设置目标 KB 大小。",
  path: "/zh/compress-jpg",
});

export default function Page() {
  return (
    <SeoLandingPage
      locale="zh"
      title="免费压缩 JPG 图片，不上传服务器"
      description="在浏览器中减小 JPG 照片体积，适合报名照、邮件附件、网站图片和有文件大小限制的上传表单。"
      bullets={["针对照片和相机图片的 JPG 压缩。", ...zhBaseBullets]}
      guideTitle="如何压缩 JPG 图片"
      guide={zhDefaultGuide}
      faqs={zhSharedFaqs}
      breadcrumbLabel="压缩 JPG"
    />
  );
}
