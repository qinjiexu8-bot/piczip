export const siteConfig = {
  name: "PicZip",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://piczip.app",
  title: "PicZip - Free Image Compressor",
  description:
    "Compress JPG, PNG, and WebP images in your browser. Free to use, no sign-up, no upload, exact KB targets, and batch ZIP downloads.",
  locale: "en_US",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
