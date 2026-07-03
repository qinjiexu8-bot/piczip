import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { baseBullets, defaultGuide, sharedFaqs } from "@/lib/seo/landing-pages";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Compress JPG Online Free - No Upload",
  description:
    "Compress JPG photos online for free without uploading. Reduce file size in your browser, set exact KB targets, and download compressed images.",
  path: "/compress-jpg",
});

export default function Page() {
  return (
    <SeoLandingPage
      title="Compress JPG images for free, without uploading"
      description="Reduce JPG photo size directly in your browser. PicZip is useful for application photos, email attachments, website images, and upload forms with strict file limits."
      bullets={["JPG compression tuned for photos and camera images.", ...baseBullets]}
      guideTitle="How to compress a JPG"
      guide={defaultGuide}
      faqs={sharedFaqs}
      breadcrumbLabel="Compress JPG"
    />
  );
}
