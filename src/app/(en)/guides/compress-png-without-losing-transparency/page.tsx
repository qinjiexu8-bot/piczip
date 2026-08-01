import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { GuideArticlePage } from "@/components/site/GuideArticlePage";
import { createMetadata } from "@/lib/seo/metadata";

const path = "/guides/compress-png-without-losing-transparency";

export const metadata = createMetadata({
  title: "How to Compress PNG Without Losing Transparency",
  description:
    "Compress a transparent PNG locally and verify its alpha channel. See tested PNG and WebP results, exact sizes, limitations, and practical checks.",
  path,
  hasChineseVersion: false,
  type: "article",
});

export default function Page() {
  return (
    <GuideArticlePage
      title="How to compress PNG without losing transparency"
      description="A controlled PicZip test of transparent, semi-transparent, and opaque pixels, including the case where PNG compression makes the file larger."
      path={path}
      publishedAt="2026-08-01"
      verifiedAt="2026-08-01"
      readingTime="7 min read"
      breadcrumbLabel="Compress PNG without losing transparency"
      image="/guides/compress-png-without-losing-transparency/transparent-png-result.png"
      howToSteps={[
        "Keep PNG selected when the destination requires a PNG file.",
        "Disable resizing for the first run and compare exact output bytes with the original.",
        "Check transparent and semi-transparent edges over both light and dark backgrounds.",
      ]}
    >
      <p>
        To compress a PNG without losing transparency, keep PNG as the output format and inspect the
        result over both light and dark backgrounds. PicZip decodes and re-encodes the alpha channel
        locally in your browser. This preserves transparent areas, but it does not guarantee that
        the new PNG will be smaller than the original.
      </p>
      <p>
        Our 800×600 RGBA fixture contained 251,243 fully transparent pixels, 115,172 partially
        transparent pixels, and 113,585 opaque pixels. The original measured 1,617,783 bytes. The
        PNG output kept all three alpha counts but measured 1,720,597 bytes, which was 102,814 bytes
        larger. That failed reduction is part of the answer, not a result to hide.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">What transparency preservation means</h2>
      <p>
        PNG stores opacity in an alpha channel. A value of 0 is fully transparent, 255 is fully
        opaque, and values between them create soft edges, shadows, and fades. Preserving only fully
        transparent pixels is not enough for a logo with anti-aliased curves; the intermediate
        alpha values matter too.
      </p>
      <p>
        We decoded the PicZip PNG result and counted those alpha values again. The transparent,
        partial, and opaque counts matched the source exactly. This verifies the tested output&apos;s
        alpha data, although it does not claim that every PNG compressor or every format conversion
        behaves the same way.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">Step 1: Run a PNG-to-PNG test first</h2>
      <p>
        Open the <Link className="font-black text-teal-700" href="/compress-png">PNG compressor</Link>,
        add the original, select PNG, and set Max width to 0 for a same-dimension test. Set Target
        size to 0 as well. This isolates the encoder result before a strict byte target or resize
        changes the experiment.
      </p>
      <figure className="py-3">
        <Image
          className="h-auto w-full border border-black/10"
          src="/guides/compress-png-without-losing-transparency/transparent-png-result.png"
          alt="PicZip PNG result for an 800 by 600 transparent test image with no size reduction"
          width={1280}
          height={720}
          sizes="(max-width: 896px) 100vw, 832px"
          loading="eager"
        />
        <figcaption className="mt-2 text-sm leading-6 text-slate-500">
          PNG kept the 800×600 canvas and alpha data, but increased the file from 1,617,783 to
          1,720,597 bytes.
        </figcaption>
      </figure>
      <p>
        When the result is larger, keep the original. Re-encoding is not automatically
        optimization. The source may already use a better filter strategy, a smaller palette, or a
        more effective compressor than the new output.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">Step 2: Inspect the edges, not only the empty area</h2>
      <p>
        Place the downloaded image on white, black, and a saturated color. Check curves, hair,
        shadows, glow effects, and antialiased text at 100% zoom. A white halo usually means the
        source was flattened before compression or a conversion removed useful alpha information.
      </p>
      <p>
        Also confirm the output MIME type and extension. JPG does not support transparency. A JPG
        can be much smaller, but it must replace transparent pixels with a solid background, so it
        is not a transparent-PNG solution.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">Step 3: Compare WebP when the destination accepts it</h2>
      <p>
        WebP supports alpha and can be much smaller for complex transparent graphics. Using the
        same 800×600 fixture at quality 82, PicZip produced a 96,120-byte WebP. Decoding that output
        returned the same counts for fully transparent, partially transparent, and opaque pixels.
        The color channels are lossy at this setting, so matching alpha does not mean every RGB
        value is identical.
      </p>
      <figure className="py-3">
        <Image
          className="h-auto w-full border border-black/10"
          src="/guides/compress-png-without-losing-transparency/transparent-webp-result.png"
          alt="PicZip WebP result for the same 800 by 600 transparent test image"
          width={1280}
          height={720}
          sizes="(max-width: 896px) 100vw, 832px"
        />
        <figcaption className="mt-2 text-sm leading-6 text-slate-500">
          WebP retained the 800×600 canvas and alpha counts while reducing this fixture to 96,120
          bytes.
        </figcaption>
      </figure>
      <p>
        Use WebP only when the website, app, or upload form accepts it. Keep PNG for workflows that
        explicitly require PNG, pixel-exact colors, or software that does not support WebP.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">Why a target size may not help PNG</h2>
      <p>
        PicZip&apos;s PNG encoder currently uses fixed 8-bit PNG encoding. The quality control affects
        JPG and WebP, but it is not passed into the PNG encoder. A target-size search therefore
        cannot make this PNG progressively smaller by lowering quality. Resizing or changing format
        is the meaningful next step when PNG-to-PNG output misses the limit.
      </p>
      <p>
        This behavior is disclosed because a slider can otherwise suggest control that the PNG
        codec does not provide. We plan content around the product&apos;s actual output, not around a
        generic promise that every PNG can be reduced.
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">Frequently asked questions</h2>
      <Faq question="Does PNG compression remove transparency?">
        Not in the tested PicZip PNG path. Fully transparent, partially transparent, and opaque
        pixel counts matched the source after re-encoding.
      </Faq>
      <Faq question="Why did my transparent PNG become larger?">
        The source may already be efficiently encoded. A new lossless PNG representation can use
        more bytes even though its dimensions and pixels are preserved.
      </Faq>
      <Faq question="Can WebP keep a transparent background?">
        Yes. The tested WebP retained all alpha categories and was much smaller, but its color data
        was lossy at quality 82 and the destination must support WebP.
      </Faq>
      <Faq question="Should I use JPG for a transparent logo?">
        No, unless you intentionally want a solid background. JPG has no alpha channel.
      </Faq>

      <h2 className="pt-3 text-3xl font-black text-foreground">The practical answer</h2>
      <p>
        Keep PNG selected when PNG is required, verify alpha on contrasting backgrounds, and retain
        the original if the output grows. For destinations that accept WebP, compare it from the
        original and inspect both transparency and color detail before replacing the PNG.
      </p>
    </GuideArticlePage>
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
