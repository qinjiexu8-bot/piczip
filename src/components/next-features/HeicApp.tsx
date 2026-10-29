'use client';
import { useEffect, useRef, useState } from 'react';
import { Download, ImagePlus, Trash2 } from 'lucide-react';
import { zip } from 'fflate';
import { ContinueProcessing } from '@/components/workflow/ContinueProcessing';
import { createZipEntries } from '@/lib/compression/download';
import type { Locale } from '@/lib/i18n/config';
import copy from '@/lib/next-features/messages.json';
import { convertHeicFile } from '@/lib/next-features/heic-client';

type Result = { name: string; blob: Blob; url: string; width: number; height: number };
const heicName = /\.(heic|heif)$/i;
const outputName = (name: string, format: 'jpeg' | 'png') => name.replace(/\.(heic|heif)$/i, '') + (format === 'jpeg' ? '.jpg' : '.png');
export function HeicApp({ locale }: { locale: Locale }) {
  const t = copy[locale].heic, c = copy[locale].common;
  const [files, setFiles] = useState<File[]>([]), [format, setFormat] = useState<'jpeg' | 'png'>('jpeg'), [quality, setQuality] = useState(90);
  const [results, setResults] = useState<Result[]>([]), [busy, setBusy] = useState(false), [status, setStatus] = useState(''), [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null), abort = useRef<AbortController | null>(null), urls = useRef(new Set<string>());
  useEffect(() => { const owned = urls.current; return () => { abort.current?.abort(); owned.forEach(URL.revokeObjectURL); owned.clear(); }; }, []);
  function clearResults() { results.forEach(r => { URL.revokeObjectURL(r.url); urls.current.delete(r.url); }); setResults([]); }
  function add(incoming: File[]) {
    if (busy) return;
    let total = files.reduce((n, f) => n + f.size, 0); const next = [...files];
    for (const file of incoming) {
      if (!heicName.test(file.name) || file.size > 50 * 1024 * 1024 || total + file.size > 200 * 1024 * 1024 || next.length >= 50) { setError(t.invalid); break; }
      total += file.size; next.push(file);
    }
    setFiles(next); clearResults(); setStatus('');
  }
  async function convert() {
    if (!files.length) { setError(t.invalid); return; }
    setBusy(true); setError(''); clearResults();
    const controller = new AbortController(); abort.current = controller;
    try {
      for (let i = 0; i < files.length; i++) {
        if (controller.signal.aborted) break;
        const file = files[i]; setStatus(t.processing.replace('{current}', String(i + 1)).replace('{total}', String(files.length)));
        try {
          const converted = await convertHeicFile(file, format, quality, controller.signal);
          if (controller.signal.aborted) break;
          const url = URL.createObjectURL(converted.blob); urls.current.add(url);
          setResults(previous => [...previous, { name: outputName(file.name, format), blob: converted.blob, url, width: converted.width, height: converted.height }]);
        } catch { if (!controller.signal.aborted) setError(previous => previous + (previous ? '\n' : '') + `${file.name}: ${t.failed}`); }
      }
    } catch { setError(c.error); } finally { abort.current = null; setBusy(false); setStatus(''); }
  }
  async function downloadZip() {
    try {
      const entries = createZipEntries(await Promise.all(results.map(async r => ({ outputName: r.name, buffer: await r.blob.arrayBuffer() }))));
      const bytes = await new Promise<Uint8Array<ArrayBuffer>>((resolve, reject) => zip(entries, { level: 0 }, (err, data) => err ? reject(err) : resolve(data as Uint8Array<ArrayBuffer>)));
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/zip' }));
      const a = document.createElement('a'); a.href = url; a.download = 'piczip-heic.zip'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch { setError(c.error); }
  }
  return <div className="feature-card"><div className="feature-grid"><div><h2 className="settings-title">01 / {c.files}</h2>
    <input ref={input} className="sr-only" type="file" accept=".heic,.heif,image/heic,image/heif" multiple disabled={busy} aria-label={t.choose} onChange={e => { add(Array.from(e.target.files || [])); e.target.value = ''; }} />
    <button type="button" className="dropzone feature-dropzone" disabled={busy} onClick={() => input.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); add(Array.from(e.dataTransfer.files)); }}><ImagePlus size={27} /><span>{t.choose}</span><small>HEIC · HEIF</small></button>
    <ol className="feature-file-list">{files.map((file, index) => <li key={`${file.name}-${index}`} data-input-name={file.name}><span className="feature-file-icon">{index + 1}</span><span><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(1)} MB</small></span><button type="button" aria-label={`${c.remove} ${file.name}`} disabled={busy} onClick={() => { setFiles(files.filter((_, i) => i !== index)); clearResults(); }}><Trash2 size={16} /></button></li>)}</ol><p className="field-hint">{c.limits}</p>
  </div><div className="feature-settings"><h2 className="settings-title">02 / {t.format}</h2>
    <label className="tool-field">{t.format}<select disabled={busy} aria-label={t.format} value={format} onChange={e => { setFormat(e.target.value as 'jpeg' | 'png'); clearResults(); }}><option value="jpeg">JPG</option><option value="png">PNG</option></select></label>
    {format === 'jpeg' && <label className="tool-field">{t.quality}<span className="quality-field"><input disabled={busy} type="range" min="20" max="100" value={quality} onChange={e => { setQuality(Number(e.target.value)); clearResults(); }} /><output>{quality}%</output></span></label>}
    <p className="field-hint">{t.note}</p>
      <div className="feature-actions"><button type="button" className="primary-button" disabled={busy || !files.length} onClick={convert}>{t.convert}</button>{busy && <button type="button" className="secondary-button" onClick={() => abort.current?.abort()}>{copy[locale].flow.cancel}</button>}</div>
    <p role="status">{status}</p>{error && <p role="alert" className="workflow-error">{error}</p>}
  </div></div>
  {results.length > 0 && <section className="feature-results"><div className="results-heading"><h3>{c.result}</h3>{results.length > 1 && <button type="button" className="secondary-button" onClick={downloadZip}>{copy[locale].flow.zip}</button>}</div><div className="tool-output-grid">{results.map((r, i) => <article className="tool-output" key={i} data-output-width={r.width} data-output-height={r.height}><a className="tool-output-preview" href={r.url} target="_blank" rel="noreferrer" aria-label={r.name}>
    {/* A local object URL cannot use the Next image optimizer. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={r.url} alt={r.name} /></a><div className="tool-output-details"><strong>{r.name}</strong><span>{r.width} × {r.height}</span><a className="icon-button" href={r.url} download={r.name} aria-label={`${c.download} ${r.name}`}><Download size={16} /></a></div></article>)}</div>
    <ContinueProcessing tool="heic" locale={locale} count={results.length} getImages={() => results.map(r => ({ name: r.name, blob: r.blob }))} disabled={busy} />
  </section>}
  </div>;
}
