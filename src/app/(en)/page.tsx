import { HomePage } from "@/components/site/HomePage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Free Image Compressor - No Upload, No Sign-Up",
  description:
    "Compress JPG, PNG, and WebP images in your browser. Free to use, no sign-up, no upload, exact KB targets, and batch ZIP downloads.",
  path: "/",
});

export default function Home() {
  return (
    <HomePage
      copy={{
        locale: "en",
        title: "Free image compressor",
        description:
          "Compress JPG, PNG and WebP to a target size, adjust quality, and download your results individually or as a ZIP.",
        popularTitle: "Popular compression tasks",
        popularLinks: [
          ["Compress image to 100KB", "/compress-image-to-100kb"],
          ["Compress image to 200KB", "/compress-image-to-200kb"],
          ["Compress JPG", "/compress-jpg"],
          ["Batch image compressor", "/batch-image-compressor"],
          ["Compress PNG", "/compress-png"],
          ["Compress WebP", "/compress-webp"],
        ],
        helpTitle: "Need a smaller file?",
        helpText:
          "Start with a target size. If the result is still too large, try reducing the width or switching formats; the guide explains each setting.",
        guideLink: ["Read the compression guide", "/guide"],
      }}
    />
  );
}
