"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Archive, ArrowDown, Check, CheckCircle2, CircleAlert, Download, ImageIcon, Leaf, Loader2, Plus, Trash2, X } from "lucide-react";
import { zipSync } from "fflate";
import type {
  CompressionOptions,
  CompressionResult,
  OutputFormat,
} from "@/lib/compression/types";
import { CompressionBatch } from "@/lib/compression/batch";
import { compressorMessages as compressorCopy } from "@/lib/i18n/messages";
import { interpolate, type Locale } from "@/lib/i18n/config";
import { createZipEntries } from "@/lib/compression/download";
import { CompressionWorkerClient, CompressionWorkerError } from "@/lib/compression/worker-client";

import { BatchPresets } from "@/components/workflow/BatchPresets";
import { ContinueProcessing } from "@/components/workflow/ContinueProcessing";
import { ReceiveTransfer } from "@/components/workflow/ReceiveTransfer";
import type { CompressionPreset } from "@/lib/workflow/settings";

import { ExportSettings } from "@/components/export/ExportSettings";
import { defaultRename, exportNames } from "@/lib/export/names";

type FileItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: "queued" | "compressing" | "done" | "error" | "cancelled";
  result?: CompressionResult;
  error?: string;
};

type SaveFilePicker = {
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    types?: Array<{
      description: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<{
    createWritable: () => Promise<{
      write: (data: Blob) => Promise<void>;
      close: () => Promise<void>;
    }>;
  }>;
};

const maxFiles = 50;
const maxPixels = 40_000_000;
const maxFileBytes = 50 * 1024 * 1024;
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type CompressorAppProps = {
  locale?: Locale;
  initialTargetKb?: number;
  initialFormat?: OutputFormat;
};

export function CompressorApp({
  locale = "en",
  initialTargetKb = 200,
  initialFormat = "auto",
}: CompressorAppProps) {
  const t = compressorCopy[locale];
  const workerRef = useRef<CompressionWorkerClient | null>(null);
  const batchRef = useRef<CompressionBatch | null>(null);
  const previewUrls = useRef(new Map<string, string>());
  const [isDragging, setIsDragging] = useState(false);
  const [items, setItems] = useState<FileItem[]>([]);
  const [rename, setRename] = useState({ ...defaultRename });
  const [format, setFormat] = useState<OutputFormat>(initialFormat);
  const [quality, setQuality] = useState(82);
  const [targetKb, setTargetKb] = useState(initialTargetKb);
  const [maxWidth, setMaxWidth] = useState(2400);
  const [receiving, setReceiving] = useState(true);
  const [resultSettings, setResultSettings] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessing, setCurrentProcessing] = useState<{ index: number; total: number } | null>(
    null,
  );
  const [lastZipBytes, setLastZipBytes] = useState<number>();
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    if (!toast) return;

    const fadeTimer = setTimeout(() => {
      setIsToastVisible(false);
    }, 3000);

    const unmountTimer = setTimeout(() => {
      setToast(null);
    }, 3300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [toast]);

  const completed = items.filter((item) => item.status === "done" && item.result);
  const names = exportNames(completed.map(item => item.result!.outputName), rename);
  const namedResults = new Map(completed.map((item,i) => [item.id, {...item.result!, outputName:names[i]}]));
  const totalSaved = Math.max(0, completed.reduce((sum, item) => {
    const result = item.result;
    return result ? sum + result.originalBytes - result.compressedBytes : sum;
  }, 0));
  const totalOriginalBytes = completed.reduce((sum, item) => sum + item.file.size, 0);
  const savedPercent = totalOriginalBytes ? Math.round(totalSaved / totalOriginalBytes * 100) : 0;

  const options = useMemo<CompressionOptions>(
    () => ({
      outputFormat: format,
      quality,
      maxWidth,
      targetBytes: targetKb > 0 ? targetKb * 1024 : undefined,
    }),
    [format, maxWidth, quality, targetKb],
  );

  useEffect(() => {
    workerRef.current = new CompressionWorkerClient(
      () => new Worker(new URL("../../workers/compression.worker.ts", import.meta.url), { type: "module" }),
    );

    const urls = previewUrls.current;
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
      urls.clear();
      batchRef.current?.cancel();
      batchRef.current = null;
      workerRef.current?.dispose();
      workerRef.current = null;
    };
  }, []);

  async function addFiles(fileList: FileList | File[]) {
    const accepted = Array.from(fileList)
      .filter((file) => acceptedImageTypes.has(file.type))
      .slice(0, Math.max(0, maxFiles - items.length))
      .map((file) => {
        const id = crypto.randomUUID();
        const previewUrl = URL.createObjectURL(file);
        previewUrls.current.set(id, previewUrl);
        return { id, file, previewUrl, status: "queued" as const };
      });

    if (accepted.length > 0) {
      setItems((current) => [...current, ...accepted]);
      const message = interpolate(t.added, { count: accepted.length, unit: accepted.length === 1 ? t.imageSingular : t.imagePlural });
      setToast({ message, type: "success" });
      setIsToastVisible(true);
    }
  }

  const presetSettings: CompressionPreset = { format, quality, targetKb, maxWidth, rename };
  const processingSignature = JSON.stringify({ format, quality, targetKb, maxWidth });

  async function compressAll() {
    if (!workerRef.current || batchRef.current || !items.length) return;

    const batch = new CompressionBatch();
    batchRef.current = batch;
    setIsProcessing(true);
    setResultSettings(processingSignature);
    setItems(current => current.map(item => ({ ...item, status: "queued", result: undefined, error: undefined })));
    setLastZipBytes(undefined);
    try {
      await batch.run(items, (item, signal) => runCompression(item, options, signal), {
        start: (item, index, total) => {
          setCurrentProcessing({ index, total });
          setItems((current) => current.map((entry) => entry.id === item.id
            ? { ...entry, status: "compressing", result: undefined, error: undefined }
            : entry));
        },
        success: (item, result) => {
          setItems((current) => current.map((entry) => entry.id === item.id
            ? { ...entry, status: "done", result }
            : entry));
        },
        failure: (item, error) => {
          const message = error instanceof CompressionWorkerError
            ? error.code === "timeout" ? t.timeout : t.workerFailed
            : error instanceof Error && [t.fileTooLarge, t.tooLarge, t.workerNotReady, t.decode].includes(error.message) ? error.message : t.failed;
          setItems((current) => current.map((entry) => entry.id === item.id
            ? { ...entry, status: "error", error: message }
            : entry));
        },
      });
    } finally {
      // A cancelled batch may finish preparation after a new batch has started.
      if (batchRef.current === batch) {
        batchRef.current = null;
        setIsProcessing(false);
        setCurrentProcessing(null);
      }
    }
  }

  async function runCompression(item: FileItem, compressionOptions: CompressionOptions, signal: AbortSignal) {
    signal.throwIfAborted();
    if (item.file.size > maxFileBytes) throw new Error(t.fileTooLarge);
    const bitmap = await createImageBitmap(item.file).catch(() => { throw new Error(t.decode); });
    const pixels = bitmap.width * bitmap.height;
    bitmap.close();
    signal.throwIfAborted();

    if (pixels > maxPixels) {
      throw new Error(t.tooLarge);
    }

    const buffer = await item.file.arrayBuffer();
    signal.throwIfAborted();
    const worker = workerRef.current;
    if (!worker) throw new Error(t.workerNotReady);
    return worker.run({
      id: crypto.randomUUID(),
      name: item.file.name,
      type: item.file.type,
      buffer,
      options: compressionOptions,
    }, signal);
  }

  function cancelCompression() {
    batchRef.current?.cancel();
    batchRef.current = null;
    setIsProcessing(false);
    setCurrentProcessing(null);
    setItems((current) => current.map((item) => item.status === "compressing"
      ? { ...item, status: "cancelled", result: undefined, error: undefined }
      : item));
  }

  function removeItem(id: string) {
    batchRef.current?.remove(id);
    const url = previewUrls.current.get(id);
    if (url) URL.revokeObjectURL(url);
    previewUrls.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
    setLastZipBytes(undefined);
  }

  function clearAll() {
    cancelCompression();
    previewUrls.current.forEach(url => URL.revokeObjectURL(url));
    previewUrls.current.clear();
    setItems([]);
    setLastZipBytes(undefined);
  }

  async function downloadResult(result: CompressionResult) {
    const blob = new Blob([result.buffer], { type: result.mimeType });
    await saveBlob(blob, result.outputName, t.imageFile);
  }

  async function downloadZip() {
    const files = createZipEntries(Array.from(namedResults.values()));
    const zipped = zipSync(files);
    setLastZipBytes(zipped.byteLength);
    await saveBlob(
      new Blob([zipped], { type: "application/zip" }),
      "piczip-compressed-images.zip",
      t.zipFile,
    );
  }

  return (
    <section className="compressor-shell" aria-label={t.title}>
      <ReceiveTransfer tool="compress" locale={locale} onBusyChange={setReceiving} onReceive={incoming => {
        if (isProcessing || items.length + incoming.length > maxFiles) throw new Error("transfer-limit");
        void addFiles(incoming);
      }} />
      <div className="compressor-card">
        <div className="compressor-heading">
          <h2>{t.title}</h2>
        </div>
        <div className="compressor-workspace">
          <label
            onDragOver={event => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false); }}
            onDrop={event => { event.preventDefault(); setIsDragging(false); if (!receiving) void addFiles(event.dataTransfer.files); }}
            className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          >
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={receiving} aria-label={t.choose}
              onChange={event => { if (event.target.files) void addFiles(event.target.files); event.currentTarget.value = ""; }} />
            <span>
              <span className="file-art" aria-hidden="true"><ImageIcon strokeWidth={1.1} /><ImageIcon strokeWidth={1.1} /></span>
              <span className="drop-title">{t.dropTitle}</span>
              <span className="drop-description">{t.fileTypes}</span>
              <span className="choose-button"><Plus size={14} />{t.choose}</span>
              <span className="drop-footnote">{t.fileLimits}</span>
            </span>
          </label>

          <div className="settings-panel">
            <h3 className="settings-title">{t.settings}</h3>
            <BatchPresets tool="compress" locale={locale} settings={presetSettings} disabled={isProcessing || receiving} onApply={value => {
              const preset = value as CompressionPreset;
              setRename(preset.rename ?? { ...defaultRename }); setFormat(preset.format); setQuality(preset.quality); setTargetKb(preset.targetKb); setMaxWidth(preset.maxWidth);
            }} />
            <div className="setting-line">
              <label htmlFor="compression-target">{t.targetSize}</label>
              <div>
                <div className="number-with-unit"><input id="compression-target" min={0} type="number" value={targetKb} disabled={isProcessing}
                  onChange={event => setTargetKb(Math.max(0, Number(event.target.value)))} aria-describedby="target-hint" /><span aria-hidden="true">KB</span></div>
                <span className="field-hint" id="target-hint">{t.targetHint}</span>
                <div className="target-presets" role="group" aria-label={t.presets}>
                  {[0, 100, 200, 500].map(value => <button key={value} type="button" disabled={isProcessing} aria-pressed={targetKb === value} onClick={() => setTargetKb(value)}>{value ? `${value} KB` : t.targetOff}</button>)}
                </div>
              </div>
            </div>
            <div className="setting-line">
              <span id="output-label">{t.output}</span>
              <div role="group" aria-labelledby="output-label" className="format-switch">
                {(["auto", "jpeg", "png", "webp"] as OutputFormat[]).map(value => (
                  <button key={value} type="button" disabled={isProcessing} aria-pressed={format === value} onClick={() => setFormat(value)}>
                    {value === "auto" ? t.auto : value === "jpeg" ? "JPG" : value === "png" ? "PNG" : "WebP"}
                  </button>
                ))}
              </div>
            </div>
            <div className="setting-line">
              <label htmlFor="compression-quality">{t.quality}</label>
              <div>
                <div className="quality-field">
                  <input id="compression-quality" min={20} max={100} type="range" value={quality} disabled={isProcessing || format === "png"} onChange={event => setQuality(Number(event.target.value))} aria-describedby={format === "png" ? "png-hint" : undefined} />
                  <output htmlFor="compression-quality">{quality}</output>
                </div>
                {format === "png" ? <span className="field-hint" id="png-hint">{t.pngHint}</span> : null}
              </div>
            </div>
            <div className="setting-line">
              <label htmlFor="compression-width">{t.maxWidth}</label>
              <div>
                <div className="number-with-unit"><input id="compression-width" min={0} type="number" value={maxWidth} disabled={isProcessing} onChange={event => setMaxWidth(Math.max(0, Number(event.target.value)))} aria-describedby="width-hint" /><span aria-hidden="true">px</span></div>
                <span className="field-hint" id="width-hint">{t.widthHint}</span>
              </div>
            </div>
            <ExportSettings locale={locale} value={rename} onChange={setRename} names={completed.length ? completed.map(item => item.result!.outputName) : (format === "auto" ? [] : items.map(item=>item.file.name.replace(/\.[^.]+$/, "") + `-piczip.${format === "jpeg" ? "jpg" : format}`))} disabled={isProcessing || receiving} />
            <div className="compressor-actions">
              <button type="button" className="primary-button" onClick={() => void compressAll()} disabled={receiving || !items.length || isProcessing}>
                {isProcessing ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}{isProcessing ? t.compressing : t.compress}
              </button>
              {isProcessing ? <button type="button" onClick={cancelCompression} className="secondary-button"><X size={14} />{t.cancel}</button> : null}
              <button type="button" className="secondary-button" onClick={() => void downloadZip()} data-zip-bytes={lastZipBytes} disabled={!completed.length}>
                <Archive size={14} />{t.downloadZip}
              </button>
              {items.length > 0 ? <button type="button" onClick={clearAll} className="quiet-button">{t.clear}</button> : null}
            </div>
            {currentProcessing ? <div className="processing-notice" role="status"><Loader2 size={14} className="animate-spin" />{t.processingDetail} {currentProcessing.index} / {currentProcessing.total}</div> : null}
          </div>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="results-card" aria-label={t.yourImages}>
          <div className="results-heading">
            <h3>{t.yourImages}</h3><span className="results-count">{items.length} {items.length === 1 ? t.fileSingular : t.files}</span>
            {completed.length > 0 ? <span className="savings-pill"><Leaf size={12} />{totalSaved > 0 ? `${t.saved} ${savedPercent}% · ${formatBytes(totalSaved)}` : t.noReduction}</span> : null}
          </div>
          {items.map(item => {
            const aboveTarget = !!(item.result?.targetBytes && item.result.compressedBytes > item.result.targetBytes);
            const status = item.status === "done" && aboveTarget ? "above" : item.status;
            const statusText = status === "above" ? t.above : status === "compressing" ? t.compressing : t[status];
            return (
              <article key={item.id} className="result-row" data-file-id={item.id}>
                <div className="result-file">
                  <span className="result-preview">{item.status === "error" ? <ImageIcon size={20} /> : <Image src={item.previewUrl} alt="" width={54} height={42} unoptimized loading="lazy" />}</span>
                  <div className="min-w-0">
                    <p className="result-name" title={item.file.name}>{namedResults.get(item.id)?.outputName ?? item.file.name}</p>
                    <span className="result-meta">{item.result ? `${item.result.mimeType.replace("image/", "").toUpperCase()} · ${item.result.width} × ${item.result.height}` : item.file.type.replace("image/", "").toUpperCase()}</span>
                    {item.error ? <p className="result-error" role="alert">{item.error}</p> : null}
                  </div>
                </div>
                <div className="result-sizes">
                  <span aria-label={`${t.originalLabel}: ${formatBytes(item.file.size)}`}>{formatBytes(item.file.size)}</span><ArrowDown size={11} className="-rotate-90" aria-hidden="true" />
                  <strong><span data-compressed-bytes={item.result?.compressedBytes} data-output-mime={item.result?.mimeType} data-output-width={item.result?.width} data-output-height={item.result?.height}
                    aria-label={`${t.outputLabel}: ${item.result ? formatBytes(item.result.compressedBytes) : "—"}`} title={item.result ? `${item.result.compressedBytes.toLocaleString(locale)} ${t.bytes} · ${formatResult(item.result, t.noReduction)}` : undefined}>
                    {item.result ? formatBytes(item.result.compressedBytes) : "—"}
                  </span></strong>
                </div>
                <span className="result-status" data-state={status}>
                  {status === "done" ? <CheckCircle2 size={11} /> : status === "above" || status === "error" ? <CircleAlert size={11} /> : status === "compressing" ? <Loader2 size={11} className="animate-spin" /> : null}{statusText}
                </span>
                <div className="result-buttons">
                  {item.result ? <button type="button" className="icon-button" onClick={() => item.result && void downloadResult(namedResults.get(item.id)!)} aria-label={`${t.downloadLabel} ${item.file.name}`}><Download size={15} /></button> : null}
                  <button type="button" className="icon-button is-remove" onClick={() => removeItem(item.id)} aria-label={`${t.removeLabel} ${item.file.name}`}><Trash2 size={14} /></button>
                </div>
                {aboveTarget ? <p className="target-warning">{t.aboveHint}</p> : null}
              </article>
            );
          })}
          {completed.length > 0 && <ContinueProcessing tool="compress" locale={locale} count={completed.length} disabled={isProcessing} stale={resultSettings !== processingSignature} getImages={() => completed.flatMap(item => item.result ? [{ name: namedResults.get(item.id)!.outputName, blob: new Blob([item.result.buffer], { type: item.result.mimeType }) }] : [])} />}
        </div>
      ) : null}

      {toast ? <div role="status" className={`compressor-toast ${isToastVisible ? "" : "is-hidden"}`}><Check size={15} className="shrink-0" />{toast.message}</div> : null}
    </section>
  );
}

function triggerDownload(url: string, name: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

async function saveBlob(blob: Blob, name: string, description: string) {
  const picker = window as Window & SaveFilePicker;

  if (picker.showSaveFilePicker) {
    try {
      const extension = name.includes(".") ? `.${name.split(".").pop()}` : "";
      const handle = await picker.showSaveFilePicker({
        suggestedName: name,
        types: [
          {
            description,
            accept: { [blob.type || "application/octet-stream"]: extension ? [extension] : [] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  triggerDownload(url, name);
  URL.revokeObjectURL(url);
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let value = Math.max(0, bytes);
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function formatResult(result: CompressionResult, noReduction: string) {
  const savedBytes = result.originalBytes - result.compressedBytes;

  if (savedBytes <= 0) {
    return noReduction;
  }

  const percent = Math.round((savedBytes / result.originalBytes) * 100);
  return `-${percent}%`;
}
