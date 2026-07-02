import Link from "next/link";
import { ContentPage } from "@/components/site/ContentPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "图片压缩指南 - 不上传，压缩到指定大小",
  description: "了解如何不上传服务器压缩图片，选择 JPG、PNG、WebP，并把图片压缩到指定 KB 大小。",
  path: "/zh/guide",
});

export default function Page() {
  return (
    <ContentPage
      title="图片压缩指南"
      description="这是一份实用图片压缩指南，帮助你在表单、网站、邮件和社媒场景中减少图片体积，同时保留足够清晰度。"
    >
      <h2>先选择合适格式</h2>
      <p>
        照片通常适合 JPG，截图和透明图适合 PNG，网站图片可以优先考虑 WebP。如果目标是尽量减小体积，
        照片可以优先尝试 JPG 或 WebP，需要透明背景时再保留 PNG。
      </p>
      <h2>谨慎使用指定大小</h2>
      <p>100KB 这类严格限制很实用，但大图可能需要降低质量或缩小尺寸才能达到目标。</p>
      <h2>优先缩小尺寸，再大幅降低质量</h2>
      <p>
        如果图片压缩后仍然太大，可以先降低最大宽度，再继续降低质量。很多时候，适当缩小尺寸比把质量拉得很低更清晰。
      </p>
      <h2>隐私图片优先本地处理</h2>
      <p>证件照、申请材料、内部截图、合同图片等隐私文件，适合用浏览器本地压缩，减少上传风险。</p>
      <h2>重复任务用批量 ZIP</h2>
      <p>产品图、博客配图和网站素材可以统一设置目标大小，压缩完成后打包 ZIP 下载，效率更高。</p>
      <p>
        准备开始？<Link className="font-black text-teal-700" href="/zh">打开压缩工具</Link>。
      </p>
    </ContentPage>
  );
}
