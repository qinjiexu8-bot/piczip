import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { baseBullets, sharedFaqs } from "@/lib/seo/landing-pages";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Compress Image to 200KB Online Free",
  description:
    "Compress an image to 200KB online for free without uploading. Use browser-side compression, exact target size, and batch ZIP downloads.",
  path: "/compress-image-to-200kb",
});

export default function Page() {
  return (
    <SeoLandingPage
      title="Compress an image to 200KB without uploading"
      description="Reduce JPG, PNG, or WebP files to a 200KB target in your browser. PicZip helps with forms, web uploads, and email-friendly images."
      bullets={["200KB target preset for common upload limits.", ...baseBullets]}
      compressorDefaults={{ targetKb: 200 }}
      guideTitle="How to compress an image to 200KB"
      guide={[
        "Set Target size to 200 KB before starting compression.",
        "Keep Auto output enabled for a practical balance between compatibility and size.",
        "Download the result directly or export all compressed images as one ZIP.",
      ]}
      faqs={sharedFaqs}
      breadcrumbLabel="Compress to 200KB"
    />
  );
}
