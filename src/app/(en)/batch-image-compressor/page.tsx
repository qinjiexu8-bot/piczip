import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { baseBullets, sharedFaqs } from "@/lib/seo/landing-pages";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Batch Image Compressor - Free ZIP Download",
  description:
    "Batch compress images online for free. Process multiple JPG, PNG, and WebP files in your browser and download one ZIP.",
  path: "/batch-image-compressor",
});

export default function Page() {
  return (
    <SeoLandingPage
      title="Batch compress images and download a ZIP"
      description="Compress multiple images locally and export the results in one ZIP file. PicZip is useful for website assets, product photos, email attachments, and repeated upload tasks."
      bullets={["Add up to 50 images and download one ZIP.", ...baseBullets]}
      guideTitle="How to batch compress images"
      guide={[
        "Drop multiple JPG, PNG, or WebP images into the compressor.",
        "Choose a target size, quality, and output format once for the whole batch.",
        "Download individual results or export all compressed files in one ZIP.",
      ]}
      faqs={sharedFaqs}
    />
  );
}
