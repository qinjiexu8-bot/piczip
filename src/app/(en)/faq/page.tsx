import { ContentPage } from "@/components/site/ContentPage";
import { createMetadata } from "@/lib/seo/metadata";
import { sharedFaqs } from "@/lib/seo/landing-pages";

export const metadata = createMetadata({
  title: "Image Compression FAQ - PicZip",
  description:
    "Answers about local image compression, file privacy, supported formats, target sizes, and batch ZIP downloads in PicZip.",
  path: "/faq",
});

const extraFaqs = [
  {
    question: "Can PicZip compress an image to an exact size like 100KB?",
    answer:
      "PicZip can target a specific file size, but exact results depend on the image. Large or detailed photos may need a smaller maximum width or lower quality to reach 100KB.",
  },
  {
    question: "Does PicZip work offline?",
    answer:
      "PicZip is a browser app. Some assets may stay cached by the browser, but full offline support should be treated as a future improvement rather than a guarantee.",
  },
  {
    question: "Why is AVIF not included yet?",
    answer:
      "AVIF can produce small files, but browser-side encoding is often slower. PicZip starts with JPG, PNG, and WebP because they cover the most common compression tasks.",
  },
];

export default function Page() {
  const faqs = [...sharedFaqs, ...extraFaqs];
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
    <ContentPage
      title="Image compression FAQ"
      description="Common questions about free browser image compression, file privacy, target sizes, and batch downloads."
      locale="en"
      breadcrumbLabel="FAQ"
    >
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
