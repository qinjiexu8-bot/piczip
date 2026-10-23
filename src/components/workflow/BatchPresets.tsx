"use client";
import { useEffect, useId, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { workflowMessages } from "@/lib/workflow/messages";
import { parsePresets, PRESET_KEY, validSettings, type Preset, type Settings, type WorkflowTool } from "@/lib/workflow/settings";

export function BatchPresets({ tool, locale, settings, disabled, onApply }: { tool: WorkflowTool; locale: Locale; settings: Settings; disabled: boolean; onApply: (settings: Settings) => void }) {
  const t = workflowMessages[locale];
  const id = useId();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selected, setSelected] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    const load = () => {
      if (!active) return;
      try { setPresets(parsePresets(localStorage.getItem(PRESET_KEY))); setReady(true); }
      catch { setMessage(t.storage); setReady(false); }
    };
    queueMicrotask(load);
    const sync = (event: StorageEvent) => { if (event.key === PRESET_KEY || event.key === null) load(); };
    window.addEventListener("storage", sync);
    return () => { active = false; window.removeEventListener("storage", sync); };
  }, [t.storage]);
  const choices = presets.filter(p => p.tool === tool);
  const current = choices.find(p => p.id === selected);
  function save() {
    if (!name.trim() || name.trim().length > 60 || !validSettings(tool, settings)) { setMessage(t.invalid); return; }
    try {
      const all = parsePresets(localStorage.getItem(PRESET_KEY));
      if (all.some(p => p.tool === tool && p.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase())) { setMessage(t.duplicate); return; }
      if (all.filter(p => p.tool === tool).length >= 20) { setMessage(t.full); return; }
      const preset: Preset = { id: crypto.randomUUID(), tool, name: name.trim(), settings: structuredClone(settings) };
      const next = [...all, preset];
      localStorage.setItem(PRESET_KEY, JSON.stringify(next));
      setPresets(next); setSelected(preset.id); setName(""); setMessage(t.saved);
    } catch { setMessage(t.storage); }
  }
  function remove() {
    try {
      const next = parsePresets(localStorage.getItem(PRESET_KEY)).filter(p => p.id !== selected);
      localStorage.setItem(PRESET_KEY, JSON.stringify(next));
      setPresets(next); setSelected(""); setMessage(t.deleted);
    } catch { setMessage(t.storage); }
  }
  return <details className="batch-presets" data-tool={tool}>
    <summary><Bookmark size={15} aria-hidden="true" />{t.presets}<span>{choices.length}</span></summary>
    <div className="preset-content">
      <p>{t.hint}</p>
      <fieldset disabled={disabled || !ready}>
        <label htmlFor={`${id}-select`}>{t.choose}</label>
        <div className="preset-row"><select id={`${id}-select`} value={current ? selected : ""} onChange={e => { setSelected(e.target.value); setMessage(""); }}><option value="">{t.choose}</option>{choices.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><button type="button" className="secondary-button" disabled={!current} onClick={() => { if (current) { onApply(structuredClone(current.settings)); setMessage(t.applied); } }}>{t.apply}</button><button type="button" className="icon-button" disabled={!current} aria-label={t.remove} onClick={remove}><Trash2 size={15} /></button></div>
        <label htmlFor={`${id}-name`}>{t.name}</label>
        <input id={`${id}-name`} maxLength={60} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); save(); } }} />
        <button type="button" className="secondary-button preset-save" onClick={save} disabled={!name.trim()}>{t.save}</button>
      </fieldset>
      <p role="status" className="workflow-status">{message}</p>
    </div>
  </details>;
}
