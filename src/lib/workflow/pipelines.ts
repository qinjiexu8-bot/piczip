import { parsePresets, validSettings, type Preset, type Settings, type WorkflowTool } from './settings.ts';
import { exportNames } from '../export/names.ts';
import type { TransferImage } from './transfer.ts';
import type { ToolOptions, ToolResponse } from '../image-tools/types.ts';
import { CompressionWorkerClient } from '../compression/worker-client.ts';

export type PipelineStep = { tool: WorkflowTool; name: string; settings: Settings };
export type Pipeline = { id: string; name: string; steps: PipelineStep[] };
export const PIPELINE_KEY = 'piczip:pipelines:v1';
export function validPipeline(value: unknown): value is Pipeline {
  if (!value || typeof value !== 'object') return false;
  const v = value as Pipeline;
  return typeof v.id === 'string' && v.id.length > 0 && typeof v.name === 'string' && !!v.name.trim() && v.name.length <= 60
    && Array.isArray(v.steps) && v.steps.length >= 2 && v.steps.length <= 6 && v.steps.filter(s => s?.tool === 'stitch').length <= 1 && v.steps.every(s => !!s && typeof s.name === 'string' && !!s.name.trim() && s.name.length <= 60 && ['compress','resize','convert','stitch','crop','watermark','padding','mosaic'].includes(s.tool) && validSettings(s.tool, s.settings));
}
export function parsePipelines(raw: string | null): Pipeline[] {
  if (!raw) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value) || value.length > 10 || !value.every(validPipeline)) throw new Error('invalid-pipelines');
  return value;
}
export function stepFromPreset(preset: Preset): PipelineStep {
  if (!validSettings(preset.tool, preset.settings)) throw new Error('invalid-preset');
  return { tool: preset.tool, name: preset.name, settings: structuredClone(preset.settings) };
}
export function pipelineInputAllowed(images: TransferImage[], steps: PipelineStep[]) {
  return steps.length >= 2 && steps.length <= 6 && steps.filter(s => s.tool === 'stitch').length <= 1 && images.length >= (steps.some(s => s.tool === 'stitch') ? 2 : 1) && images.length <= (steps.some(s => s.tool === 'stitch') ? 20 : 50)
    && validBatch(images);
}
function validBatch(images: TransferImage[]) {
  return images.every(i => i.blob.size <= 50 * 1024 * 1024 && ['image/jpeg','image/png','image/webp'].includes(i.blob.type)) && images.reduce((n, i) => n + i.blob.size, 0) <= 200 * 1024 * 1024;
}
function rename(images: TransferImage[], settings: Settings) {
  const names = exportNames(images.map(i => i.name), settings.rename);
  return images.map((image, i) => ({ ...image, name: names[i] }));
}
export async function runPipelineStep(images: TransferImage[], step: PipelineStep, signal: AbortSignal): Promise<TransferImage[]> {
  if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
  if (!validSettings(step.tool, step.settings) || images.length < (step.tool === 'stitch' ? 2 : 1) || images.length > (step.tool === 'stitch' ? 20 : 50) || !validBatch(images)) throw new Error('invalid-step');
  if (step.tool === 'compress') {
    const settings = step.settings as Extract<Settings, { targetKb: number }>;
    const client = new CompressionWorkerClient(() => new Worker(new URL('../../workers/compression.worker.ts', import.meta.url), { type: 'module' }));
    const outputs: TransferImage[] = [];
    try {
      for (const image of images) {
        const bitmap = await createImageBitmap(image.blob);
        try { if (bitmap.width * bitmap.height > 40_000_000) throw new Error('input-limit'); }
        finally { bitmap.close(); }
        const result = await client.run({ id: crypto.randomUUID(), name: image.name, type: image.blob.type, buffer: await image.blob.arrayBuffer(), options: { outputFormat: settings.format, quality: settings.quality, targetBytes: settings.targetKb ? settings.targetKb * 1024 : undefined, maxWidth: settings.maxWidth || undefined } }, signal);
        outputs.push({ name: result.outputName, blob: new Blob([result.buffer], { type: result.mimeType }) });
      }
      if (!validBatch(outputs)) throw new Error('output-limit');
      return rename(outputs, settings);
    } finally { client.dispose(); }
  }
  const settings = step.settings as ToolOptions;
  const outputs = await new Promise<TransferImage[]>((resolve, reject) => {
    const worker = new Worker(new URL('../../workers/image-tools.worker.ts', import.meta.url), { type: 'module' });
    const done: TransferImage[] = [];
    let timer: ReturnType<typeof setTimeout>;
    const cleanup = () => { clearTimeout(timer); worker.terminate(); signal.removeEventListener('abort', onAbort); };
    const fail = (error: Error) => { cleanup(); reject(error); };
    const onAbort = () => fail(new DOMException('Cancelled', 'AbortError'));
    const arm = () => { clearTimeout(timer); timer = setTimeout(() => fail(new Error('timeout')), 120_000); };
    signal.addEventListener('abort', onAbort, { once: true });
    worker.onerror = () => fail(new Error('worker'));
    worker.onmessageerror = () => fail(new Error('worker'));
    worker.onmessage = (event: MessageEvent<ToolResponse>) => {
      arm(); const message = event.data;
      if (message.type === 'result') done.push({ name: message.result.name, blob: message.result.blob });
      if (message.type === 'error') fail(new Error(`${message.name}: ${message.error}`));
      if (message.type === 'done') { cleanup(); resolve(rename(done, settings)); }
    };
    arm(); worker.postMessage({ files: images.map((image, i) => ({ id: String(i), file: new File([image.blob], image.name, { type: image.blob.type }) })), options: settings });
  });
  if (!outputs.length || !validBatch(outputs)) throw new Error('output-limit');
  return outputs;
}
export function readSavedPresets(raw: string | null) { return parsePresets(raw); }
