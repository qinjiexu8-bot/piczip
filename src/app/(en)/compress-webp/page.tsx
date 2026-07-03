import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { baseBullets, defaultGuide, sharedFaqs } from "@/lib/seo/landing-pages";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Compress WebP Online Free - No Upload",
  description:
    "Compress WebP images online for free without uploading. Batch process WebP files in your browser and target exact file sizes.",
  path: "/compress-webp",
});

export default function Page() {
  return (
    <SeoLandingPage
      title="Compress WebP images for faster web pages"
      description="Reduce WebP file size locally for modern websites, product images, blog graphics, and repeat image optimization work."
      bullets={["WebP compression for modern website images.", ...baseBullets]}
      guideTitle="How to compress WebP"
      guide={defaultGuide}
      faqs={sharedFaqs}
    />
  );
}
