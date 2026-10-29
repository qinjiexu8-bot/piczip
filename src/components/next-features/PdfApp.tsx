'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Download, FilePlus2, Trash2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { ReceiveTransfer } from '@/components/workflow/ReceiveTransfer';
import type { Locale } from '@/lib/i18n/config';
import { pdfLayout, type Orientation, type Paper } from '@/lib/pdf/layout';
import copy from '@/lib/next-features/messages.json';

type Item = { id: string; file: File; url: string };
const imageType = /\.(jpe?g|png|webp)$/i;
function safeName(value: string) { return (value.trim().replace(/[\\/\x00-\x1f<>:"|?*]/g, '-').slice(0, 80) || 'piczip-images').replace(/\.pdf$/i, '') + '.pdf'; }
export function PdfApp({ locale }: { locale: Locale }) {
  const t = copy[locale].pdf, c = copy[locale].common;
  const [files, setFiles] = useState<Item[]>([]), [paper, setPaper] = useState<Paper>('a4'), [orientation, setOrientation] = useState<Orientation>('portrait');
  const [margin, setMargin] = useState(10), [name, setName] = useState('piczip-images');
  const [busy, setBusy] = useState(false), [receiving, setReceiving] = useState(true), [status, setStatus] = useState(''), [error, setError] = useState('');
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
  const input = useRef<HTMLInputElement>(null), cancelled = useRef(false), urls = useRef(new Set<string>());
  useEffect(() => { const owned = urls.current; return () => { cancelled.current = true; owned.forEach(URL.revokeObjectURL); owned.clear(); }; }, []);
  function clearResult() { if (result) { URL.revokeObjectURL(result.url); urls.current.delete(result.url); } setResult(null); }
  function add(incoming: File[]) {
    if (busy) return;
    const next = [...files]; let total = files.reduce((n, x) => n + x.file.size, 0);
    for (const file of incoming) {
      if (!imageType.test(file.name) || file.size > 50 * 1024 * 1024 || total + file.size > 200 * 1024 * 1024 || next.length >= 50) { setError(t.invalid); break; }
      total += file.size; const url = URL.createObjectURL(file); urls.current.add(url); next.push({ id: crypto.randomUUID(), file, url });
    }
    setFiles(next); clearResult(); setStatus('');
  }
  function remove(id: string) { const item = files.find(f => f.id === id); if (item) { URL.revokeObjectURL(item.url); urls.current.delete(item.url); } setFiles(files.filter(f => f.id !== id)); clearResult(); }
  function move(index: number, offset: number) { const next = [...files]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; setFiles(next); clearResult(); }
  async function create() {
    if (!files.length || !Number.isFinite(margin) || margin < 0 || margin > 50) { setError(t.invalid); return; }
    cancelled.current = false; setBusy(true); setError(''); setStatus(''); clearResult();
    try {
      const pdf = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        if (cancelled.current) return;
        const file = files[i].file; setStatus(t.processing.replace('{current}', String(i + 1)).replace('{total}', String(files.length)));
        const bitmap = await createImageBitmap(file);
        try {
          if (bitmap.width * bitmap.height > 40_000_000) throw new Error('input-limit');
          const box = pdfLayout(bitmap, paper, orientation, margin);
          const scale = Math.min(1, 3000 / Math.max(bitmap.width, bitmap.height));
          const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
          const context = canvas.getContext('2d'); if (!context) throw new Error('canvas');
          context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
          const jpeg = await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('encode')), 'image/jpeg', .92));
          canvas.width = 1; canvas.height = 1;
          const embedded = await pdf.embedJpg(await jpeg.arrayBuffer());
          pdf.addPage([box.width, box.height]).drawImage(embedded, { x: box.x, y: box.y, width: box.imageWidth, height: box.imageHeight });
        } finally { bitmap.close(); }
      }
      if (cancelled.current) return;
      const bytes = await pdf.save(); if (cancelled.current) return;
      if (result) { URL.revokeObjectURL(result.url); urls.current.delete(result.url); }
      const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob); urls.current.add(url); setResult({ url, size: blob.size }); setStatus(`${pdf.getPageCount()} ${t.pages}`);
    } catch { setError(t.failed); setStatus(''); } finally { setBusy(false); }
  }
  return <div className="feature-card">
    <ReceiveTransfer tool="pdf" locale={locale} onBusyChange={setReceiving} onReceive={add} />
    <div className="feature-grid"><div><h2 className="settings-title">01 / {c.files}</h2>
      <input ref={input} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || receiving} aria-label={t.choose} onChange={e => { add(Array.from(e.target.files || [])); e.target.value = ''; }} />
      <button type="button" className="dropzone feature-dropzone" disabled={busy || receiving} onClick={() => input.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); add(Array.from(e.dataTransfer.files)); }}><FilePlus2 size={26} /><span>{t.choose}</span><small>JPG · PNG · WebP</small></button>
      <ol className="feature-file-list">{files.map((item, index) => <li key={item.id} data-input-name={item.file.name}>
        {/* A local object URL cannot use the Next image optimizer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.url} alt="" width="44" height="44" /><span><strong>{item.file.name}</strong><small>{(item.file.size / 1024 / 1024).toFixed(1)} MB</small></span><div><button type="button" aria-label={`${c.up} ${item.file.name}`} disabled={busy || index === 0} onClick={() => move(index, -1)}><ArrowUp size={16} /></button><button type="button" aria-label={`${c.down} ${item.file.name}`} disabled={busy || index === files.length - 1} onClick={() => move(index, 1)}><ArrowDown size={16} /></button><button type="button" aria-label={`${c.remove} ${item.file.name}`} disabled={busy} onClick={() => remove(item.id)}><Trash2 size={16} /></button></div>
      </li>)}</ol><p className="field-hint">{c.limits}</p>
    </div><div className="feature-settings"><h2 className="settings-title">02 / {t.paper}</h2>
      <label className="tool-field">{t.paper}<select disabled={busy} aria-label={t.paper} value={paper} onChange={e => { setPaper(e.target.value as Paper); clearResult(); }}><option value="a4">{t.a4}</option><option value="letter">{t.letter}</option><option value="auto">{t.auto}</option></select></label>
      <label className="tool-field">{t.orientation}<select aria-label={t.orientation} value={orientation} disabled={busy || paper === 'auto'} onChange={e => { setOrientation(e.target.value as Orientation); clearResult(); }}><option value="portrait">{t.portrait}</option><option value="landscape">{t.landscape}</option></select></label>
      <label className="tool-field">{t.margin}<input disabled={busy} type="number" min="0" max="50" value={margin} onChange={e => { setMargin(Number(e.target.value)); clearResult(); }} /></label>
      <label className="tool-field">{t.name}<input type="text" maxLength={80} value={name} onChange={e => setName(e.target.value)} /></label>
      <p className="field-hint">{t.note}</p>
      <div className="feature-actions"><button type="button" className="primary-button" disabled={busy || receiving || !files.length || margin < 0 || margin > 50} onClick={create}>{busy ? t.processing.replace('{current}', '…').replace('{total}', String(files.length)) : t.create}</button>{busy && <button type="button" className="secondary-button" onClick={() => { cancelled.current = true; setStatus(''); }}>{copy[locale].flow.cancel}</button>}</div>
      {result && <a className="secondary-button feature-download" href={result.url} download={safeName(name)}><Download size={16} />{c.download} · {(result.size / 1024 / 1024).toFixed(1)} MB</a>}
      <p role="status">{status}</p>{error && <p role="alert" className="workflow-error">{error}</p>}
    </div></div>
  </div>;
}
