import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { baseBullets, sharedFaqs } from "@/lib/seo/landing-pages";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Compress Image to 100KB Online Free",
  description:
    "Compress an image to 100KB online for free. Set an exact target size, process JPG, PNG, and WebP in your browser, and avoid uploads.",
  path: "/compress-image-to-100kb",
});

export default function Page() {
  return (
    <SeoLandingPage
      title="Compress an image to 100KB in your browser"
      description="Set a 100KB target and reduce your image without uploading it. This is useful for profile photos, application forms, email attachments, and upload limits."
      bullets={["100KB target preset for strict upload forms.", ...baseBullets]}
      guideTitle="How to compress an image to 100KB"
      guide={[
        "Set Target size to 100 KB in the compressor.",
        "Use WebP or JPG for photos when the smallest file size matters.",
        "If a large image cannot reach 100KB cleanly, reduce max width and run compression again.",
      ]}
      faqs={sharedFaqs}
    />
  );
}
