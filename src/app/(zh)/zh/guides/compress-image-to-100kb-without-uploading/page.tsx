import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { GuideArticlePage } from "@/components/site/GuideArticlePage";
import { createMetadata } from "@/lib/seo/metadata";

const path = "/zh/guides/compress-image-to-100kb-without-uploading";

export const metadata = createMetadata({
  title: "图片怎么压缩到 100KB 且不上传服务器",
  description:
    "实测把图片压缩到 100KB 以下且不上传服务器的方法，包含 PicZip 设置、准确字节数、截图和未达标时的调整建议。",
  path,
  type: "article",
});

export default function Page() {
  return (
    <GuideArticlePage
      locale="zh"
      title="图片压缩到 100KB 且不上传服务器：一次真实测试"
      description="我们用一张 2.8 MB 的 PNG 实际跑了一遍，记录设置、准确字节数、截图，以及图片压不下去时应该先改什么。"
      path={path}
      publishedAt="2026-07-29"
      verifiedAt="2026-07-29"
      readingTime="约 7 分钟"
      breadcrumbLabel="图片压缩到 100KB 且不上传"
      image="/guides/compress-image-to-100kb-without-uploading/piczip-100kb-result-zh.jpg"
      howToSteps={[
        "打开 PicZip 的 100KB 图片压缩工具。",
        "添加 JPG、PNG 或 WebP 图片，检查目标大小、输出格式、质量和最大宽度。",
        "开始压缩，确认输出大小符合要求后再下载。",
      ]}
    >
      <p>
        想把图片压缩到 100KB 以下，又不希望先上传服务器，可以直接在浏览器里处理。打开 PicZip
        的 100KB 工具，目标大小保留 100，输出格式先选 Auto，然后开始压缩。若结果仍然偏大，
        或者画面已经明显模糊，优先降低最大宽度，不要一味把质量拉低。
      </p>
      <p>
        这不是根据参数推算出来的结论。我们用一张 2,976,317 字节的 PNG 做了完整测试，
        最终得到 101,730 字节的 WebP，尺寸仍是 1536×1024，图片文件没有上传到处理服务器。
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">这次测试得到了什么结果</h2>
      <p>
        测试图是一张海边小镇风景图，包含云层、水面、屋顶和树木。它比纯色图更容易暴露压缩后的涂抹、
        色块和边缘损失，同时不包含证件照或私人材料，方便后续重复测试。
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <tbody>
            <ResultRow label="原图" value="PNG，1536×1024，2,976,317 字节" />
            <ResultRow
              label="压缩设置"
              value="目标 100KB，Auto 输出，质量 82，最大宽度 2400px"
            />
            <ResultRow label="压缩结果" value="WebP，1536×1024，101,730 字节" />
            <ResultRow label="减少体积" value="2,874,587 字节，约 96.58%" />
          </tbody>
        </table>
      </div>
      <p>
        PicZip 按 1KB 等于 1024 字节计算，因此 100KB 的上限是 102,400 字节。这次输出比上限少
        670 字节。部分报名系统会按 100,000 字节计算，也有系统只看界面显示的整数 KB。遇到要求特别严格的
        表单，下载后应再查看文件属性，不要只凭页面上的“99 KB”判断。
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">第一步：打开 100KB 压缩工具</h2>
      <p>
        进入 PicZip 的
        <Link
          className="font-black text-teal-700 underline-offset-4 hover:underline"
          href="/zh/compress-image-to-100kb"
        >
          100KB 图片压缩工具
        </Link>
        。这个页面已经把目标大小设为 100，不需要先猜一个质量百分比。
      </p>
      <p>
        图片的解码、缩放、格式转换和压缩都在浏览器中执行。对证件照、报名材料、内部截图来说，
        这比先把文件交给陌生服务器更合适。
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">第二步：添加图片并检查四项设置</h2>
      <p>拖入 JPG、PNG 或 WebP 图片后，先看下面四项，不要急着点击压缩：</p>
      <ol className="list-decimal space-y-2 pl-6">
        <li><strong>目标大小：</strong>保持 100。</li>
        <li><strong>输出格式：</strong>第一次选 Auto，让工具保留体积更小的结果。</li>
        <li><strong>质量：</strong>可以从 82 开始，目标大小算法会在需要时继续寻找更小结果。</li>
        <li><strong>最大宽度：</strong>先保留 2400px；若上传方有尺寸要求，则按要求填写。</li>
      </ol>
      <figure className="py-3">
        <Image
          className="h-auto w-full border border-black/10"
          src="/guides/compress-image-to-100kb-without-uploading/piczip-100kb-settings-zh.jpg"
          alt="PicZip 中文界面设置为目标 100KB、Auto 输出、质量 82 和最大宽度 2400px"
          width={1265}
          height={712}
          sizes="(max-width: 896px) 100vw, 832px"
        />
        <figcaption className="mt-2 text-sm leading-6 text-slate-500">
          本次测试使用的设置。原图只在当前浏览器中读取。
        </figcaption>
      </figure>

      <h2 className="pt-3 text-3xl font-black text-foreground">第三步：开始压缩并核对结果</h2>
      <p>
        点击<strong>开始压缩</strong>，等状态变为 Done。结果栏会同时显示原始大小、输出大小和压缩比例。
        本次 Auto 选择了 WebP，页面显示输出 99 KB；我们从结果对象读取到的准确值是 101,730 字节。
      </p>
      <p>
        原图宽度只有 1536px，没有超过 2400px 上限，因此输出仍是 1536×1024，没有发生缩放。
        这次大幅减小体积的主要原因，是详细的 PNG 被转换成了有损 WebP，而不是图片尺寸被偷偷裁小。
      </p>
      <figure className="py-3">
        <Image
          className="h-auto w-full border border-black/10"
          src="/guides/compress-image-to-100kb-without-uploading/piczip-100kb-result-zh.jpg"
          alt="PicZip 中文界面显示 2.8MB PNG 压缩为 99KB，页面显示减少 97%"
          width={1265}
          height={712}
          sizes="(max-width: 896px) 100vw, 832px"
        />
        <figcaption className="mt-2 text-sm leading-6 text-slate-500">
          实际完成后的结果页：输出 99 KB，图片尺寸保持不变。
        </figcaption>
      </figure>

      <h2 className="pt-3 text-3xl font-black text-foreground">压不到 100KB 时，先改什么</h2>
      <p>
        一张 6000px 的风景照和一张背景简单的头像，即使都要求 100KB，最终清晰度也不会一样。
        第一次结果不理想时，每次只改一个变量，才能知道问题出在哪里。
      </p>

      <h3 className="pt-2 text-2xl font-black text-foreground">先降低最大宽度</h3>
      <p>
        如果报名系统只显示一张小头像，可以把最大宽度改成 1600px 或 1200px 再压一次。删掉最终根本不会
        显示的像素，通常比保留超大尺寸、再用极低质量硬压更清楚。
      </p>
      <p>
        但材料扫描件不能照搬这个做法。小字、印章和证件边缘需要足够像素，下载后应按 100% 比例检查，
        确认文字和人脸仍可辨认。
      </p>

      <h3 className="pt-2 text-2xl font-black text-foreground">照片优先考虑 JPG 或 WebP</h3>
      <p>
        PNG 更适合透明背景、界面截图和硬边图形，保存照片时往往偏大。如果目标是让照片进入 100KB，
        Auto、JPG 或 WebP 通常更实际。
      </p>
      <p>
        上传表单如果明确只收 JPG，就要在输出格式中选 JPG，不能继续使用 Auto。体积再小的 WebP，
        被表单拒绝也没有意义。
      </p>

      <h3 className="pt-2 text-2xl font-black text-foreground">把 100KB 当成上限，不是画质参数</h3>
      <p>
        质量滑块决定第一次编码从什么画质开始，目标大小则要求 PicZip 在结果仍过大时继续寻找更小文件。
        两者不是同一个设置。
      </p>
      <p>
        头发、树叶、噪点和小字都比纯色背景难压。真正合格的结果，是在满足上传限制的同时仍能完成用途，
        而不是压缩比例最高的那一张。
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">“不上传”具体指什么</h2>
      <p>
        在 PicZip 压缩流程中，用户选中的图片文件不会发往图片处理服务器，相关计算在浏览器中完成。
        具体实现和边界可以查看
        <Link
          className="font-black text-teal-700 underline-offset-4 hover:underline"
          href="/zh/compress-image-without-upload"
        >
          不上传服务器压缩图片
        </Link>
        页面。
      </p>
      <p>
        网站本身仍要正常加载 HTML、JavaScript 和字体等网页资源。“不上传”专指你选择用来压缩的图片文件，
        并不是说打开网页后完全没有网络请求。
      </p>

      <h2 className="pt-3 text-3xl font-black text-foreground">常见问题</h2>
      <Faq question="能不能把图片压成正好 100KB？">
        PicZip 把 100KB 作为尽量不超过的目标，不承诺输出正好等于 100,000 或 102,400 字节。
        图片内容和编码器可用参数都会影响最终大小。本次结果是 101,730 字节。
      </Faq>
      <Faq question="为什么 PNG 压完变成了 WebP？">
        输出格式选 Auto 时，PicZip 会比较原格式和 WebP 的结果，并保留更小的文件。本次 WebP 明显更小。
        如果上传方指定 PNG 或 JPG，请手动选择对应格式。
      </Faq>
      <Faq question="降低最大宽度会裁掉图片吗？">
        不会。最大宽度会按原比例缩放整张图片，不会裁掉边缘。例如 3000×2000 的图片缩到 1500px 宽，
        输出会是 1500×1000。
      </Faq>
      <Faq question="报名表只接受 JPG 怎么办？">
        把输出格式从 Auto 改成 JPG，再执行压缩。随后同时检查文件后缀、文件大小和像素尺寸，
        三项都符合上传要求后再提交。
      </Faq>

      <h2 className="pt-3 text-3xl font-black text-foreground">最后给一个直接可用的做法</h2>
      <p>
        先用 100KB 预设、Auto 输出、质量 82 和默认最大宽度跑一次。下载并查看结果；只有在未达到上限，
        或原图像素远高于实际用途时，再降低最大宽度。
      </p>
      <p>
        我们这张测试图在不缩小尺寸的情况下得到 101,730 字节，但这只是一次可复现结果，不代表所有图片
        都能保持同样画质。打开
        <Link
          className="font-black text-teal-700 underline-offset-4 hover:underline"
          href="/zh/compress-image-to-100kb"
        >
          PicZip 100KB 图片压缩工具
        </Link>
        ，用你自己的图片实际检查一次，结果比任何固定参数更可靠。
      </p>
    </GuideArticlePage>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-black/10">
      <th className="w-40 bg-slate-50 px-4 py-3 font-black text-foreground">{label}</th>
      <td className="px-4 py-3">{value}</td>
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
