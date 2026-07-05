import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { baseBullets, defaultGuide, sharedFaqs } from "@/lib/seo/landing-pages";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Compress PNG Online Free - No Upload",
  description:
    "Compress PNG images online for free without uploading. Reduce screenshots and transparent graphics in your browser with batch ZIP download.",
  path: "/compress-png",
});

export default function Page() {
  return (
    <SeoLandingPage
      title="Compress PNG images while keeping files local"
      description="Reduce PNG file size for screenshots, transparent graphics, UI assets, and website images. Compression runs in your browser, so selected files stay on your device."
      bullets={["PNG compression for screenshots and transparent images.", ...baseBullets]}
      compressorDefaults={{ format: "png" }}
      guideTitle="How to compress a PNG"
      guide={defaultGuide}
      faqs={sharedFaqs}
      breadcrumbLabel="Compress PNG"
    />
  );
}
