import { ContentPage } from "@/components/site/ContentPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "使用条款",
  description: "PicZip 使用条款，适用于免费的浏览器图片压缩工具。",
  path: "/zh/terms",
});

export default function Page() {
  return (
    <ContentPage title="使用条款" description="这些条款说明 PicZip 的基础使用规则。">
      <h2>服务使用</h2>
      <p>PicZip 提供免费的浏览器端图片压缩工具。你需要自行确认压缩结果是否符合自己的上传或使用要求。</p>
      <h2>无担保</h2>
      <p>压缩结果会受到浏览器支持、图片格式、设备内存、原图质量和设置参数影响。</p>
      <h2>合理使用</h2>
      <p>请勿以干扰网站运行、滥用自动访问或违反适用法律的方式使用 PicZip。</p>
      <h2>变更</h2>
      <p>随着压缩工具改进或新增图片工具，这些条款可能会更新。</p>
    </ContentPage>
  );
}
