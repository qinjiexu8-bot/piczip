import { watermarkMessages } from "@/lib/image-tools/watermark-messages";
import { watermarkGuidePath, watermarkGuideDescriptions } from "@/lib/guides/watermark-guide";
import { cropGuides, cropGuidePath } from "@/lib/guides/crop-guide";
import { localePath } from "@/lib/i18n/routes";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getToolGuides, toolGuidePath } from "@/lib/guides/tool-guides";
import type { GuideLocale } from "@/lib/guides/tool-guide-types";
export function ToolGuideLinks({ locale }: { locale: GuideLocale }) {
  return <section aria-labelledby="tool-guides-title" className="border-b border-black/10 pb-8">
    <h2 id="tool-guides-title" className="mb-4 text-xl font-semibold text-foreground">{locale === "zh" ? "裁剪、尺寸、格式与拼接" : "Cropping, dimensions, formats and layouts"}</h2>
    <div className="grid gap-3">
      {getToolGuides(locale).map(guide => <Link key={guide.slug} href={toolGuidePath(guide.slug, locale)} className="group rounded-xl border border-black/10 bg-white px-5 py-4 transition-colors hover:border-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700">
        <div className="flex items-start justify-between gap-4"><h3 className="font-semibold leading-7 text-foreground">{guide.label}</h3><ArrowUpRight aria-hidden="true" size={19} className="mt-1 shrink-0 text-teal-700" /></div>
        <p className="mt-1 text-sm leading-6 text-slate-600">{guide.description}</p>
        <span className="mt-2 block text-xs text-slate-500">{guide.readingTime}</span>
      </Link>)}
      <Link href={localePath(cropGuidePath, locale)} className="rounded-xl border border-black/10 bg-white px-5 py-4 hover:border-teal-500">
        <h3 className="font-semibold leading-7 text-foreground">{cropGuides[locale].title} ↗</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{cropGuides[locale].description}</p>
      </Link>
      <Link href={localePath(watermarkGuidePath,locale)} className="rounded-xl border border-black/10 bg-white px-5 py-4 hover:border-teal-500"><h3 className="font-semibold leading-7 text-foreground">{watermarkMessages[locale].guide} ↗</h3><p className="mt-1 text-sm leading-6 text-slate-600">{watermarkGuideDescriptions[locale]}</p></Link>
    </div>
  </section>;
}
