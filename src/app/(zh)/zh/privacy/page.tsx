import { ContentPage } from "@/components/site/ContentPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "隐私政策",
  description: "PicZip 隐私政策。图片在浏览器本地压缩，不上传服务器进行处理。",
  path: "/zh/privacy",
});

export default function Page() {
  return (
    <ContentPage
      title="隐私政策"
      description="PicZip 围绕浏览器本地处理、清晰隐私边界和最少数据收集设计。"
      locale="zh"
      breadcrumbLabel="隐私"
    >
      <h2>图片文件</h2>
      <p>PicZip 在浏览器中压缩你选择的图片。图片文件不会上传到 PicZip 服务器进行压缩，也不会被 PicZip 保存。</p>
      <h2>分析数据</h2>
      <p>我们使用 Vercel Web Analytics 统计页面访问量、访问来源以及浏览器和设备类型。页面访问数据会发送至 Vercel，用于汇总统计，不使用第三方 Cookie。我们不会向统计服务发送图片文件、文件名或图片哈希。</p>
      <p>详细说明见 <a className="font-medium text-teal-700 underline underline-offset-4" href="https://vercel.com/docs/analytics/privacy-policy">Vercel Web Analytics 隐私文档</a>。</p>
      <h2>浏览器存储</h2>
      <p>压缩结果只在页面打开期间保存在浏览器内存中。后续离线能力也应只缓存应用资源，不缓存用户图片，除非页面明确说明。</p>
    </ContentPage>
  );
}
