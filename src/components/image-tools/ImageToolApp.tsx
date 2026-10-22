"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowDown, ArrowUp, Download, ImagePlus, Lock, Plus, Trash2 } from "lucide-react";
import { zip } from "fflate";
import type { ToolFile, ToolKind, ToolOptions, ToolResponse, ToolResult } from "@/lib/image-tools/types";
import { createZipEntries } from "@/lib/compression/download";

const subscribeToHydration = () => () => {};

type Input = ToolFile & { url: string };
type Result = ToolResult & { url: string };
const sizeLabel = (n: number) => n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
const initialOptions = (tool: ToolKind): ToolOptions => ({ tool, resize: { mode: "pixels", width: 1200, height: 0, percent: 50, lock: true }, format: tool === "resize" ? "original" : tool === "stitch" ? "png" : "webp", quality: 90, background: "#ffffff", transparent: false, direction: "vertical", edge: 800, gap: 16 });

export function ImageToolApp({ tool, locale }: { tool: ToolKind; locale: "en" | "zh" }) {
  const ready = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const zh = locale === "zh";
  const t = (en: string, cn: string) => zh ? cn : en;
  const [files, setFiles] = useState<Input[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [options, setOptions] = useState(() => initialOptions(tool));
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
  function addFiles(incoming: File[]) {
    if (!ready || busy) return;
    let total = files.reduce((sum, item) => sum + item.file.size, 0);
    const accepted: Input[] = []; const rejected: string[] = [];
    for (const file of incoming) {
      if (!/\.(png|jpe?g|webp)$/i.test(file.name)) { rejected.push(`${file.name}: ${t("Use JPG, PNG or WebP.", "请选择 JPG、PNG 或 WebP 图片。")}`); continue; }
      if (files.length + accepted.length >= limit) { rejected.push(t(`Up to ${limit} images at a time.`, `一次最多 ${limit} 张图片。`)); break; }
      if (file.size > 50 * 1024 * 1024 || total + file.size > 200 * 1024 * 1024) { rejected.push(`${file.name}: ${t("50 MB per file; 200 MB total limit.", "单张限 50 MB，队列总大小限 200 MB。")}`); continue; }
      total += file.size; accepted.push({ id: crypto.randomUUID(), file, url: ownUrl(file) });
    }
    setFiles([...files, ...accepted]); setErrors(rejected); setStatus(""); if (accepted.length && results.length) setStale(true);
  }
  function remove(id: string) { const item = files.find(item => item.id === id); if (item) revoke(item.url); setFiles(files.filter(item => item.id !== id)); if (results.length) setStale(true); }
  function move(index: number, offset: number) { const next = [...files]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; setFiles(next); if (results.length) setStale(true); }
  function clear() { stop(); files.forEach(item => revoke(item.url)); setFiles([]); clearResults(); setErrors([]); setStatus(""); }
  function describeError(code: string) {
    const messages: Record<string, [string, string]> = {
      "output-limit": ["Output exceeds 8192 px per side or 16 megapixels. Reduce the dimensions.", "输出超过单边 8192 像素或 1600 万像素，请调小尺寸。"],
      "input-limit": ["Input exceeds 50 MB or 40 megapixels.", "原图超过 50 MB 或 4000 万像素。"],
      "invalid-size": ["Enter a positive dimension (both when unlocked), or a percentage from 1 to 400.", "请输入有效尺寸（取消比例锁定时宽高都需填写），或 1–400 的百分比。"],
      "invalid-layout": ["Choose 2–20 images, a positive edge and spacing from 0 to 200.", "请选择 2–20 张图片，设置有效尺寸及 0–200 的间距。"],
      decode: ["This image could not be read. Try a different file.", "无法读取这张图片，请更换文件。"],
      browser: ["This browser could not export the image. Try an updated browser.", "浏览器无法导出图片，请尝试更新浏览器。"],
    };
    const message = messages[code] || ["Processing failed. Try again with a smaller image.", "处理失败，请重试或换用较小图片。"];
    return message[zh ? 1 : 0];
  }
  function start() {
    stop(); clearResults(); setErrors([]); setBusy(true); setStatus(t("Preparing…", "正在准备…"));
    try {
      const active = new Worker(new URL("../../workers/image-tools.worker.ts", import.meta.url), { type: "module" });
      worker.current = active;
      const fail = (message: string) => { if (worker.current !== active) return; stop(); setErrors(previous => [...previous, message]); setStatus(t("Stopped. You can try again.", "已停止，可以重试。")); };
      const armTimeout = () => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => fail(t("Processing timed out. Try smaller images.", "处理超时，请尝试较小图片。")), 120_000); };
      active.onerror = event => { event.preventDefault(); fail(t("The image processor stopped. Please try again.", "图片处理器意外停止，请重试。")); };
      active.onmessageerror = () => fail(t("Could not read the result. Please try again.", "无法读取结果，请重试。"));
      active.onmessage = (event: MessageEvent<ToolResponse>) => {
        if (worker.current !== active) return;
        armTimeout();
        const message = event.data;
        if (message.type === "progress") setStatus(t(`Processing ${message.current} of ${message.total}…`, `正在处理 ${message.current} / ${message.total}…`));
        if (message.type === "result") { const result = { ...message.result, url: ownUrl(message.result.blob) }; setResults(previous => [...previous, result]); }
        if (message.type === "error") setErrors(previous => [...previous, `${message.name ? `${message.name}: ` : ""}${describeError(message.error)}`]);
        if (message.type === "done") { stop(); setStatus(t("Processing finished. See results below.", "处理结束，请查看下方结果。")); }
      };
      armTimeout(); active.postMessage({ files: files.map(({ id, file }) => ({ id, file })), options });
    } catch { stop(); setErrors([t("Image processing could not start. Please try an updated browser.", "无法启动图片处理，请尝试更新浏览器。")]); setStatus(""); }
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
    } catch { if (mounted.current) setErrors(previous => [...previous, t("ZIP download failed. Try individual downloads.", "ZIP 下载失败，请尝试逐张下载。")]); }
    finally { if (mounted.current) setZipping(false); }
  }
  const action = tool === "resize" ? t("Resize images", "调整尺寸") : tool === "convert" ? t("Convert images", "开始转换") : t("Stitch images", "开始拼接");
  return <div className="image-tool-shell">
    <section className="compressor-card">
      <div className="compressor-heading"><h2>{t("Make it yours", "让图片恰到好处")}</h2><span className="privacy-pill"><Lock size={10} />{t("100% on your device", "全程本地处理")}</span></div>
      <div className="image-tool-workspace">
        <div className="tool-source">
          <h3 className="settings-title">{t("01 / Your images", "01 / 选择图片")}</h3>
          <input ref={input} className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={!ready || busy} aria-label={t("Choose images", "选择图片")} onChange={event => { addFiles(Array.from(event.target.files || [])); event.target.value = ""; }} />
          <button type="button" disabled={!ready || busy} className={`dropzone tool-dropzone ${dragging ? "is-dragging" : ""} ${files.length ? "has-files" : ""}`} onClick={() => input.current?.click()} onDragOver={event => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); addFiles(Array.from(event.dataTransfer.files)); }}>
            <span><span className="tool-upload-icon">{files.length ? <Plus size={22} /> : <ImagePlus size={36} strokeWidth={1.3} />}</span><span className="drop-title">{files.length ? t("Add more images", "继续添加图片") : t("Drop your images here", "将图片拖到这里")}</span><span className="drop-description">{t(`JPG, PNG, WebP · Up to ${limit} images`, `JPG、PNG、WebP · 最多 ${limit} 张`)}</span>{!files.length && <span className="choose-button">{t("Choose images", "选择图片")}</span>}</span>
          </button>
          {files.length > 0 && <><div className="tool-queue-heading"><strong>{t(`${files.length} images selected`, `已选择 ${files.length} 张图片`)}</strong><button className="quiet-button" onClick={clear}>{t("Clear all", "清空全部")}</button></div><ol className="tool-queue">{files.map((item, index) => <li key={item.id} data-input-name={item.file.name}>
            <span className="tool-order">{String(index + 1).padStart(2, "0")}</span>
            {/* Local Blob previews cannot use the Next image optimizer. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="" width={48} height={48} /><div className="tool-file-info"><strong title={item.file.name}>{item.file.name}</strong><span>{sizeLabel(item.file.size)}</span></div>
            <div className="tool-row-actions">{tool === "stitch" && <><button className="icon-button" disabled={busy || index === 0} aria-label={t(`Move up ${item.file.name}`, `上移 ${item.file.name}`)} onClick={() => move(index, -1)}><ArrowUp size={14} /></button><button className="icon-button" disabled={busy || index === files.length - 1} aria-label={t(`Move down ${item.file.name}`, `下移 ${item.file.name}`)} onClick={() => move(index, 1)}><ArrowDown size={14} /></button></>}<button className="icon-button is-remove" disabled={busy} aria-label={t(`Remove ${item.file.name}`, `移除 ${item.file.name}`)} onClick={() => remove(item.id)}><Trash2 size={14} /></button></div>
          </li>)}</ol></>}
          <p className="tool-footnote">{t("Up to 50 MB / 40 MP per input. Output: up to 16 MP and 8192 px per side. Animated images export a still frame.", "单张原图限 50 MB / 4000 万像素。输出限 1600 万像素、单边 8192 像素。动图会导出为静态图片。")}</p>
        </div>
        <div className="settings-panel tool-settings">
          <fieldset disabled={!ready || busy}><legend className="settings-title">{t("02 / Your settings", "02 / 调整设置")}</legend>
            {tool === "resize" && <>
              <label className="tool-field">{t("Resize by", "调整方式")}<select value={options.resize.mode} onChange={event => change({ resize: { ...options.resize, mode: event.target.value as "pixels" | "percent" } })}><option value="pixels">{t("Pixels", "像素")}</option><option value="percent">{t("Percentage", "百分比")}</option></select></label>
              {options.resize.mode === "pixels" ? <><div className="tool-field-pair"><label className="tool-field">{t("Width (px)", "宽度（像素）")}<input type="number" min="0" max="8192" value={options.resize.width || ""} placeholder={t("Auto", "自动")} onChange={event => change({ resize: { ...options.resize, width: Number(event.target.value) } })} /></label><label className="tool-field">{t("Height (px)", "高度（像素）")}<input type="number" min="0" max="8192" value={options.resize.height || ""} placeholder={t("Auto", "自动")} onChange={event => change({ resize: { ...options.resize, height: Number(event.target.value) } })} /></label></div><label className="tool-checkbox"><input type="checkbox" checked={options.resize.lock} onChange={event => change({ resize: { ...options.resize, lock: event.target.checked } })} />{t("Keep aspect ratio", "保持原始比例")}</label><p className="field-hint">{t("With ratio locked, images fit within these bounds. Leave one side empty to calculate it automatically.", "锁定比例时，图片完整适配宽高范围，不裁剪。留空一边可自动计算。")}</p></> : <label className="tool-field">{t("Scale (%)", "缩放比例（%）")}<input type="number" min="1" max="400" value={options.resize.percent || ""} onChange={event => change({ resize: { ...options.resize, percent: Number(event.target.value) } })} /></label>}
            </>}
            {tool === "stitch" && <>
              <label className="tool-field">{t("Direction", "拼接方向")}<select value={options.direction} onChange={event => change({ direction: event.target.value as "vertical" | "horizontal" })}><option value="vertical">{t("Vertical", "纵向长图")}</option><option value="horizontal">{t("Horizontal", "横向拼图")}</option></select></label>
              <div className="tool-field-pair"><label className="tool-field">{options.direction === "vertical" ? t("Shared width (px)", "统一宽度（像素）") : t("Shared height (px)", "统一高度（像素）")}<input type="number" min="1" max="8192" value={options.edge || ""} onChange={event => change({ edge: Number(event.target.value) })} /></label><label className="tool-field">{t("Spacing (px)", "间距（像素）")}<input type="number" min="0" max="200" value={options.gap} onChange={event => change({ gap: Number(event.target.value) })} /></label></div><p className="field-hint">{t("Images scale proportionally to a shared edge. Use the arrows to reorder them.", "图片按比例缩放到统一宽度或高度，使用列表箭头调整顺序。")}</p>
            </>}
            <label className="tool-field">{t("Output format", "输出格式")}<select value={options.format} onChange={event => change({ format: event.target.value as ToolOptions["format"] })}>{tool === "resize" && <option value="original">{t("Keep original format", "保留原格式")}</option>}<option value="jpeg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option></select></label>
            <label className="tool-field">{t("Quality", "画质")} <span className="quality-field"><input type="range" min="20" max="100" value={options.quality} disabled={options.format === "png"} onChange={event => change({ quality: Number(event.target.value) })} /><output>{options.quality}%</output></span></label>
            {options.format === "png" && <p className="field-hint">{t("PNG is lossless; the quality setting does not apply.", "PNG 为无损编码，不受画质设置影响。")}</p>}
            {(options.format === "jpeg" || tool === "stitch") && <><label className="tool-field tool-color">{t("Background color", "背景颜色")}<input type="color" value={options.background} disabled={options.transparent && options.format !== "jpeg"} onChange={event => change({ background: event.target.value })} /></label>{tool === "stitch" && options.format !== "jpeg" ? <label className="tool-checkbox"><input type="checkbox" checked={options.transparent} onChange={event => change({ transparent: event.target.checked })} />{t("Transparent background", "透明背景")}</label> : <p className="field-hint">{t("JPG has no transparency. Transparent areas use this color.", "JPG 不支持透明，透明区域将填充为此颜色。")}</p>}</>}
            {tool === "convert" && <p className="tool-format-note">{t("PNG keeps transparency without lossy encoding. JPG suits photos. WebP balances file size and quality. Conversion may increase file size.", "PNG 无损保存透明图，JPG 适合照片，WebP 兼顾体积与画质。转换后文件可能变大。")}</p>}
          </fieldset>
          <div className="compressor-actions">{busy ? <button className="secondary-button" onClick={() => { stop(); setStatus(t("Cancelled. Completed results are kept.", "已取消，已完成的结果保留。")); }}>{t("Cancel", "取消处理")}</button> : <button className="primary-button" disabled={files.length < (tool === "stitch" ? 2 : 1)} onClick={start}>{action}<ArrowDown size={14} /></button>}</div>
          <p className="tool-status" role="status">{status || (tool === "stitch" ? t("Select at least 2 images to begin.", "至少选择 2 张图片即可开始。") : t("Your original files stay untouched.", "保留原图，另存处理结果。"))}</p>
        </div>
      </div>
    </section>
    {errors.length > 0 && <div className="tool-errors" role="alert">{errors.map((error, index) => <p key={index}>{error}</p>)}</div>}
    {results.length > 0 && <section className="results-card tool-results"><div className="results-heading"><h3>{t("Ready to download", "处理结果")}</h3><span className="results-count">{results.length} {t("images", "张图片")}</span>{results.length > 1 && <button className="secondary-button" disabled={busy || zipping} onClick={downloadZip}><Download size={14} />{zipping ? t("Preparing ZIP…", "正在打包…") : t("Download ZIP", "下载 ZIP")}</button>}</div>{stale && <p className="tool-stale" role="status">{t("Settings or images changed. Run again to update these results.", "设置或图片已改变，请重新处理以更新结果。")}</p>}
      <div className={tool === "stitch" ? "tool-output-grid is-stitched" : "tool-output-grid"}>{results.map(result => <article className="tool-output" key={result.id} data-output-width={result.width} data-output-height={result.height} data-output-type={result.blob.type}>
        <a href={result.url} target="_blank" rel="noreferrer" className="tool-output-preview" aria-label={t(`Preview ${result.name}`, `预览 ${result.name}`)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.url} alt={result.name} />
        </a><div className="tool-output-details"><div><strong title={result.name}>{result.name}</strong><span>{result.width} × {result.height} · {sizeLabel(result.blob.size)}</span></div><a className="icon-button" href={result.url} download={result.name} aria-label={t(`Download ${result.name}`, `下载 ${result.name}`)}><Download size={16} /></a></div>
      </article>)}</div>
    </section>}
  </div>;
}
