import { ContentPage } from "@/components/site/ContentPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Terms of Use",
  description: "Terms of use for PicZip, a free browser-based image compression tool.",
  path: "/terms",
});

export default function Page() {
  return (
    <ContentPage
      title="Terms of use"
      description="These terms describe the baseline rules for using PicZip."
      locale="en"
      breadcrumbLabel="Terms"
    >
      <h2>Use of the service</h2>
      <p>
        PicZip provides free browser-based image compression tools. You are responsible for the
        files you choose to process and for checking compressed results before using them.
      </p>
      <h2>No warranty</h2>
      <p>
        PicZip is provided as-is. Compression results depend on browser support, image format,
        device memory, source image quality, and selected settings.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Do not use PicZip in a way that interferes with the website, abuses automated traffic, or
        violates applicable laws.
      </p>
      <h2>Prohibited content</h2>
      <p>
        You must not use PicZip to process, create, distribute, or support illegal, harmful, or
        abusive content. This includes sexually explicit illegal content, child sexual abuse
        material, non-consensual intimate imagery, graphic violence, terrorist or extremist content,
        hate or harassment content, copyright-infringing material, fraud, malware, phishing, or any
        content that violates applicable laws or the rights of others.
      </p>
      <h2>Changes</h2>
      <p>These terms may be updated as PicZip improves the compressor or adds new image tools.</p>
    </ContentPage>
  );
}
