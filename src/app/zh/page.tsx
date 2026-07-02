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
        eyebrow: "不上传 · 无需注册 · 免费使用",
        title: "免费图片压缩工具",
        description:
          "直接在浏览器中压缩 JPG、PNG、WebP 图片。无需账号，不上传服务器，可指定 KB 大小，也能批量打包 ZIP 下载。",
        proofs: [
          ["免费", "无需注册"],
          ["不上传", "文件留在本地"],
          ["100KB", "指定大小预设"],
        ],
        features: [
          {
            icon: "local",
            title: "本地处理",
            text: "图片在浏览器中解码、压缩并导出。",
          },
          {
            icon: "free",
            title: "免费使用",
            text: "核心压缩功能无需订阅、无需积分、无需试用限制。",
          },
          {
            icon: "signup",
            title: "无需注册",
            text: "无需账号或邮箱，打开页面即可开始压缩。",
          },
          {
            icon: "size",
            title: "指定文件大小",
            text: "可设置 50KB、100KB、200KB 或自定义上传限制。",
          },
          {
            icon: "zip",
            title: "批量 ZIP",
            text: "多张图片压缩后可打包成一个 ZIP 下载。",
          },
          {
            icon: "upload",
            title: "不上传",
            text: "PicZip 不会把你的图片文件发送到服务器。",
          },
        ],
        popularTitle: "常用图片压缩任务",
        popularLinks: [
          ["图片压缩到 100KB", "/zh/compress-image-to-100kb"],
          ["图片压缩到 200KB", "/zh/compress-image-to-200kb"],
          ["压缩 JPG", "/zh/compress-jpg"],
          ["批量图片压缩", "/zh/batch-image-compressor"],
          ["图片压缩不上传", "/zh/compress-image-without-upload"],
          ["本地图片压缩", "/zh/local-image-compressor"],
        ],
        privacyTitle: "图片留在你的设备上",
        privacyText:
          "PicZip 在浏览器中处理你选择的图片，不会为了压缩把图片文件上传到服务器，也不保存图片内容或处理历史。",
        guideLink: ["阅读图片压缩指南", "/zh/guide"],
      }}
    />
  );
}
