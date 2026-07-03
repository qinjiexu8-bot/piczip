import { ContentPage } from "@/components/site/ContentPage";
import { createMetadata } from "@/lib/seo/metadata";
import { zhSharedFaqs } from "@/lib/seo/zh-landing-pages";

export const metadata = createMetadata({
  title: "图片压缩常见问题",
  description: "关于 PicZip 本地图片压缩、隐私、格式支持、指定大小和批量下载的常见问题。",
  path: "/zh/faq",
});

const extraFaqs = [
  {
    question: "PicZip 可以把图片精确压缩到 100KB 吗？",
    answer: "PicZip 可以设置目标大小，但实际结果会受图片内容影响。大图或细节很多的照片，可能需要降低最大宽度或质量才能接近 100KB。",
  },
  {
    question: "PicZip 可以离线使用吗？",
    answer: "PicZip 是浏览器应用，部分资源可能被浏览器缓存。但完整离线能力应视为后续增强能力，而不是当前承诺。",
  },
  {
    question: "为什么暂时没有 AVIF？",
    answer: "AVIF 可以做出很小的文件，但浏览器端编码通常更慢。PicZip 先做好 JPG、PNG、WebP，因为它们覆盖最常见的压缩需求。",
  },
];

export default function Page() {
  const faqs = [...zhSharedFaqs, ...extraFaqs];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <ContentPage title="图片压缩常见问题" description="关于免费浏览器图片压缩、隐私、指定大小和批量下载的常见问题。">
      {faqs.map((faq) => (
        <section key={faq.question}>
          <h2>{faq.question}</h2>
          <p>{faq.answer}</p>
        </section>
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </ContentPage>
  );
}
