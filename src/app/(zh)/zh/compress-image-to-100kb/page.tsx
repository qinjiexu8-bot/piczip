import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { createMetadata } from "@/lib/seo/metadata";
import { zhBaseBullets, zhSharedFaqs } from "@/lib/seo/zh-landing-pages";

export const metadata = createMetadata({
  title: "图片压缩到 100KB - 免费，不上传",
  description: "免费将图片压缩到 100KB，无需注册，不上传服务器。支持 JPG、PNG、WebP 和指定 KB 大小。",
  path: "/zh/compress-image-to-100kb",
});

export default function Page() {
  return (
    <SeoLandingPage
      locale="zh"
      title="在浏览器中把图片压缩到 100KB"
      description="设置 100KB 目标大小，在不上传图片的情况下减小文件体积。适合头像、报名表、邮件附件和严格上传限制。"
      bullets={["面向严格上传表单的 100KB 目标预设。", ...zhBaseBullets]}
      guideTitle="如何把图片压缩到 100KB"
      guide={[
        "将目标大小设置为 100 KB。",
        "照片优先选择 JPG 或 WebP 输出，通常更容易压小。",
        "如果仍然超过 100KB，可以降低最大宽度后重新压缩。",
      ]}
      faqs={zhSharedFaqs}
      breadcrumbLabel="图片压缩到 100KB"
    />
  );
}
