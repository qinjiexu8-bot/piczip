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
        eyebrow: "No upload · No sign-up · Free",
        title: "Free image compressor",
        description:
          "Compress JPG, PNG, and WebP images directly in your browser. No account, no server upload, exact KB targets, and one ZIP download for batches.",
        proofs: [
          ["Free", "no sign-up"],
          ["No upload", "files stay local"],
          ["100KB", "exact-size presets"],
        ],
        features: [
          {
            icon: "local",
            title: "Local processing",
            text: "Images are decoded, compressed, and exported inside your browser.",
          },
          {
            icon: "free",
            title: "Free to use",
            text: "Use the core compressor without subscriptions, credits, or trial limits.",
          },
          {
            icon: "signup",
            title: "No sign-up",
            text: "Start compressing immediately without an account or email.",
          },
          {
            icon: "size",
            title: "Target file size",
            text: "Aim for 50KB, 100KB, 200KB, or your own upload limit.",
          },
          {
            icon: "zip",
            title: "Batch ZIP",
            text: "Compress multiple images and download one ZIP file.",
          },
          {
            icon: "upload",
            title: "No upload",
            text: "PicZip does not send your image files to a server.",
          },
        ],
        popularTitle: "Popular compression tasks",
        popularLinks: [
          ["Compress image to 100KB", "/compress-image-to-100kb"],
          ["Compress image to 200KB", "/compress-image-to-200kb"],
          ["Compress JPG", "/compress-jpg"],
          ["Batch image compressor", "/batch-image-compressor"],
          ["Compress image without upload", "/compress-image-without-upload"],
          ["Local image compressor", "/local-image-compressor"],
        ],
        privacyTitle: "Files stay on your device",
        privacyText:
          "PicZip compresses selected images in the browser. It does not upload image files for processing, store image content, or keep a compression history.",
        guideLink: ["Read the compression guide", "/guide"],
      }}
    />
  );
}
