"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowDown, ArrowUp, Download, ImagePlus, Plus, Trash2 } from "lucide-react";
import { zip } from "fflate";
import type { ToolFile, ToolKind, ToolOptions, ToolResponse, ToolResult } from "@/lib/image-tools/types";
import { toolsMessages, type ToolMessageKey } from "@/lib/i18n/messages";
import { interpolate, type Locale } from "@/lib/i18n/config";
import { createZipEntries } from "@/lib/compression/download";

import { BatchPresets } from "@/components/workflow/BatchPresets";
import { ContinueProcessing } from "@/components/workflow/ContinueProcessing";
import { ReceiveTransfer } from "@/components/workflow/ReceiveTransfer";

import { CropControls, CropEditor } from "./CropEditor";
import { defaultCrop } from "@/lib/image-tools/crop";
import { cropMessages } from "@/lib/image-tools/crop-messages";

const subscribeToHydration = () => () => {};

type Input = ToolFile & { url: string };
type Result = ToolResult & { url: string };
const sizeLabel = (n: number) => n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
const initialOptions = (tool: ToolKind): ToolOptions => ({ tool, ...(tool === "crop" ? { crop: { ...defaultCrop } } : {}), resize: { mode: "pixels", width: 1200, height: 0, percent: 50, lock: true }, format: (tool === "resize" || tool === "crop") ? "original" : tool === "stitch" ? "png" : "webp", quality: 90, background: "#ffffff", transparent: false, direction: "vertical", edge: 800, gap: 16 });

