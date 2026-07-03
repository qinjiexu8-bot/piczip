import { ContentPage } from "@/components/site/ContentPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "About PicZip",
  description:
    "PicZip is a free browser image compressor for JPG, PNG, and WebP files with no upload and no sign-up.",
  path: "/about",
});

export default function Page() {
  return (
    <ContentPage
      title="About PicZip"
      description="PicZip is a focused image tool built for fast, free, browser-side compression."
    >
      <h2>Why PicZip exists</h2>
      <p>
        Many image compression tools upload files to a server. PicZip focuses on the opposite
        approach: compress selected images locally in the browser whenever possible, without asking
        users to create an account first.
      </p>
      <h2>Current focus</h2>
      <p>
        PicZip currently focuses on image compression, exact target sizes, batch ZIP export, and
        clear privacy boundaries. More image tools can be added later after the compression workflow
        is stable.
      </p>
      <h2>Contact</h2>
      <p>
        For questions, feedback, or support, email{" "}
        <a className="font-black text-teal-700" href="mailto:support@piczip.app">
          support@piczip.app
        </a>
        .
      </p>
    </ContentPage>
  );
}
