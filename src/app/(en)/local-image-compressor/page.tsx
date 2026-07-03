import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { baseBullets, defaultGuide, sharedFaqs } from "@/lib/seo/landing-pages";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Local Image Compressor - Browser-Based",
  description:
    "Use a local image compressor in your browser. Compress JPG, PNG, and WebP files for free with no sign-up and no server upload.",
  path: "/local-image-compressor",
});

export default function Page() {
  return (
    <SeoLandingPage
      title="Local image compressor for private files"
      description="Compress images on your own device with PicZip. It is designed for private files, repeat web optimization, batch downloads, and exact upload limits."
      bullets={["Runs in the browser instead of uploading files to a server.", ...baseBullets]}
      guideTitle="How to use the local compressor"
      guide={defaultGuide}
      faqs={sharedFaqs}
    />
  );
}
