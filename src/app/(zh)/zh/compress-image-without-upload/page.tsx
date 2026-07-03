import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { createMetadata } from "@/lib/seo/metadata";
import { zhBaseBullets, zhSharedFaqs } from "@/lib/seo/zh-landing-pages";

export const metadata = createMetadata({
  title: "图片压缩不上传服务器 - 免费使用",
  description: "在浏览器中压缩图片，不上传服务器。适合证件照、表单图片、内部截图和隐私照片。",
  path: "/zh/compress-image-without-upload",
});

export default function Page() {
  return (
    <SeoLandingPage
      locale="zh"
      title="压缩图片，不上传服务器"
      description="PicZip 面向隐私图片压缩场景。你选择的图片在当前浏览器中解码和压缩，不需要发送到远程服务器。"
      bullets={["适合证件照、表单图片、内部截图和隐私照片。", ...zhBaseBullets]}
      guideTitle="本地压缩如何工作"
      guide={[
        "你只授权浏览器读取自己选择的图片文件。",
        "PicZip 在浏览器 worker 中完成压缩，尽量保持页面响应流畅。",
        "压缩结果由你下载，站点不保存图片内容或处理历史。",
      ]}
      faqs={zhSharedFaqs}
    />
  );
}
