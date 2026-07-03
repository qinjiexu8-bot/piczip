import { ContentPage } from "@/components/site/ContentPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "PicZip privacy policy. Image files are compressed locally in the browser and are not uploaded to a server for processing.",
  path: "/privacy",
});

export default function Page() {
  return (
    <ContentPage
      title="Privacy policy"
      description="PicZip is designed around local browser processing, clear privacy boundaries, and minimal data collection."
    >
      <h2>Image files</h2>
      <p>
        PicZip compresses selected images in your browser. The image files you choose are not
        uploaded to a PicZip server for compression, and PicZip does not store your image content.
      </p>
      <h2>Analytics</h2>
      <p>
        We may use privacy-conscious analytics to understand page views, browser compatibility, and
        feature usage. Analytics should not include image file names, image content, or image hashes.
      </p>
      <h2>Browser storage</h2>
      <p>
        Compression results are kept in browser memory while the page is open. Future offline support
        should cache only application assets, not user images, unless explicitly disclosed.
      </p>
      <h2>Contact</h2>
      <p>Questions about privacy can be sent through the public contact channel after it is added.</p>
    </ContentPage>
  );
}
