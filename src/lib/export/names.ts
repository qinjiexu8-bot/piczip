export type RenameOptions = { enabled: boolean; base: string; prefix: string; suffix: string; sequence: boolean; start: number };
export const defaultRename: RenameOptions = { enabled: false, base: "", prefix: "", suffix: "", sequence: true, start: 1 };
export function validRename(v: unknown): v is RenameOptions {
  if (!v || typeof v !== "object") return false;
  const r = v as RenameOptions;
  return typeof r.enabled === "boolean" && typeof r.sequence === "boolean" && [r.base,r.prefix,r.suffix].every(s => typeof s === "string" && s.length <= 60) && Number.isInteger(r.start) && r.start >= 1 && r.start <= 999999;
}
function clean(value: string) {
  const text = value.normalize("NFC").replace(/[\x00-\x1f\x7f<>:"/\\|?*]/g, "_").replace(/^[. ]+|[. ]+$/g, "").slice(0,120).replace(/[. ]+$/g, "") || "image";
  return /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(text) ? `_${text}` : text;
}
/** One naming pass is shared by the UI, downloads, ZIP and transfers. */
export function exportNames(names: string[], options: RenameOptions = defaultRename): string[] {
  if (!validRename(options)) throw new Error("invalid-rename");
  const used = new Set<string>();
  return names.map((name, index) => {
    const match = name.match(/\.([a-z0-9]+)$/i);
    const ext = match ? `.${match[1].toLowerCase()}` : "";
    const original = match ? name.slice(0,-ext.length) : name;
    const stem = clean(options.enabled ? `${options.prefix}${options.base.trim() || original}${options.sequence ? `-${String(options.start+index).padStart(3,"0")}` : ""}${options.suffix}` : original);
    let result = stem + ext, count = 2;
    while (used.has(result.toLowerCase())) result = `${stem} (${count++})${ext}`;
    used.add(result.toLowerCase()); return result;
  });
}
