'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Download, ImagePlus, Trash2 } from 'lucide-react';
import { zip } from 'fflate';
import { ReceiveTransfer } from '@/components/workflow/ReceiveTransfer';
import { ContinueProcessing } from '@/components/workflow/ContinueProcessing';
import { createZipEntries } from '@/lib/compression/download';
import { directoryTools } from '@/lib/navigation/directory';
import type { Locale } from '@/lib/i18n/config';
import { PIPELINE_KEY, parsePipelines, pipelineInputAllowed, readSavedPresets, runPipelineStep, stepFromPreset, validPipeline, type Pipeline, type PipelineStep } from '@/lib/workflow/pipelines';
import { PRESET_KEY, type Preset } from '@/lib/workflow/settings';
import type { TransferImage } from '@/lib/workflow/transfer';
import copy from '@/lib/next-features/messages.json';

type Output = TransferImage & { url: string };
export function PipelineApp({ locale }: { locale: Locale }) {
  const t = copy[locale].flow, c = copy[locale].common;
  const [presets, setPresets] = useState<Preset[]>([]), [saved, setSaved] = useState<Pipeline[]>([]), [steps, setSteps] = useState<PipelineStep[]>([]);
  const [choice, setChoice] = useState(''), [selected, setSelected] = useState(''), [name, setName] = useState(''), [loadedId, setLoadedId] = useState('');
  const [files, setFiles] = useState<File[]>([]), [results, setResults] = useState<Output[]>([]), [busy, setBusy] = useState(false), [receiving, setReceiving] = useState(true);
  const [status, setStatus] = useState(''), [error, setError] = useState(''), [storageError, setStorageError] = useState(false);
  const input = useRef<HTMLInputElement>(null), abort = useRef<AbortController | null>(null), urls = useRef(new Set<string>());
  useEffect(() => {
    let active = true;
    const load = () => { if (!active) return; try { setPresets(readSavedPresets(localStorage.getItem(PRESET_KEY))); setSaved(parsePipelines(localStorage.getItem(PIPELINE_KEY))); } catch { setStorageError(true); } };
    queueMicrotask(load); window.addEventListener('storage', load);
    const owned = urls.current; return () => { active = false; window.removeEventListener('storage', load); abort.current?.abort(); owned.forEach(URL.revokeObjectURL); owned.clear(); };
  }, []);
  function clearResults() { results.forEach(r => { URL.revokeObjectURL(r.url); urls.current.delete(r.url); }); setResults([]); }
  function add(incoming: File[]) {
    if (busy) return;
    const next = [...files]; let total = files.reduce((n, f) => n + f.size, 0);
    for (const file of incoming) {
      if (!/\.(jpe?g|png|webp)$/i.test(file.name) || next.length >= 50 || file.size > 50 * 1024 * 1024 || total + file.size > 200 * 1024 * 1024) { setError(t.invalid); break; }
      total += file.size;
      const type = /\.png$/i.test(file.name) ? 'image/png' : /\.webp$/i.test(file.name) ? 'image/webp' : 'image/jpeg';
      next.push(file.type ? file : new File([file], file.name, { type }));
    }
    setFiles(next); clearResults(); setStatus('');
  }
  function move(index: number, offset: number) { const next = [...steps]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; setSteps(next); clearResults(); }
  function save() {
    const loaded = saved.find(p => p.id === loadedId && p.name === name.trim());
    const value: Pipeline = { id: loaded?.id || crypto.randomUUID(), name: name.trim(), steps: structuredClone(steps) };
    if (storageError || !validPipeline(value)) { setError(t.invalid); return; }
    try {
      const current = parsePipelines(localStorage.getItem(PIPELINE_KEY));
      const others = current.filter(p => p.id !== value.id);
      if (others.length >= 10 || others.some(p => p.name.toLocaleLowerCase() === value.name.toLocaleLowerCase())) { setError(t.invalid); return; }
      const next = [...others, value]; localStorage.setItem(PIPELINE_KEY, JSON.stringify(next)); setSaved(next); setSelected(value.id); setLoadedId(value.id); setStatus(t.save); setError('');
    }
    catch { setStorageError(true); }
  }
  function removeSaved() {
    try { const next = parsePipelines(localStorage.getItem(PIPELINE_KEY)).filter(p => p.id !== selected); localStorage.setItem(PIPELINE_KEY, JSON.stringify(next)); setSaved(next); setSelected(''); }
    catch { setStorageError(true); }
  }
  async function run() {
    const initial: TransferImage[] = files.map(file => ({ name: file.name, blob: file }));
    if (!validPipeline({ id: 'check', name: 'check', steps }) || !pipelineInputAllowed(initial, steps)) { setError(t.invalid); return; }
    const controller = new AbortController(); abort.current = controller; setBusy(true); setError(''); clearResults();
    let current = initial;
    try {
      for (let i = 0; i < steps.length; i++) {
        if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        setStatus(t.processing.replace('{current}', String(i + 1)).replace('{total}', String(steps.length)).replace('{name}', steps[i].name));
        const next = await runPipelineStep(current, steps[i], controller.signal);
        if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        current = next;
        setResults(previous => { previous.forEach(r => { URL.revokeObjectURL(r.url); urls.current.delete(r.url); }); return next.map(image => { const url = URL.createObjectURL(image.blob); urls.current.add(url); return { ...image, url }; }); });
      }
      setStatus(t.done);
    } catch { setError(controller.signal.aborted ? t.cancel : t.failed); setStatus(''); }
    finally { abort.current = null; setBusy(false); }
  }
  async function downloadZip() {
    try {
      const entries = createZipEntries(await Promise.all(results.map(async r => ({ outputName: r.name, buffer: await r.blob.arrayBuffer() }))));
      const bytes = await new Promise<Uint8Array<ArrayBuffer>>((resolve, reject) => zip(entries, { level: 0 }, (err, data) => err ? reject(err) : resolve(data as Uint8Array<ArrayBuffer>)));
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/zip' })); const a = document.createElement('a'); a.href = url; a.download = 'piczip-workflow.zip'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch { setError(c.error); }
  }
  const labels = directoryTools(locale);
  return <div className="feature-card"><ReceiveTransfer tool="flow" locale={locale} onReceive={add} onBusyChange={setReceiving} />
    <div className="feature-grid"><div><h2 className="settings-title">01 / {t.steps}</h2>
      <p className="field-hint">{t.hint}</p><p className="field-hint">{t.note}</p>
      <label className="tool-field">{t.presets}<select aria-label={t.choose} value={choice} disabled={busy || storageError} onChange={e => setChoice(e.target.value)}><option value="">{t.choose}</option>{presets.map(p => <option key={p.id} value={p.id}>{labels.find(x => x.id === p.tool)?.label ?? p.tool} · {p.name}</option>)}</select></label>
      <button type="button" className="secondary-button" disabled={!choice || steps.length >= 6 || busy} onClick={() => { const p = presets.find(p => p.id === choice); if (p) { setSteps([...steps, stepFromPreset(p)]); clearResults(); } }}>{t.add}</button>
      {!presets.length && <p className="field-hint">{t.empty}</p>}
      <ol className="feature-file-list feature-step-list">{steps.map((step, i) => <li key={i} data-step={step.tool}><span className="feature-file-icon">{i + 1}</span><span><strong>{labels.find(x => x.id === step.tool)?.label ?? step.tool}</strong><small>{step.name}</small></span><div><button type="button" disabled={busy || i === 0} aria-label={`${c.up} ${step.name}`} onClick={() => move(i, -1)}><ArrowUp size={16} /></button><button type="button" disabled={busy || i === steps.length - 1} aria-label={`${c.down} ${step.name}`} onClick={() => move(i, 1)}><ArrowDown size={16} /></button><button type="button" disabled={busy} aria-label={`${c.remove} ${step.name}`} onClick={() => { setSteps(steps.filter((_, n) => n !== i)); clearResults(); }}><Trash2 size={16} /></button></div></li>)}</ol>
      <label className="tool-field">{t.name}<input type="text" maxLength={60} value={name} disabled={busy} onChange={e => setName(e.target.value)} /></label>
      <div className="feature-actions"><button type="button" className="secondary-button" disabled={busy || storageError || !name.trim() || steps.length < 2} onClick={save}>{t.save}</button></div>
      <label className="tool-field">{t.saved}<select aria-label={t.saved} value={selected} disabled={busy || storageError} onChange={e => setSelected(e.target.value)}><option value="">{t.load}</option>{saved.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
      <div className="feature-actions"><button type="button" className="secondary-button" disabled={!selected || busy} onClick={() => { const p = saved.find(p => p.id === selected); if (p) { setSteps(structuredClone(p.steps)); setName(p.name); setLoadedId(p.id); clearResults(); } }}>{t.load}</button><button type="button" className="quiet-button" disabled={!selected || busy} onClick={removeSaved}>{t.remove}</button></div>
    </div><div className="feature-settings"><h2 className="settings-title">02 / {c.files}</h2>
      <input ref={input} type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || receiving} aria-label={copy[locale].pdf.choose} onChange={e => { add(Array.from(e.target.files || [])); e.target.value = ''; }} />
      <button type="button" className="dropzone feature-dropzone" disabled={busy || receiving} onClick={() => input.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); add(Array.from(e.dataTransfer.files)); }}><ImagePlus size={27} /><span>{copy[locale].pdf.choose}</span><small>JPG · PNG · WebP</small></button>
      <ol className="feature-file-list">{files.map((file, i) => <li key={`${file.name}-${i}`} data-input-name={file.name}><span className="feature-file-icon">{i + 1}</span><span><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(1)} MB</small></span><button type="button" disabled={busy} aria-label={`${c.remove} ${file.name}`} onClick={() => { setFiles(files.filter((_, n) => n !== i)); clearResults(); }}><Trash2 size={16} /></button></li>)}</ol>
      <p className="field-hint">{c.limits}</p>
      <div className="feature-actions"><button type="button" className="primary-button" disabled={busy || receiving || !pipelineInputAllowed(files.map(file => ({ name: file.name, blob: file })), steps)} onClick={run}>{t.run}</button>{busy && <button type="button" className="secondary-button" onClick={() => abort.current?.abort()}>{t.cancel}</button>}</div>
      <p role="status">{status}</p>{error && <p role="alert" className="workflow-error">{error}</p>}{storageError && <p role="alert" className="workflow-error">{t.storageError}</p>}
    </div></div>
    {results.length > 0 && <section className="feature-results"><div className="results-heading"><h3>{c.result}</h3>{results.length > 1 && <button type="button" className="secondary-button" onClick={downloadZip}>{t.zip}</button>}</div><div className="tool-output-grid">{results.map((r, i) => <article className="tool-output" key={i}><a className="tool-output-preview" href={r.url} target="_blank" rel="noreferrer" aria-label={r.name}>
      {/* A local object URL cannot use the Next image optimizer. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={r.url} alt={r.name} /></a><div className="tool-output-details"><strong>{r.name}</strong><a className="icon-button" href={r.url} download={r.name} aria-label={`${c.download} ${r.name}`}><Download size={16} /></a></div></article>)}</div>
      <ContinueProcessing tool="flow" locale={locale} count={results.length} getImages={() => results} disabled={busy} />
    </section>}
  </div>;
}
