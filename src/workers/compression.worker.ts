/// <reference lib="webworker" />

import type {
  CompressionJob,
  CompressionOptions,
  CompressionResult,
  OutputFormat,
  WorkerResponse,
} from "@/lib/compression/types";

type DecodedImage = ImageData;

const ctx: Worker = self as unknown as Worker;

ctx.addEventListener("message", async (event: MessageEvent<CompressionJob>) => {
  const job = event.data;

  try {
    const result = await compressImage(job);
    const response: WorkerResponse = { id: job.id, ok: true, result };
    ctx.postMessage(response, [result.buffer]);
  } catch (error) {
    const response: WorkerResponse = {
      id: job.id,
      ok: false,
      error: error instanceof Error ? error.message : "Compression failed.",
    };
    ctx.postMessage(response);
  }
});

async function compressImage(job: CompressionJob): Promise<CompressionResult> {
  const started = performance.now();
  const inputFormat = detectFormat(job.type, job.name);
  const decoded = await decodeImage(job.buffer, inputFormat);
  const resized = await resizeImage(decoded, job.options);
  const { buffer: encoded, format: outputFormat } = await encodeAuto(
    resized,
    inputFormat,
    job.options,
  );
  const durationMs = Math.round(performance.now() - started);
  const mimeType = formatToMime(outputFormat);

  return {
    name: job.name,
    outputName: renameWithExtension(job.name, formatToExtension(outputFormat)),
    mimeType,
    originalBytes: job.buffer.byteLength,
    compressedBytes: encoded.byteLength,
    width: resized.width,
    height: resized.height,
    durationMs,
    engine: engineLabel(outputFormat),
    buffer: encoded,
  };
}

function detectFormat(type: string, name: string): Exclude<OutputFormat, "auto"> {
  const lower = name.toLowerCase();

  if (type === "image/png" || lower.endsWith(".png")) return "png";
  if (type === "image/webp" || lower.endsWith(".webp")) return "webp";
  return "jpeg";
}

async function decodeImage(
  buffer: ArrayBuffer,
  format: Exclude<OutputFormat, "auto">,
): Promise<DecodedImage> {
  if (format === "jpeg") {
    const { decode } = await import("@jsquash/jpeg");
    return decode(buffer, { preserveOrientation: true });
  }

  if (format === "webp") {
    const { decode } = await import("@jsquash/webp");
    return decode(buffer);
  }

  const { decode } = await import("@jsquash/png");
  return decode(buffer, { bitDepth: 8 });
}

async function resizeImage(image: ImageData, options: CompressionOptions): Promise<ImageData> {
  const maxWidth = options.maxWidth || image.width;
  const maxHeight = options.maxHeight || image.height;
  const ratio = Math.min(1, maxWidth / image.width, maxHeight / image.height);
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  if (width === image.width && height === image.height) {
    return image;
  }

  if (typeof OffscreenCanvas === "undefined") {
    return image;
  }

  const source = new OffscreenCanvas(image.width, image.height);
  const sourceContext = source.getContext("2d");
  const target = new OffscreenCanvas(width, height);
  const targetContext = target.getContext("2d");

  if (!sourceContext || !targetContext) {
    return image;
  }

  sourceContext.putImageData(image, 0, 0);
  targetContext.imageSmoothingEnabled = true;
  targetContext.imageSmoothingQuality = "high";
  targetContext.drawImage(source, 0, 0, width, height);

  return targetContext.getImageData(0, 0, width, height);
}

async function encodeWithTargetSize(
  image: ImageData,
  format: Exclude<OutputFormat, "auto">,
  options: CompressionOptions,
): Promise<ArrayBuffer> {
  const targetBytes = options.targetBytes;
  let quality = clampQuality(options.quality);
  let best = await encodeImage(image, format, quality);
  let smallest = best;

  if (!targetBytes || best.byteLength <= targetBytes) {
    return best;
  }

  let low = 20;
  let high = quality;

  for (let index = 0; index < 8; index += 1) {
    quality = Math.round((low + high) / 2);
    const candidate = await encodeImage(image, format, quality);
    if (candidate.byteLength < smallest.byteLength) {
      smallest = candidate;
    }

    if (candidate.byteLength > targetBytes) {
      high = quality - 1;
    } else {
      best = candidate;
      low = quality + 1;
    }
  }

  return best.byteLength <= targetBytes ? best : smallest;
}

async function encodeAuto(
  image: ImageData,
  inputFormat: Exclude<OutputFormat, "auto">,
  options: CompressionOptions,
): Promise<{ buffer: ArrayBuffer; format: Exclude<OutputFormat, "auto"> }> {
  if (options.outputFormat !== "auto") {
    return {
      buffer: await encodeWithTargetSize(image, options.outputFormat, options),
      format: options.outputFormat,
    };
  }

  const candidateFormats = uniqueFormats([inputFormat, "webp"]);
  const candidates = await Promise.all(
    candidateFormats.map(async (format) => ({
      format,
      buffer: await encodeWithTargetSize(image, format, options),
    })),
  );

  return candidates.reduce((best, candidate) =>
    candidate.buffer.byteLength < best.buffer.byteLength ? candidate : best,
  );
}

async function encodeImage(
  image: ImageData,
  format: Exclude<OutputFormat, "auto">,
  quality: number,
): Promise<ArrayBuffer> {
  if (format === "jpeg") {
    const { encode } = await import("@jsquash/jpeg");
    return encode(image, { quality });
  }

  if (format === "webp") {
    const { encode } = await import("@jsquash/webp");
    return encode(image, { quality });
  }

  const { encode } = await import("@jsquash/png");
  return encode(image, { bitDepth: 8 });
}

function clampQuality(quality: number) {
  return Math.max(20, Math.min(100, Math.round(quality)));
}

function formatToMime(format: Exclude<OutputFormat, "auto">) {
  if (format === "jpeg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  return "image/png";
}

function formatToExtension(format: Exclude<OutputFormat, "auto">) {
  if (format === "jpeg") return "jpg";
  return format;
}

function uniqueFormats(formats: Array<Exclude<OutputFormat, "auto">>) {
  return Array.from(new Set(formats));
}

function engineLabel(format: Exclude<OutputFormat, "auto">) {
  if (format === "jpeg") return "MozJPEG Wasm";
  if (format === "webp") return "WebP Wasm";
  return "PNG Wasm";
}

function renameWithExtension(name: string, extension: string) {
  return `${name.replace(/\.[^.]+$/, "")}-piczip.${extension}`;
}
