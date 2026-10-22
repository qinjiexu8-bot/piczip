import Link from "next/link";
import { ArrowUpRight, Scaling, Replace, PanelsTopLeft } from "lucide-react";
import { toolCatalog } from "@/lib/image-tools/catalog";
import type { ToolKind } from "@/lib/image-tools/types";
const icons = { resize: Scaling, convert: Replace, stitch: PanelsTopLeft };
export function ToolLinks({ locale, current }: { locale: "en" | "zh"; current?: ToolKind }) {
  return <section className="tool-discovery" aria-label={locale === "zh" ? "更多图片工具" : "More image tools"}>
    <div className="tool-discovery-heading"><h2>{locale === "zh" ? "图片处理，再多一点可能" : "A little more room to create"}</h2></div>
    <div className="tool-links-grid">{(Object.keys(toolCatalog) as ToolKind[]).filter(key => key !== current).map(key => {
      const tool = toolCatalog[key]; const Icon = icons[key];
      return <Link key={key} href={`${locale === "zh" ? "/zh" : ""}${tool.path}`} className="tool-link-card"><Icon size={22} /><div><h3>{tool[locale][0]}</h3><p>{tool[locale][1]}</p></div><ArrowUpRight size={16} /></Link>;
    })}</div>
  </section>;
}