export function ImageToolApp({ tool, locale }: { tool: ToolKind; locale: Locale }) {
  const ready = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const t = (key: ToolMessageKey, values: Record<string, string | number> = {}) => interpolate(toolsMessages[locale][key], values);
  const [files, setFiles] = useState<Input[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [options, setOptions] = useState(() => initialOptions(tool));
  const [receiving, setReceiving] = useState(true);
  const [busy, setBusy] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [stale, setStale] = useState(false);
  const worker = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urls = useRef(new Set<string>());
  const input = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  const limit = tool === "stitch" ? 20 : 50;
  const ownUrl = (blob: Blob) => { const url = URL.createObjectURL(blob); urls.current.add(url); return url; };
  const revoke = (url: string) => { URL.revokeObjectURL(url); urls.current.delete(url); };
  useEffect(() => {
    mounted.current = true;
    const ownedUrls = urls.current;
    return () => { mounted.current = false; worker.current?.terminate(); worker.current = null; if (timer.current) clearTimeout(timer.current); ownedUrls.forEach(URL.revokeObjectURL); ownedUrls.clear(); };
  }, []);
  function stop() { worker.current?.terminate(); worker.current = null; if (timer.current) clearTimeout(timer.current); timer.current = null; setBusy(false); }
  function change(patch: Partial<ToolOptions>) { setOptions(value => ({ ...value, ...patch })); if (results.length) setStale(true); }
  function clearResults() { results.forEach(result => revoke(result.url)); setResults([]); setStale(false); }
  function addFiles(incoming: File[], transferred = false) {
    if (!transferred && (!ready || busy || receiving)) return;
    if (transferred && (busy || files.length + incoming.length > limit || [...files.map(item => item.file), ...incoming].reduce((sum, file) => sum + file.size, 0) > 200 * 1024 * 1024)) throw new Error("transfer-limit");
    let total = files.reduce((sum, item) => sum + item.file.size, 0);
    const accepted: Input[] = []; const rejected: string[] = [];
    for (const file of incoming) {
      if (!/\.(png|jpe?g|webp)$/i.test(file.name)) { rejected.push(`${file.name}: ${t("Use JPG, PNG or WebP.")}`); continue; }
      if (files.length + accepted.length >= limit) { rejected.push(t("limit", { count: limit })); break; }
      if (file.size > 50 * 1024 * 1024 || total + file.size > 200 * 1024 * 1024) { rejected.push(`${file.name}: ${t("50 MB per file; 200 MB total limit.")}`); continue; }
      total += file.size; accepted.push({ id: crypto.randomUUID(), file, url: ownUrl(file) });
    }
    setFiles([...files, ...accepted]); setErrors(rejected); setStatus(""); if (accepted.length && results.length) setStale(true);
  }
  function remove(id: string) { const item = files.find(item => item.id === id); if (item) revoke(item.url); setFiles(files.filter(item => item.id !== id)); if (results.length) setStale(true); }
  function move(index: number, offset: number) { const next = [...files]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; setFiles(next); if (results.length) setStale(true); }
  function clear() { stop(); files.forEach(item => revoke(item.url)); setFiles([]); clearResults(); setErrors([]); setStatus(""); }
  function describeError(code: string) {
    if (code === "invalid-crop") return cropMessages[locale].invalid;
    const messages: Record<string, [string, string]> = {
      "output-limit": ["Output exceeds 8192 px per side or 16 megapixels. Reduce the dimensions.", "输出超过单边 8192 像素或 1600 万像素，请调小尺寸。"],
      "input-limit": ["Input exceeds 50 MB or 40 megapixels.", "原图超过 50 MB 或 4000 万像素。"],
      "invalid-size": ["Enter a positive dimension (both when unlocked), or a percentage from 1 to 400.", "请输入有效尺寸（取消比例锁定时宽高都需填写），或 1–400 的百分比。"],
      "invalid-layout": ["Choose 2–20 images, a positive edge and spacing from 0 to 200.", "请选择 2–20 张图片，设置有效尺寸及 0–200 的间距。"],
      decode: ["This image could not be read. Try a different file.", "无法读取这张图片，请更换文件。"],
      browser: ["This browser could not export the image. Try an updated browser.", "浏览器无法导出图片，请尝试更新浏览器。"],
    };
    const message = messages[code] || ["Processing failed. Try again with a smaller image.", "处理失败，请重试或换用较小图片。"];
    return t(message[0] as ToolMessageKey);
  }
  function start() {
    stop(); clearResults(); setErrors([]); setBusy(true); setStatus(t("Preparing…"));
    try {
      const active = new Worker(new URL("../../workers/image-tools.worker.ts", import.meta.url), { type: "module" });
      worker.current = active;
      const fail = (message: string) => { if (worker.current !== active) return; stop(); setErrors(previous => [...previous, message]); setStatus(t("Stopped. You can try again.")); };
      const armTimeout = () => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => fail(t("Processing timed out. Try smaller images.")), 120_000); };
      active.onerror = event => { event.preventDefault(); fail(t("The image processor stopped. Please try again.")); };
      active.onmessageerror = () => fail(t("Could not read the result. Please try again."));
      active.onmessage = (event: MessageEvent<ToolResponse>) => {
        if (worker.current !== active) return;
        armTimeout();
        const message = event.data;
        if (message.type === "progress") setStatus(t("progress", { current: message.current, total: message.total }));
        if (message.type === "result") { const result = { ...message.result, url: ownUrl(message.result.blob) }; setResults(previous => [...previous, result]); }
        if (message.type === "error") setErrors(previous => [...previous, `${message.name ? `${message.name}: ` : ""}${describeError(message.error)}`]);
        if (message.type === "done") { stop(); setStatus(t("Processing finished. See results below.")); }
      };
      armTimeout(); active.postMessage({ files: files.map(({ id, file }) => ({ id, file })), options });
    } catch { stop(); setErrors([t("Image processing could not start. Please try an updated browser.")]); setStatus(""); }
  }
  async function downloadZip() {
    setZipping(true);
    try {
      const entries = createZipEntries(await Promise.all(results.map(async result => ({ outputName: result.name, buffer: await result.blob.arrayBuffer() }))));
      const bytes = await new Promise<Uint8Array<ArrayBuffer>>((resolve, reject) => zip(entries, { level: 0 }, (error, data) => error ? reject(error) : resolve(data as Uint8Array<ArrayBuffer>)));
      if (!mounted.current) return;
      const url = ownUrl(new Blob([bytes], { type: "application/zip" }));
      const a = document.createElement("a"); a.href = url; a.download = `piczip-${tool}.zip`; a.click();
      setTimeout(() => revoke(url), 30_000);
    } catch { if (mounted.current) setErrors(previous => [...previous, t("ZIP download failed. Try individual downloads.")]); }
    finally { if (mounted.current) setZipping(false); }
  }
  const action = tool === "crop" ? cropMessages[locale].action : tool === "resize" ? t("Resize images") : tool === "convert" ? t("Convert images") : t("Stitch images");
  return <div className={`image-tool-shell ${tool === "crop" ? "is-crop-tool" : ""}`}>
    <ReceiveTransfer tool={tool} locale={locale} onBusyChange={setReceiving} onReceive={incoming => addFiles(incoming, true)} />
    <section className="compressor-card">
      <div className="compressor-heading"><h2>{t("Make it yours")}</h2></div>
      <div className="image-tool-workspace">
        <div className="tool-source">
          <h3 className="settings-title">{t("01 / Your images")}</h3>
          <input ref={input} className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={!ready || busy || receiving} aria-label={t("Choose images")} onChange={event => { addFiles(Array.from(event.target.files || [])); event.target.value = ""; }} />
          <button type="button" disabled={!ready || busy || receiving} className={`dropzone tool-dropzone ${dragging ? "is-dragging" : ""} ${files.length ? "has-files" : ""}`} onClick={() => input.current?.click()} onDragOver={event => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); addFiles(Array.from(event.dataTransfer.files)); }}>
            <span><span className="tool-upload-icon">{files.length ? <Plus size={22} /> : <ImagePlus size={36} strokeWidth={1.3} />}</span><span className="drop-title">{files.length ? t("Add more images") : t("Drop your images here")}</span><span className="drop-description">{t("types", { count: limit })}</span>{!files.length && <span className="choose-button">{t("Choose images")}</span>}</span>
          </button>
          {files.length > 0 && <><div className="tool-queue-heading"><strong>{t("selected", { count: files.length })}</strong><button className="quiet-button" onClick={clear}>{t("Clear all")}</button></div><ol className="tool-queue">{files.map((item, index) => <li key={item.id} data-input-name={item.file.name}>
            <span className="tool-order">{String(index + 1).padStart(2, "0")}</span>
            {/* Local Blob previews cannot use the Next image optimizer. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="" width={48} height={48} /><div className="tool-file-info"><strong title={item.file.name}>{item.file.name}</strong><span>{sizeLabel(item.file.size)}</span></div>
            <div className="tool-row-actions">{tool === "stitch" && <><button className="icon-button" disabled={busy || index === 0} aria-label={t("moveUp", { name: item.file.name })} onClick={() => move(index, -1)}><ArrowUp size={14} /></button><button className="icon-button" disabled={busy || index === files.length - 1} aria-label={t("moveDown", { name: item.file.name })} onClick={() => move(index, 1)}><ArrowDown size={14} /></button></>}<button className="icon-button is-remove" disabled={busy} aria-label={t("remove", { name: item.file.name })} onClick={() => remove(item.id)}><Trash2 size={14} /></button></div>
          </li>)}</ol></>}
          {tool === "crop" && <CropEditor files={files} value={options.crop ?? defaultCrop} onChange={crop => change({ crop })} locale={locale} disabled={busy || receiving} format={options.format} background={options.background} />}
          <p className="tool-footnote">{t("Up to 50 MB / 40 MP per input. Output: up to 16 MP and 8192 px per side. Animated images export a still frame.")}</p>
        </div>
        <div className="settings-panel tool-settings">
          <fieldset disabled={!ready || busy || receiving}><legend className="settings-title">{t("02 / Your settings")}</legend>
            <BatchPresets tool={tool} locale={locale} settings={options} disabled={!ready || busy || receiving} onApply={value => change(value as ToolOptions)} />
            {tool === "crop" && <CropControls value={options.crop ?? defaultCrop} onChange={crop => change({ crop })} locale={locale} />}
            {tool === "resize" && <>
              <label className="tool-field">{t("Resize by")}<select value={options.resize.mode} onChange={event => change({ resize: { ...options.resize, mode: event.target.value as "pixels" | "percent" } })}><option value="pixels">{t("Pixels")}</option><option value="percent">{t("Percentage")}</option></select></label>
              {options.resize.mode === "pixels" ? <><div className="tool-field-pair"><label className="tool-field">{t("Width (px)")}<input type="number" min="0" max="8192" value={options.resize.width || ""} placeholder={t("Auto")} onChange={event => change({ resize: { ...options.resize, width: Number(event.target.value) } })} /></label><label className="tool-field">{t("Height (px)")}<input type="number" min="0" max="8192" value={options.resize.height || ""} placeholder={t("Auto")} onChange={event => change({ resize: { ...options.resize, height: Number(event.target.value) } })} /></label></div><label className="tool-checkbox"><input type="checkbox" checked={options.resize.lock} onChange={event => change({ resize: { ...options.resize, lock: event.target.checked } })} />{t("Keep aspect ratio")}</label><p className="field-hint">{t("With ratio locked, images fit within these bounds. Leave one side empty to calculate it automatically.")}</p></> : <label className="tool-field">{t("Scale (%)")}<input type="number" min="1" max="400" value={options.resize.percent || ""} onChange={event => change({ resize: { ...options.resize, percent: Number(event.target.value) } })} /></label>}
            </>}
            {tool === "stitch" && <>
              <label className="tool-field">{t("Direction")}<select value={options.direction} onChange={event => change({ direction: event.target.value as "vertical" | "horizontal" })}><option value="vertical">{t("Vertical")}</option><option value="horizontal">{t("Horizontal")}</option></select></label>
              <div className="tool-field-pair"><label className="tool-field">{options.direction === "vertical" ? t("Shared width (px)") : t("Shared height (px)")}<input type="number" min="1" max="8192" value={options.edge || ""} onChange={event => change({ edge: Number(event.target.value) })} /></label><label className="tool-field">{t("Spacing (px)")}<input type="number" min="0" max="200" value={options.gap} onChange={event => change({ gap: Number(event.target.value) })} /></label></div><p className="field-hint">{t("Images scale proportionally to a shared edge. Use the arrows to reorder them.")}</p>
            </>}
            <label className="tool-field">{t("Output format")}<select value={options.format} onChange={event => change({ format: event.target.value as ToolOptions["format"] })}>{(tool === "resize" || tool === "crop") && <option value="original">{t("Keep original format")}</option>}<option value="jpeg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option></select></label>
            <label className="tool-field">{t("Quality")} <span className="quality-field"><input type="range" min="20" max="100" value={options.quality} disabled={options.format === "png"} onChange={event => change({ quality: Number(event.target.value) })} /><output>{options.quality}%</output></span></label>
            {options.format === "png" && <p className="field-hint">{t("PNG is lossless; the quality setting does not apply.")}</p>}
            {(options.format === "jpeg" || tool === "stitch") && <><label className="tool-field tool-color">{t("Background color")}<input type="color" value={options.background} disabled={options.transparent && options.format !== "jpeg"} onChange={event => change({ background: event.target.value })} /></label>{tool === "stitch" && options.format !== "jpeg" ? <label className="tool-checkbox"><input type="checkbox" checked={options.transparent} onChange={event => change({ transparent: event.target.checked })} />{t("Transparent background")}</label> : <p className="field-hint">{t("JPG has no transparency. Transparent areas use this color.")}</p>}</>}
            {tool === "convert" && <p className="tool-format-note">{t("PNG keeps transparency without lossy encoding. JPG suits photos. WebP balances file size and quality. Conversion may increase file size.")}</p>}
          </fieldset>
          <div className="compressor-actions">{busy ? <button className="secondary-button" onClick={() => { stop(); setStatus(t("Cancelled. Completed results are kept.")); }}>{t("Cancel")}</button> : <button className="primary-button" disabled={receiving || !ready || files.length < (tool === "stitch" ? 2 : 1)} onClick={start}>{action}<ArrowDown size={14} /></button>}</div>
          <p className="tool-status" role="status">{status || (tool === "stitch" ? t("Select at least 2 images to begin.") : t("Your original files stay untouched."))}</p>
        </div>
      </div>
    </section>
    {errors.length > 0 && <div className="tool-errors" role="alert">{errors.map((error, index) => <p key={index}>{error}</p>)}</div>}
    {results.length > 0 && <section className="results-card tool-results"><div className="results-heading"><h3>{t("Ready to download")}</h3><span className="results-count">{results.length} {t("images")}</span>{results.length > 1 && <button className="secondary-button" disabled={busy || zipping} onClick={downloadZip}><Download size={14} />{zipping ? t("Preparing ZIP…") : t("Download ZIP")}</button>}</div>{stale && <p className="tool-stale" role="status">{t("Settings or images changed. Run again to update these results.")}</p>}
      <div className={tool === "stitch" ? "tool-output-grid is-stitched" : "tool-output-grid"}>{results.map(result => <article className="tool-output" key={result.id} data-output-width={result.width} data-output-height={result.height} data-output-type={result.blob.type}>
        <a href={result.url} target="_blank" rel="noreferrer" className="tool-output-preview" aria-label={t("preview", { name: result.name })}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.url} alt={result.name} />
        </a><div className="tool-output-details"><div><strong title={result.name}>{result.name}</strong><span>{result.width} × {result.height} · {sizeLabel(result.blob.size)}</span></div><a className="icon-button" href={result.url} download={result.name} aria-label={t("download", { name: result.name })}><Download size={16} /></a></div>
      </article>)}</div>
      <ContinueProcessing tool={tool} locale={locale} count={results.length} getImages={() => results.map(result => ({ name: result.name, blob: result.blob }))} disabled={busy || zipping} stale={stale} />
    </section>}
  </div>;
}
