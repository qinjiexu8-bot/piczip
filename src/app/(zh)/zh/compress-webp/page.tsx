import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { createMetadata } from "@/lib/seo/metadata";
import { zhBaseBullets, zhDefaultGuide, zhSharedFaqs } from "@/lib/seo/zh-landing-pages";

export const metadata = createMetadata({
  title: "WebP 图片压缩 - 免费，不上传",
  description: "免费压缩 WebP 图片，无需注册，不上传服务器。适合网站图片、产品图和页面性能优化。",
  path: "/zh/compress-webp",
});

export default function Page() {
  return (
    <SeoLandingPage
      locale="zh"
      title="压缩 WebP 图片，让网页加载更快"
      description="在浏览器中减小 WebP 文件体积，适合现代网站图片、产品图、博客配图和重复图片优化任务。"
      bullets={["适合现代网站图片的 WebP 压缩。", ...zhBaseBullets]}
      guideTitle="如何压缩 WebP 图片"
      guide={zhDefaultGuide}
      faqs={zhSharedFaqs}
      breadcrumbLabel="压缩 WebP"
    />
  );
}
