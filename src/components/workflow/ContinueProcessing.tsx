"use client";
import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/routes";
import { workflowMessages } from "@/lib/workflow/messages";
import type { WorkflowTool } from "@/lib/workflow/settings";
import { saveTransfer, transferAllowed, type TransferImage } from "@/lib/workflow/transfer";
const paths: Record<WorkflowTool, string> = { compress: "/", resize: "/resize-image", convert: "/convert-image", stitch: "/stitch-images", crop: "/crop-image" };
export function ContinueProcessing({ tool, locale, count, getImages, disabled, stale = false }: { tool: WorkflowTool; locale: Locale; count: number; getImages: () => TransferImage[]; disabled: boolean; stale?: boolean }) {
  const t = workflowMessages[locale];
  const id = useId();
  const [target, setTarget] = useState<WorkflowTool>(tool === "compress" ? "resize" : "compress");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  async function send() {
    setError(""); setSending(true);
    try {
      const images = getImages();
      if (!transferAllowed(images, target)) { setError(t.limit); setSending(false); return; }
      const token = await saveTransfer(images, target);
      window.location.assign(`${localePath(paths[target], locale)}?transfer=${encodeURIComponent(token)}`);
    } catch { setError(t.transferError); setSending(false); }
  }
  return <div className="continue-processing">
    <div><h4>{t.next}</h4><p>{t.nextHint}</p><span className="workflow-count">{t.count.replace("{count}", String(count))}</span></div>
    <div className="continue-controls"><label htmlFor={id}>{t.target}</label><div className="preset-row"><select id={id} disabled={disabled || sending} value={target} onChange={e => { setTarget(e.target.value as WorkflowTool); setError(""); }}>{(Object.keys(paths) as WorkflowTool[]).filter(key => key !== tool).map(key => <option value={key} key={key}>{t[key]}</option>)}</select><button type="button" className="primary-button" disabled={disabled || stale || sending || !count} onClick={send}>{sending ? t.sending : t.transfer}<ArrowRight size={15} /></button></div></div>
    <p className="workflow-note">{stale ? t.stale : t.temporary}</p>
    {error && <p className="workflow-error" role="alert">{error}</p>}
  </div>;
}
