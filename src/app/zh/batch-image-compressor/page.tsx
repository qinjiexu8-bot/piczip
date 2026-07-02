import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { createMetadata } from "@/lib/seo/metadata";
import { zhBaseBullets, zhSharedFaqs } from "@/lib/seo/zh-landing-pages";

export const metadata = createMetadata({
  title: "批量图片压缩 - 免费 ZIP 下载",
  description: "免费批量压缩图片并下载 ZIP。支持 JPG、PNG、WebP，浏览器本地处理，不上传服务器。",
  path: "/zh/batch-image-compressor",
});

export default function Page() {
  return (
    <SeoLandingPage
      locale="zh"
      title="批量压缩图片，并下载一个 ZIP"
      description="一次选择多张图片，在浏览器本地批量压缩，并将结果打包成 ZIP 下载。适合网站素材、产品图、邮件附件和重复上传任务。"
      bullets={["一次最多处理 50 张图片并下载一个 ZIP。", ...zhBaseBullets]}
      guideTitle="如何批量压缩图片"
      guide={[
        "把多张 JPG、PNG 或 WebP 图片拖入压缩器。",
        "统一设置目标大小、质量和输出格式。",
        "压缩完成后单张下载，或一次性下载 ZIP 文件。",
      ]}
      faqs={zhSharedFaqs}
    />
  );
}
