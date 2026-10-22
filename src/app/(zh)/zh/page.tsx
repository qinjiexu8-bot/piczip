import { HomePage } from "@/components/site/HomePage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "免费图片压缩工具 - 不上传，无需注册",
  description:
    "在浏览器中压缩 JPG、PNG、WebP 图片。免费使用，无需注册，不上传服务器，支持指定 KB 大小和批量 ZIP 下载。",
  path: "/zh",
});

export default function Page() {
  return (
    <HomePage
      copy={{
        locale: "zh",
        title: "免费图片压缩工具",
        description:
          "压缩 JPG、PNG、WebP，按需设置目标大小和画质，支持单张或批量 ZIP 下载。",
        popularTitle: "常用图片压缩任务",
        popularLinks: [
          ["图片压缩到 100KB", "/zh/compress-image-to-100kb"],
          ["图片压缩到 200KB", "/zh/compress-image-to-200kb"],
          ["压缩 JPG", "/zh/compress-jpg"],
          ["批量图片压缩", "/zh/batch-image-compressor"],
          ["压缩 PNG", "/zh/compress-png"],
          ["压缩 WebP", "/zh/compress-webp"],
        ],
        helpTitle: "怎样获得更小的图片？",
        helpText:
          "先设置目标大小；若结果仍偏大，可以调低最大宽度或更换格式。指南中有各项设置的说明与示例。",
        guideLink: ["阅读图片压缩指南", "/zh/guide"],
      }}
    />
  );
}
