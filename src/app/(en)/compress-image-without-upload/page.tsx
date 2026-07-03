import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { baseBullets, sharedFaqs } from "@/lib/seo/landing-pages";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Compress Images Without Uploading",
  description:
    "Compress images without uploading them to a server. PicZip processes JPG, PNG, and WebP files locally in your browser for free.",
  path: "/compress-image-without-upload",
});

export default function Page() {
  return (
    <SeoLandingPage
      title="Compress images without uploading them"
      description="PicZip is built for privacy-sensitive image compression. Your selected files are decoded and compressed in the browser, not sent to a remote server."
      bullets={["Useful for IDs, forms, internal screenshots, and private photos.", ...baseBullets]}
      guideTitle="How private compression works"
      guide={[
        "Choose images from your device. The browser grants access only to the files you select.",
        "PicZip runs compression locally in a browser worker, keeping the page responsive.",
        "Download the result; no image file is uploaded, stored, or kept as history.",
      ]}
      faqs={sharedFaqs}
      breadcrumbLabel="Compress Without Upload"
    />
  );
}
