import compressionGuides from "@/lib/guides/translations/zh.json";
import { ToolGuideLinks } from "@/components/guides/ToolGuideLinks";
import Link from "next/link";
import { ContentPage } from "@/components/site/ContentPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "图片处理指南 - 压缩、尺寸调整、格式转换与拼接",
  description: "从图片压缩到尺寸调整、格式转换和多图拼接，查看操作步骤、参数示例与常见问题。",
  path: "/zh/guide",
});

export default function Page() {
  return (
    <ContentPage
      title="图片处理指南"
      description="从尺寸、格式、排版到文件体积，按你的任务选择指南。每篇都有具体步骤与实际示例。"
      locale="zh"
      breadcrumbLabel="指南"
    >
      <ToolGuideLinks locale="zh" />
      <h2 className="text-xl font-semibold text-foreground">压缩场景与问题排查</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(compressionGuides).map(([slug, guide]) => <Link key={slug} data-guide-card href={`/zh/guides/${slug}`} className="rounded-xl border border-black/10 bg-white p-5 hover:border-teal-700/40">
          <h3 className="font-semibold text-foreground">{guide.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{guide.description}</p>
        </Link>)}
      </div>
      <h2 className="text-xl font-semibold text-foreground">图片压缩：先选择合适格式</h2>
      <p>
        照片通常适合 JPG，截图和透明图适合 PNG，网站图片可以优先考虑 WebP。如果目标是尽量减小体积，
        照片可以优先尝试 JPG 或 WebP，需要透明背景时再保留 PNG。
      </p>
      <h2>谨慎使用指定大小</h2>
      <p>
        100KB 这类严格限制很实用，但大图可能需要降低质量或缩小尺寸才能达到目标。第一次处理这类要求，
        可以参考我们用真实图片完成的
        <Link
          className="font-black text-teal-700"
          href="/zh/guides/compress-image-to-100kb-without-uploading"
        >
          图片压缩到 100KB 实测指南
        </Link>
        。
      </p>
      <h2>优先缩小尺寸，再大幅降低质量</h2>
      <p>
        如果图片压缩后仍然太大，可以先降低最大宽度，再继续降低质量。很多时候，适当缩小尺寸比把质量拉得很低更清晰。
      </p>
      <h2>隐私图片优先本地处理</h2>
      <p>证件照、申请材料、内部截图、合同图片等隐私文件，适合用<Link href="/zh/local-image-compressor" className="font-medium text-teal-700 underline">浏览器本地图片压缩</Link>，减少上传风险。</p>
      <h2>重复任务用批量 ZIP</h2>
      <p>产品图、博客配图和网站素材可以统一设置目标大小，压缩完成后打包 ZIP 下载，效率更高。</p>
      <p>
        准备开始？<Link className="font-black text-teal-700" href="/zh">打开压缩工具</Link>。
      </p>
    </ContentPage>
  );
}
