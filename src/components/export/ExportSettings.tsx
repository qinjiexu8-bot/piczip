"use client";
import Link from "next/link";
import { watermarkGuidePath } from "@/lib/guides/watermark-guide";
import { localePath } from "@/lib/i18n/routes";
import type { Locale } from "@/lib/i18n/config";
import { watermarkMessages } from "@/lib/image-tools/watermark-messages";
import { exportNames, type RenameOptions } from "@/lib/export/names";
export function ExportSettings({ locale, value, onChange, names, disabled }: { locale: Locale; value: RenameOptions; onChange: (value: RenameOptions) => void; names: string[]; disabled: boolean }) {
  const t=watermarkMessages[locale];const patch=(p: Partial<RenameOptions>)=>onChange({...value,...p});
  const preview=exportNames(names.length?names:["image.jpg"],value);
  return <details className="export-settings"><summary>{t.export}</summary><div className="preset-content"><fieldset disabled={disabled}>
    <label className="tool-checkbox"><input type="checkbox" checked={value.enabled} onChange={e=>patch({enabled:e.target.checked})}/>{t.rename}</label>
    {value.enabled && <><label className="tool-field">{t.base}<input maxLength={60} value={value.base} onChange={e=>patch({base:e.target.value})}/></label><div className="tool-field-pair">{(["prefix","suffix"] as const).map(key=><label key={key} className="tool-field">{t[key]}<input maxLength={60} value={value[key]} onChange={e=>patch({[key]:e.target.value})}/></label>)}</div><label className="tool-checkbox"><input type="checkbox" checked={value.sequence} onChange={e=>patch({sequence:e.target.checked})}/>{t.sequence}</label>{value.sequence && <label className="tool-field">{t.start}<input type="number" min={1} max={999999} value={value.start} onChange={e=>patch({start:Math.max(1,Math.min(999999,Math.trunc(Number(e.target.value)||1)))})}/></label>}</>}
  </fieldset><p className="field-hint">{t.nameHint}</p><div className="export-name-preview" aria-label={t.names}><strong>{names.length?t.names:t.noFiles}</strong>{preview.slice(0,3).map((name,i)=><code key={i}>{name}</code>)}{preview.length>3 && <span>+{preview.length-3}</span>}</div><Link className="text-teal-700 underline underline-offset-4" href={localePath(watermarkGuidePath,locale)}>{t.guide} →</Link></div></details>;
}
