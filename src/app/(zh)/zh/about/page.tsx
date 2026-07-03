import { ContentPage } from "@/components/site/ContentPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "关于 PicZip",
  description: "PicZip 是一个免费的浏览器图片压缩工具，不上传图片，无需注册账号。",
  path: "/zh/about",
});

export default function Page() {
  return (
    <ContentPage title="关于 PicZip" description="PicZip 是一个小而实用的免费图片压缩工具，专注浏览器本地处理。">
      <h2>为什么做 PicZip</h2>
      <p>很多图片压缩工具需要上传文件。PicZip 优先选择浏览器本地处理，也不要求用户先注册账号，让隐私图片处理更安心。</p>
      <h2>当前重点</h2>
      <p>第一版专注图片压缩、指定大小、批量 ZIP 下载和清晰的隐私边界。后续再逐步扩展更多图片工具。</p>
      <h2>联系我们</h2>
      <p>
        如需反馈问题、提出建议或寻求支持，请发送邮件至{" "}
        <a className="font-black text-teal-700" href="mailto:support@piczip.app">
          support@piczip.app
        </a>
        。
      </p>
    </ContentPage>
  );
}
