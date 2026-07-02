export type OutputFormat = "auto" | "jpeg" | "png" | "webp";

export type CompressionOptions = {
  outputFormat: OutputFormat;
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  targetBytes?: number;
};

export type CompressionResult = {
  name: string;
  outputName: string;
  mimeType: string;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
  durationMs: number;
  engine: string;
  buffer: ArrayBuffer;
};

export type CompressionJob = {
  id: string;
  name: string;
  type: string;
  buffer: ArrayBuffer;
  options: CompressionOptions;
};

export type WorkerSuccess = {
  id: string;
  ok: true;
  result: CompressionResult;
};

export type WorkerFailure = {
  id: string;
  ok: false;
  error: string;
};

export type WorkerResponse = WorkerSuccess | WorkerFailure;
