import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { GuideArticlePage } from "@/components/site/GuideArticlePage";
import { createMetadata } from "@/lib/seo/metadata";

const path = "/guides/jpg-vs-png-vs-webp-file-size";

export const metadata = createMetadata({
  title: "JPG vs PNG vs WebP File Size: A Same-Image Test",
  description:
    "Compare JPG, PNG, and WebP file size using the same image and dimensions. See exact PicZip results, format trade-offs, and when smaller is not better.",
  path,
  hasChineseVersion: false,
  type: "article",
});

export default function Page() {
  return (
    <GuideArticlePage
      title="JPG vs PNG vs WebP file size: the same image tested"
      description="We encoded one 1536×1024 source into all three formats with the same dimensions and quality starting point, then recorded the exact result."
      path={path}
      publishedAt="2026-07-30"
      verifiedAt="2026-07-30"
      readingTime="7 min read"
      breadcrumbLabel="JPG vs PNG vs WebP file size"
      image="/guides/jpg-vs-png-vs-webp-file-size/piczip-webp-result.jpg"
      howToSteps={[
        "Start with one source image and keep its dimensions unchanged.",
        "Encode separate JPG, PNG, and WebP versions with documented settings.",
        "Compare file size together with transparency, compatibility, and editing needs.",
      ]}
    >
      <p>
        In our same-image test, WebP was smallest at 268,434 bytes, JPG followed at 287,599 bytes,
        and PNG was much larger at 3,449,964 bytes. That does not mean WebP always wins or PNG is a
        bad format. It means this detailed, photograph-like source was better suited to lossy photo
        encoding than lossless PNG.
      </p>
      <p>
        The practical choice is WebP for small web delivery, JPG for broad photo compatibility, and
        PNG when transparency or pixel-exact hard edges matter. Compare formats using the image you
        actually plan to publish; the ranking can change with different content.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">Our controlled format test</h2>
      <p>
        We used PicZip&apos;s privacy-safe coastal fixture: a 2,976,317-byte PNG at 1536×1024. It
        contains water, clouds, trees, roofs, and gradual color changes. For each run, Target size
        and Max width were both set to 0, dimensions stayed at 1536×1024, and quality started at 82.
        Only Output changed.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 bg-slate-50">
              <th className="px-4 py-3 font-black">Output</th>
              <th className="px-4 py-3 font-black">Exact size</th>
              <th className="px-4 py-3 font-black">Compared with source</th>
              <th className="px-4 py-3 font-black">Typical strength</th>
            </tr>
          </thead>
          <tbody>
            <FormatRow format="JPG" size="287,599 bytes" change="90.34% smaller" strength="Photo compatibility" />
            <FormatRow format="PNG" size="3,449,964 bytes" change="15.91% larger" strength="Lossless edges and alpha" />
            <FormatRow format="WebP" size="268,434 bytes" change="90.98% smaller" strength="Small web delivery" />
          </tbody>
        </table>
      </div>
      <p>
        WebP was 19,165 bytes smaller than JPG, a difference of about 6.66% relative to the JPG
        result. PNG grew by 473,647 bytes because re-encoding this detailed image losslessly was less
        efficient than the original PNG file. Compression can produce a larger file; format names
        alone do not guarantee a reduction.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">Why PNG was so much larger here</h2>
      <p>
        PNG preserves image information without the kind of perceptual loss used by JPG and WebP.
        That is valuable for transparent artwork, diagrams, and screenshots with sharp text. It is
        expensive for a scene with fine texture and smooth color variation, where a photo codec can
        discard details people are less likely to notice.
      </p>
      <p>
        Our result does not establish a fixed PNG penalty. A simple logo with a few flat colors can
        be smaller as PNG than as a photograph-oriented file. The test tells us what happened to
        this source, not what must happen to every image.
      </p>
      <figure className="py-3">
        <Image
          className="h-auto w-full border border-black/10"
          src="/guides/jpg-vs-png-vs-webp-file-size/piczip-png-result.jpg"
          alt="PicZip showing the coastal source encoded as a 3.3MB PNG"
          width={1265}
          height={712}
          sizes="(max-width: 896px) 100vw, 832px"
        />
        <figcaption className="mt-2 text-sm leading-6 text-slate-500">
          The explicit PNG run produced 3,449,964 bytes, larger than the 2,976,317-byte source.
        </figcaption>
      </figure>

      <h2 className="pt-3 text-3xl font-black text-foreground">When to choose JPG</h2>
      <p>
        Choose JPG for photographs that need to open in older software, office systems, print
        workflows, or upload forms with conservative format support. It does not preserve
        transparency, and repeated editing and saving can accumulate visible loss.
      </p>
      <p>
        In this test, JPG was only 19,165 bytes larger than WebP. That small difference may be worth
        paying when the destination explicitly requests JPG or when you do not control the
        recipient&apos;s software.
      </p>
      <p>
        Use the{" "}
        <Link className="font-black text-teal-700 underline-offset-4 hover:underline" href="/compress-jpg">
          JPG compressor
        </Link>{" "}
        when compatibility is a stated requirement rather than an assumption.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">When to choose PNG</h2>
      <p>
        Choose PNG for transparency, interface screenshots, line art, and graphics where exact hard
        edges are more important than the smallest possible download. Do not convert a transparent
        logo to JPG unless you have intentionally added a background.
      </p>
      <p>
        If a PNG result becomes larger, keep the original instead of downloading the new file.
        PicZip reports the output size so that “compression completed” is not mistaken for “the file
        became smaller.” The{" "}
        <Link className="font-black text-teal-700 underline-offset-4 hover:underline" href="/compress-png">
          PNG compressor
        </Link>{" "}
        is useful when PNG itself is required, not when any output format is acceptable.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">When to choose WebP</h2>
      <p>
        Choose WebP for websites and modern app delivery when a smaller photo file is useful and the
        consuming software supports it. WebP can also preserve transparency, though converting
        artwork to a lossy WebP still requires visual inspection.
      </p>
      <figure className="py-3">
        <Image
          className="h-auto w-full border border-black/10"
          src="/guides/jpg-vs-png-vs-webp-file-size/piczip-webp-result.jpg"
          alt="PicZip showing the coastal source encoded as a 262KB WebP"
          width={1265}
          height={712}
          sizes="(max-width: 896px) 100vw, 832px"
        />
        <figcaption className="mt-2 text-sm leading-6 text-slate-500">
          The WebP run displayed 262KB; the exact result was 268,434 bytes.
        </figcaption>
      </figure>
      <p>
        For this source, WebP delivered the smallest result. Open the{" "}
        <Link className="font-black text-teal-700 underline-offset-4 hover:underline" href="/compress-webp">
          WebP compressor
        </Link>{" "}
        when the destination supports WebP and delivery size matters.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">How to run a fair comparison</h2>
      <ol className="list-decimal space-y-2 pl-6">
        <li>Start every run from the same original file.</li>
        <li>Keep width and height unchanged unless resizing is the question being tested.</li>
        <li>Use the same quality starting point for lossy formats.</li>
        <li>Record exact bytes, not only rounded KB labels.</li>
        <li>Inspect transparency, text, gradients, and edges at 100% zoom.</li>
        <li>Test the final file in the actual website, form, or software.</li>
      </ol>

      <h2 className="pt-3 text-3xl font-black text-foreground">Frequently asked questions</h2>
      <Faq question="Is WebP always smaller than JPG?">
        No. It was smaller in this test, but encoder settings and image content can reverse the
        result. The destination also has to support WebP.
      </Faq>
      <Faq question="Why can a compressed PNG become larger?">
        PNG is lossless, and different encoders can produce different results. Detailed photo-like
        content may be expensive to represent as PNG. Keep the original when re-encoding grows it.
      </Faq>
      <Faq question="Which format should I use for a transparent logo?">
        PNG is the conservative choice. WebP can preserve transparency too, but verify the alpha
        channel and software support. JPG does not support transparency.
      </Faq>
      <Faq question="Should I convert every website image to WebP?">
        No. Keep source masters in formats suited to editing, and choose delivery formats by asset.
        A screenshot, transparent icon, and photograph do not have identical needs.
      </Faq>

      <h2 className="pt-3 text-3xl font-black text-foreground">The decision in one sentence</h2>
      <p>
        Use JPG for compatible photos, PNG for lossless edges or transparency, and WebP for small
        modern delivery—then verify with your own image because content determines the result. You
        can run all three versions in the <Link className="font-black text-teal-700" href="/">PicZip compressor</Link>{" "}
        without uploading the selected file.
      </p>
    </GuideArticlePage>
  );
}

function FormatRow({ format, size, change, strength }: { format: string; size: string; change: string; strength: string }) {
  return (
    <tr className="border-b border-black/10">
      <th className="px-4 py-3 font-black text-foreground">{format}</th>
      <td className="px-4 py-3">{size}</td>
      <td className="px-4 py-3">{change}</td>
      <td className="px-4 py-3">{strength}</td>
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
