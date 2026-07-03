import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { createMetadata } from "@/lib/seo/metadata";
import { zhBaseBullets, zhSharedFaqs } from "@/lib/seo/zh-landing-pages";

export const metadata = createMetadata({
  title: "图片压缩到 200KB - 免费，不上传",
  description: "免费将图片压缩到 200KB，无需注册，不上传服务器，支持批量 ZIP 下载。",
  path: "/zh/compress-image-to-200kb",
});

export default function Page() {
  return (
    <SeoLandingPage
      locale="zh"
      title="不上传服务器，把图片压缩到 200KB"
      description="在浏览器中把 JPG、PNG 或 WebP 压缩到 200KB 左右，适合表单上传、网站图片和邮件附件。"
      bullets={["面向常见上传限制的 200KB 目标预设。", ...zhBaseBullets]}
      guideTitle="如何把图片压缩到 200KB"
      guide={[
        "将目标大小设置为 200 KB。",
        "保持 Auto 输出格式，或根据需要选择 JPG、PNG、WebP。",
        "压缩完成后可以单张下载，也可以打包 ZIP 下载。",
      ]}
      faqs={zhSharedFaqs}
      breadcrumbLabel="图片压缩到 200KB"
    />
  );
}
