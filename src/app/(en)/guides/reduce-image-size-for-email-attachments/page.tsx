import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { GuideArticlePage } from "@/components/site/GuideArticlePage";
import { createMetadata } from "@/lib/seo/metadata";

const path = "/guides/reduce-image-size-for-email-attachments";

export const metadata = createMetadata({
  title: "How to Reduce Image Size for Email Attachments",
  description:
    "Reduce several image attachments before emailing them. See a tested three-image batch, exact sizes, ZIP result, settings, and delivery trade-offs.",
  path,
  hasChineseVersion: false,
  type: "article",
});

export default function Page() {
  return (
    <GuideArticlePage
      title="How to reduce image size for email attachments"
      description="A tested three-image workflow with exact before-and-after totals, a ZIP measurement, and practical guidance on when to attach files separately."
      path={path}
      publishedAt="2026-07-30"
      verifiedAt="2026-07-30"
      readingTime="7 min read"
      breadcrumbLabel="Reduce images for email"
      image="/guides/reduce-image-size-for-email-attachments/piczip-email-batch-result.jpg"
      howToSteps={[
        "Choose a total attachment budget based on the message and recipient.",
        "Add the images to PicZip and apply one sensible target and maximum width.",
        "Review each output, then download individual files or one ZIP.",
      ]}
    >
      <p>
        To make image attachments smaller, decide how the recipient will use them before choosing a
        target. For images meant to be viewed in an email, a 1600px maximum width and a few hundred
        kilobytes per image is a practical starting point. Compress the originals in one batch,
        inspect each result, and send a ZIP only when the recipient expects an archive.
      </p>
      <p>
        In our three-file test, 3,910,559 bytes of PNG and JPG images became 381,034 bytes. PicZip
        packaged those outputs into a 381,092-byte ZIP. That is a 90.26% reduction in the image data,
        but the best delivery format still depends on whether the recipient wants quick previews or
        a single downloadable bundle.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">Our three-image email test</h2>
      <p>
        We used three PicZip-owned, privacy-safe files: a detailed coastal PNG, the PicZip social
        preview JPG, and a PNG homepage mockup. This mix covers a photograph-like scene, branded
        artwork, and interface text. The files were 2,976,317, 483,929, and 450,313 bytes before
        compression.
      </p>
      <p>
        We set Target size to 300KB, Output to Auto, quality to 82, and Max width to 1600px. The
        300KB value was a per-file ceiling, not a promise that every output would be close to 300KB.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 bg-slate-50">
              <th className="px-4 py-3 font-black">File</th>
              <th className="px-4 py-3 font-black">Original</th>
              <th className="px-4 py-3 font-black">Output</th>
              <th className="px-4 py-3 font-black">Dimensions</th>
            </tr>
          </thead>
          <tbody>
            <EmailRow file="Coastal PNG" original="2,976,317 B" output="268,434 B" dimensions="1536×1024" />
            <EmailRow file="Social preview JPG" original="483,929 B" output="30,022 B" dimensions="1376×768" />
            <EmailRow file="Homepage mockup PNG" original="450,313 B" output="82,578 B" dimensions="1440×1200" />
          </tbody>
        </table>
      </div>
      <p>
        Auto selected WebP for all three outputs. Their combined size was 381,034 bytes. The ZIP was
        only 58 bytes larger because WebP data is already compressed; ZIP is valuable here for
        packaging, not for a second dramatic reduction.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">
        Step 1: Choose a useful attachment budget
      </h2>
      <p>
        Mail services do not all use the same limit, and encoded email attachments can take more
        message space than their file sizes suggest. Avoid aiming exactly at a provider&apos;s advertised
        maximum. Leave room for the message body, signatures, PDFs, and any images added later.
      </p>
      <p>
        For photos the recipient will only view on a laptop or phone, start with 1600px maximum width
        and 200–500KB per image. For print, original artwork, or a client who needs to edit the file,
        do not use an email-viewing preset; share the originals through an agreed file-transfer
        method instead.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">
        Step 2: Add the originals and use one batch setting
      </h2>
      <p>
        Open PicZip&apos;s{" "}
        <Link className="font-black text-teal-700 underline-offset-4 hover:underline" href="/batch-image-compressor">
          batch image compressor
        </Link>{" "}
        and add the original files. In our test, one 300KB target and 1600px maximum applied to the
        whole batch. Starting from originals matters: repeatedly compressing images that have
        already been reduced can add artifacts without a useful size benefit.
      </p>
      <figure className="py-3">
        <Image
          className="h-auto w-full border border-black/10"
          src="/guides/reduce-image-size-for-email-attachments/piczip-email-batch-settings.jpg"
          alt="PicZip batch compressor set to 300KB, Auto output, quality 82, and 1600px maximum width"
          width={1265}
          height={712}
          sizes="(max-width: 896px) 100vw, 832px"
        />
        <figcaption className="mt-2 text-sm leading-6 text-slate-500">
          The settings used for our mixed three-image email batch.
        </figcaption>
      </figure>
      <p>
        A single batch setting is efficient, but it does not make every image equally large. The
        social preview needed only 30,022 bytes, while the detailed coastal image used 268,434 bytes.
        Content complexity and source format matter more than filename or original size alone.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">
        Step 3: Review each result before downloading
      </h2>
      <p>
        Wait until every row reports Done. Check screenshots at 100% zoom for readable text and check
        photographs for faces, fine edges, and obvious color banding. A batch can contain one file
        that needs a different format or width, so do not judge all outputs from the total saved
        number.
      </p>
      <figure className="py-3">
        <Image
          className="h-auto w-full border border-black/10"
          src="/guides/reduce-image-size-for-email-attachments/piczip-email-batch-result.jpg"
          alt="PicZip showing three completed email images of 262KB, 29KB, and 81KB"
          width={1265}
          height={712}
          sizes="(max-width: 896px) 100vw, 832px"
        />
        <figcaption className="mt-2 text-sm leading-6 text-slate-500">
          PicZip displayed 3.4MB saved across the batch; exact output data totaled 381,034 bytes.
        </figcaption>
      </figure>

      <h2 className="pt-3 text-3xl font-black text-foreground">
        Individual attachments or one ZIP?
      </h2>
      <h3 className="pt-2 text-2xl font-black text-foreground">Attach images separately for quick viewing</h3>
      <p>
        Individual JPG, PNG, or WebP files are easier to preview on phones and in webmail. Use them
        when the recipient needs to glance at a few images, insert them into a document, or download
        only one file. Confirm that the recipient&apos;s software accepts WebP; otherwise choose JPG for
        photographs before compressing.
      </p>
      <h3 className="pt-2 text-2xl font-black text-foreground">Use ZIP for a named set of files</h3>
      <p>
        ZIP is convenient when several files belong together, filenames matter, or the recipient
        asked for one package. In our test it added 58 bytes rather than reducing the batch further.
        Some organizations block archives for security reasons, and a phone user may find them less
        convenient to open.
      </p>
      <p>
        PicZip&apos;s Download ZIP button is therefore an organization feature, not a claim that
        already-compressed images will become much smaller again.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">Format choices for email</h2>
      <p>
        Use JPG for broadly compatible photographs. Use PNG when transparency or hard-edged
        screenshot text matters and the resulting size is acceptable. WebP often creates smaller
        outputs, but the recipient&apos;s editing software or upload workflow may not accept it.
      </p>
      <p>
        See the dedicated{" "}
        <Link className="font-black text-teal-700 underline-offset-4 hover:underline" href="/compress-jpg">
          JPG compressor
        </Link>{" "}
        and{" "}
        <Link className="font-black text-teal-700 underline-offset-4 hover:underline" href="/compress-png">
          PNG compressor
        </Link>{" "}
        when format compatibility matters more than Auto&apos;s smallest result.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">Frequently asked questions</h2>
      <Faq question="What size should a photo be for email?">
        There is no universal number. For screen viewing, 1600px wide and a few hundred kilobytes is
        a sensible starting point. Printing, editing, and archival delivery need larger files.
      </Faq>
      <Faq question="Why is the ZIP almost the same size as the images?">
        JPG and WebP data is already compressed. ZIP can package those files, but it often cannot
        remove much more data. Our 381,034-byte batch became a 381,092-byte ZIP.
      </Faq>
      <Faq question="Can I email WebP files?">
        Usually, but the recipient&apos;s software may not preview or edit them. Choose JPG when broad
        photo compatibility matters, and use PNG for screenshots that need transparency or very
        crisp edges.
      </Faq>
      <Faq question="Are the images uploaded while PicZip processes the batch?">
        No. The selected image files are decoded and compressed in the browser. Normal page assets
        still load from the web; the “no upload” claim applies to the images selected for
        compression.
      </Faq>

      <h2 className="pt-3 text-3xl font-black text-foreground">The practical workflow</h2>
      <p>
        Start from the original images, choose a width based on how they will be used, and leave
        margin below the email service&apos;s limit. Inspect every result. Send individual files when
        previews matter, or a ZIP when the recipient wants one organized package.
      </p>
      <p>
        Our test reduced three mixed images by 90.26%, but that figure is evidence from one batch,
        not a guarantee. Open the{" "}
        <Link className="font-black text-teal-700 underline-offset-4 hover:underline" href="/batch-image-compressor">
          PicZip batch compressor
        </Link>{" "}
        and measure the files you actually plan to send.
      </p>
    </GuideArticlePage>
  );
}

function EmailRow({
  file,
  original,
  output,
  dimensions,
}: {
  file: string;
  original: string;
  output: string;
  dimensions: string;
}) {
  return (
    <tr className="border-b border-black/10">
      <th className="px-4 py-3 font-black text-foreground">{file}</th>
      <td className="px-4 py-3">{original}</td>
      <td className="px-4 py-3">{output}</td>
      <td className="px-4 py-3">{dimensions}</td>
    </tr>
  );
}

function Faq({ question, children }: { question: string; children: ReactNode }) {
  return (
    <section className="border-t border-black/10 pt-4">
      <h3 className="text-xl font-black text-foreground">{question}</h3>
      <p className="mt-2">{children}</p>
    </section>
  );
}
