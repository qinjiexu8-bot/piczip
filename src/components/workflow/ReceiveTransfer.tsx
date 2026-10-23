"use client";
import { useEffect, useEffectEvent, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { workflowMessages } from "@/lib/workflow/messages";
import type { WorkflowTool } from "@/lib/workflow/settings";
import { readTransfer, deleteTransfer } from "@/lib/workflow/transfer";
export function ReceiveTransfer({ tool, locale, onReceive, onBusyChange }: { tool: WorkflowTool; locale: Locale; onReceive: (files: File[]) => void; onBusyChange: (busy: boolean) => void }) {
  const t = workflowMessages[locale];
  const [state, setState] = useState<"idle" | "loading" | "received" | "missing" | "importError">("idle");
  const [attempt, setAttempt] = useState(0);
  const receive = useEffectEvent(onReceive);
  const busy = useEffectEvent(onBusyChange);
  useEffect(() => {
    let active = true;
    queueMicrotask(async () => {
      if (!active) return;
      const token = new URL(window.location.href).searchParams.get("transfer");
      if (!token) { busy(false); void deleteTransfer().catch(() => {}); return; }
      setState("loading"); busy(true);
      try {
        const images = await readTransfer(token, tool);
        if (!active) return;
        if (!images) { setState("missing"); busy(false); return; }
        receive(images.map(image => new File([image.blob], image.name, { type: image.blob.type })));
        setState("received"); busy(false);
        const url = new URL(window.location.href); url.searchParams.delete("transfer");
        window.history.replaceState(window.history.state, "", url);
        void deleteTransfer(token).catch(() => {});
      } catch { if (active) { setState("importError"); busy(false); } }
    });
    return () => { active = false; };
  }, [tool, attempt]);
  if (state === "idle") return null;
  return <div className={`transfer-notice ${state === "missing" || state === "importError" ? "is-error" : ""}`} role="status"><p>{t[state]}</p>{state === "importError" && <button type="button" className="quiet-button" onClick={() => setAttempt(value => value + 1)}>{t.retry}</button>}</div>;
}
