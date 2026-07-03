"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Archive, Download, ImageIcon, Loader2, Lock, Trash2, Upload } from "lucide-react";
import { zipSync } from "fflate";
import type {
  CompressionOptions,
  CompressionResult,
  OutputFormat,
  WorkerResponse,
} from "@/lib/compression/types";

type FileItem = {
  id: string;
  file: File;
  status: "queued" | "compressing" | "done" | "error";
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
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type CompressorLocale = "en" | "zh";

const compressorCopy = {
  en: {
    title: "Compress images",
    subtitle: "Free JPG, PNG, and WebP compression in your browser.",
    noUpload: "No upload",
    dropTitle: "Drop images here",
    dropText: "Choose up to 50 images. No account is required and files are not uploaded.",
    targetSize: "Target size",
    targetHint: "Best effort in KB. Use 0 to disable; lower max width if needed.",
    output: "Output",
    quality: "Quality",
    maxWidth: "Max width",
    compressing: "Compressing...",
    compress: "Compress images",
    downloadZip: "Download ZIP",
    clear: "Clear",
    processingTitle: "Compressing images",
    processingDetail: "Processing",
    tableFile: "File",
    tableStatus: "Status",
    tableSaved: "Result",
    tableAction: "Action",
    downloadLabel: "Download",
    removeLabel: "Remove",
    totalSaved: "Total saved",
    noReduction: "No reduction",
    originalLabel: "Original",
    outputLabel: "Output",
    across: "across",
    imageSingular: "image",
    imagePlural: "images",
    tooLarge: "Image is larger than the 40MP safety limit.",
    workerNotReady: "Compression worker is not ready.",
    failed: "Compression failed.",
  },
  zh: {
    title: "压缩图片",
    subtitle: "免费压缩 JPG、PNG、WebP，直接在浏览器中完成。",
    noUpload: "不上传",
    dropTitle: "拖入图片",
    dropText: "一次最多选择 50 张图片。无需账号，图片文件不会上传。",
    targetSize: "目标大小",
    targetHint: "尽量达到指定 KB。填 0 不限制；必要时降低最大宽度。",
    output: "输出格式",
    quality: "质量",
    maxWidth: "最大宽度",
    compressing: "压缩中...",
    compress: "开始压缩",
    downloadZip: "下载 ZIP",
    clear: "清空",
    processingTitle: "正在压缩图片",
    processingDetail: "处理中",
    tableFile: "文件",
    tableStatus: "状态",
    tableSaved: "结果",
    tableAction: "操作",
    downloadLabel: "下载",
    removeLabel: "移除",
    totalSaved: "共节省",
    noReduction: "未变小",
    originalLabel: "原图",
    outputLabel: "输出",
    across: "共处理",
    imageSingular: "张图片",
    imagePlural: "张图片",
    tooLarge: "图片超过 40MP 安全限制。",
    workerNotReady: "压缩 worker 尚未就绪。",
    failed: "压缩失败。",
  },
};

export function CompressorApp({ locale = "en" }: { locale?: CompressorLocale }) {
  const t = compressorCopy[locale];
  const workerRef = useRef<Worker | null>(null);
  const [items, setItems] = useState<FileItem[]>([]);
  const [format, setFormat] = useState<OutputFormat>("auto");
  const [quality, setQuality] = useState(82);
  const [targetKb, setTargetKb] = useState(200);
  const [maxWidth, setMaxWidth] = useState(2400);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessing, setCurrentProcessing] = useState<{ index: number; total: number } | null>(
    null,
  );
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const completed = items.filter((item) => item.status === "done" && item.result);
  const queued = items.filter((item) => item.status === "queued");
  const totalSaved = completed.reduce((sum, item) => {
    const result = item.result;
    return result ? sum + Math.max(0, result.originalBytes - result.compressedBytes) : sum;
  }, 0);

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
    workerRef.current = new Worker(new URL("../../workers/compression.worker.ts", import.meta.url), {
      type: "module",
    });

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  async function addFiles(fileList: FileList | File[]) {
    const accepted = Array.from(fileList)
      .filter((file) => acceptedImageTypes.has(file.type))
      .slice(0, Math.max(0, maxFiles - items.length))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: "queued" as const,
      }));

    if (accepted.length > 0) {
      setItems((current) => [...current, ...accepted]);
      const message = locale === "zh"
        ? `已成功添加 ${accepted.length} 张图片！请点击“开始压缩”。`
        : `Successfully added ${accepted.length} ${
            accepted.length === 1 ? t.imageSingular : t.imagePlural
          }! Click "Compress images" to start.`;
      setToast({ message, type: "success" });
    }
  }

  async function compressAll() {
    if (!workerRef.current || isProcessing) return;

    setIsProcessing(true);
    const queued = items.filter((item) => item.status !== "compressing");

    for (const [index, item] of queued.entries()) {
      setCurrentProcessing({ index: index + 1, total: queued.length });
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, status: "compressing", error: undefined } : entry,
        ),
      );

      try {
        const result = await runCompression(item, options);
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, status: "done", result } : entry,
          ),
        );
      } catch (error) {
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  status: "error",
                  error: error instanceof Error ? error.message : t.failed,
                }
              : entry,
          ),
        );
      }
    }

    setIsProcessing(false);
    setCurrentProcessing(null);
  }

  async function runCompression(item: FileItem, compressionOptions: CompressionOptions) {
    const bitmap = await createImageBitmap(item.file);
    const pixels = bitmap.width * bitmap.height;
    bitmap.close();

    if (pixels > maxPixels) {
      throw new Error(t.tooLarge);
    }

    const buffer = await item.file.arrayBuffer();

    return new Promise<CompressionResult>((resolve, reject) => {
      const worker = workerRef.current;
      if (!worker) {
        reject(new Error(t.workerNotReady));
        return;
      }

      const onMessage = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.id !== item.id) return;
        worker.removeEventListener("message", onMessage);

        if (event.data.ok) {
          resolve(event.data.result);
        } else {
          reject(new Error(event.data.error));
        }
      };

      worker.addEventListener("message", onMessage);
      worker.postMessage(
        {
          id: item.id,
          name: item.file.name,
          type: item.file.type,
          buffer,
          options: compressionOptions,
        },
        [buffer],
      );
    });
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function clearAll() {
    setItems([]);
  }

  async function downloadResult(result: CompressionResult) {
    const blob = new Blob([result.buffer], { type: result.mimeType });
    await saveBlob(blob, result.outputName, "Image file");
  }

  async function downloadZip() {
    const files: Record<string, Uint8Array> = {};

    for (const item of completed) {
      if (!item.result) continue;
      files[item.result.outputName] = new Uint8Array(item.result.buffer);
    }

    const zipped = zipSync(files);
    await saveBlob(
      new Blob([zipped], { type: "application/zip" }),
      "piczip-compressed-images.zip",
      "ZIP archive",
    );
  }

  return (
    <section className="rounded-[18px] border-2 border-foreground bg-[var(--panel)] p-4 shadow-[7px_7px_0_var(--foreground),0_24px_70px_rgba(31,38,44,0.13)] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">{t.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{t.subtitle}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-2 text-xs font-black text-teal-700">
          <Lock className="size-4" />
          {t.noUpload}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void addFiles(event.dataTransfer.files);
          }}
          className="grid min-h-72 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/80 p-6 text-center transition hover:border-slate-500 lg:min-h-80"
        >
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) void addFiles(event.target.files);
              event.currentTarget.value = "";
            }}
          />
          <span>
            <span className="mx-auto mb-4 grid size-20 place-items-center rounded-3xl bg-foreground text-[var(--lime)] shadow-xl">
              <Upload className="size-9" strokeWidth={2.5} />
            </span>
            <span className="block text-3xl font-black">{t.dropTitle}</span>
            <span className="mx-auto mt-3 block max-w-md text-sm leading-6 text-slate-600">
              {t.dropText}
            </span>
          </span>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <Setting label={t.targetSize}>
            <input
              min={0}
              type="number"
              value={targetKb}
              onChange={(event) => setTargetKb(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold outline-none focus:border-foreground"
            />
          </Setting>
          <Setting label={t.output}>
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value as OutputFormat)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold outline-none focus:border-foreground"
            >
              <option value="auto">Auto</option>
              <option value="jpeg">JPG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </Setting>
          <Setting label={t.quality}>
            <input
              min={20}
              max={100}
              type="range"
              value={quality}
              onChange={(event) => setQuality(Number(event.target.value))}
              className="mt-4 w-full accent-[var(--teal)]"
            />
            <span className="mt-1 block font-black">{quality}</span>
          </Setting>
          <Setting label={t.maxWidth}>
            <input
              min={320}
              step={100}
              type="number"
              value={maxWidth}
              onChange={(event) => setMaxWidth(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold outline-none focus:border-foreground"
            />
          </Setting>
        </div>
      </div>

      <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
        {t.targetHint}
      </p>



      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void compressAll()}
          disabled={!items.length || isProcessing}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-foreground bg-[var(--coral)] px-5 font-black text-white shadow-[4px_4px_0_var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ImageIcon className="size-5" />
          {isProcessing ? t.compressing : t.compress}
        </button>
        <button
          type="button"
          onClick={() => void downloadZip()}
          disabled={!completed.length}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Archive className="size-5" />
          {t.downloadZip}
        </button>
        <button type="button" onClick={clearAll} className="text-sm font-bold text-slate-600 hover:text-foreground">
          {t.clear}
        </button>
      </div>

      {currentProcessing ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-800">
          <Loader2 className="size-5 animate-spin" />
          <span>
            {t.processingTitle} · {t.processingDetail} {currentProcessing.index}/
            {currentProcessing.total}
          </span>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <div className="grid min-w-[760px] grid-cols-[minmax(0,0.62fr)_minmax(210px,0.38fr)_92px_92px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase text-slate-500">
            <span>{t.tableFile}</span>
            <span>
              {t.originalLabel} / {t.outputLabel}
            </span>
            <span>{t.tableStatus}</span>
            <span>{t.tableAction}</span>
          </div>
          {items.map((item) => (
            <div key={item.id} className="grid min-w-[760px] grid-cols-[minmax(0,0.62fr)_minmax(210px,0.38fr)_92px_92px] items-center gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0">
              <div className="min-w-0">
                <p className="max-w-[34ch] truncate font-bold" title={item.file.name}>
                  {item.file.name}
                </p>
                {item.error ? <p className="mt-1 text-xs font-semibold text-red-600">{item.error}</p> : null}
              </div>
              <div className="grid gap-1 text-xs text-slate-600">
                <span>
                  {t.originalLabel}: <strong>{formatBytes(item.file.size)}</strong>
                </span>
                <span>
                  {t.outputLabel}:{" "}
                  <strong>
                    {item.result ? formatBytes(item.result.compressedBytes) : "-"}
                    {item.result ? ` (${formatResult(item.result, t.noReduction)})` : ""}
                  </strong>
                </span>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">
                {item.status}
              </span>
              <div className="flex items-center justify-end gap-2">
                {item.result ? (
                  <button
                    type="button"
                    onClick={() => item.result && void downloadResult(item.result)}
                    className="rounded-lg border border-slate-200 p-2 hover:border-foreground"
                    aria-label={`${t.downloadLabel} ${item.file.name}`}
                  >
                    <Download className="size-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-600 hover:border-red-300 hover:bg-red-100"
                  aria-label={`${t.removeLabel} ${item.file.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {completed.length > 0 ? (
        <p className="mt-4 text-sm font-bold text-teal-700">
          {totalSaved > 0 ? `${t.totalSaved}: ${formatBytes(totalSaved)}` : t.noReduction}{" "}
          {t.across} {completed.length} {completed.length === 1 ? t.imageSingular : t.imagePlural}.
        </p>
      ) : null}

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl border-2 border-foreground bg-[var(--lime)] px-5 py-3 font-black text-slate-800 shadow-[4px_4px_0_var(--foreground)] animate-slide-down">
          {toast.message}
        </div>
      )}
    </section>
  );
}

function Setting({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="rounded-xl border border-slate-200 bg-white p-4">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
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
