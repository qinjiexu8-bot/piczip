import Link from "next/link";
import { ContentPage } from "@/components/site/ContentPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Image Compression Guide - Reduce File Size Without Uploading",
  description:
    "Learn how to compress images without uploading, choose JPG, PNG, or WebP, and reduce files to exact KB targets for forms, email, and websites.",
  path: "/guide",
});

export default function Page() {
  return (
    <ContentPage
      title="Image compression guide"
      description="A practical guide to reducing image file size while keeping enough quality for forms, websites, email, and social media."
      locale="en"
      breadcrumbLabel="Guide"
    >
      <h2>Start with the right format</h2>
      <p>
        Use JPG for photos, PNG for screenshots and transparent graphics, and WebP when you want a
        modern web-friendly format. If the goal is a smaller upload, try JPG or WebP for photos and
        keep PNG for images that need transparency.
      </p>
      <p>
        For measured results from the same source image, compare{" "}
        <Link className="font-black text-teal-700" href="/guides/jpg-vs-png-vs-webp-file-size">
          JPG, PNG, and WebP file sizes
        </Link>
        .
      </p>
      <h2>Use target size carefully</h2>
      <p>
        A strict target like 100KB is useful for upload forms, but very large photos may need lower
        quality or smaller dimensions. Start with 200KB or 100KB, then reduce maximum width if the
        result is still too large.
      </p>
      <p>
        For a tested walkthrough, read{" "}
        <Link className="font-black text-teal-700" href="/guides/compress-image-to-100kb-without-uploading">
          how to compress an image to 100KB without uploading
        </Link>
        .
      </p>
      <p>
        Preparing an application upload? See our comparison of two ways to{" "}
        <Link className="font-black text-teal-700" href="/guides/compress-image-to-200kb-for-online-forms">
          compress an image to 200KB for an online form
        </Link>
        .
      </p>
      <h2>Resize before lowering quality too far</h2>
      <p>
        If a photo still looks too large after compression, reduce the maximum width before pushing
        quality very low. Smaller dimensions often preserve a cleaner result than aggressive quality
        reduction.
      </p>
      <p>
        Need to preserve the pixel count? Follow our tested method to{" "}
        <Link className="font-black text-teal-700" href="/guides/reduce-image-size-without-changing-dimensions">
          reduce image size without changing dimensions
        </Link>
        .
      </p>
      <p>
        If a target setting still returns a large file, use the checks in{" "}
        <Link className="font-black text-teal-700" href="/guides/why-compressed-image-is-still-too-large">
          why a compressed image is still too large
        </Link>
        .
      </p>
      <p>
        Screenshots need a different approach from photos. Read how to{" "}
        <Link className="font-black text-teal-700" href="/guides/compress-screenshot-without-blurry-text">
          compress a screenshot without making small text blurry
        </Link>
        .
      </p>
      <h2>Keep private files local</h2>
      <p>
        Browser-side compression is best for IDs, application photos, internal screenshots, and
        private documents. PicZip processes selected files locally and does not upload image files.
      </p>
      <h2>Batch repeated work</h2>
      <p>
        For product photos, blog images, and website assets, use the same target size and export all
        results as one ZIP. This keeps repeated optimization work fast and consistent.
      </p>
      <p>
        For email, use our tested workflow to{" "}
        <Link className="font-black text-teal-700" href="/guides/reduce-image-size-for-email-attachments">
          reduce several image attachments and decide whether to send a ZIP
        </Link>
        .
      </p>
      <p>
        Ready to try it? <Link className="font-black text-teal-700" href="/">Open the compressor</Link>.
      </p>
    </ContentPage>
  );
}
