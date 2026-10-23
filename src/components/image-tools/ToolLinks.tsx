import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/routes";
import { siteMessages } from "@/lib/i18n/messages";
import Link from "next/link";
import { Crop, ArrowUpRight, Scaling, Replace, PanelsTopLeft } from "lucide-react";
import { toolCatalog } from "@/lib/image-tools/catalog";
import type { ToolKind } from "@/lib/image-tools/types";
const icons = { crop: Crop, resize: Scaling, convert: Replace, stitch: PanelsTopLeft };
export function ToolLinks({ locale, current }: { locale: Locale; current?: ToolKind }) {
  return <section className="tool-discovery" aria-label={siteMessages[locale].common.moreTools}>
    <div className="tool-discovery-heading"><h2>{siteMessages[locale].common.discovery}</h2></div>
    <div className="tool-links-grid">{(Object.keys(toolCatalog) as ToolKind[]).filter(key => key !== current).map(key => {
      const tool = toolCatalog[key]; const Icon = icons[key];
      return <Link key={key} href={localePath(tool.path, locale)} className="tool-link-card"><Icon size={22} /><div><h3>{tool[locale][0]}</h3><p>{tool[locale][1]}</p></div><ArrowUpRight size={16} /></Link>;
    })}</div>
  </section>;
}
