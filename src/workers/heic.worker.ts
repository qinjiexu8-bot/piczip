/// <reference lib="webworker" />
import { convertHeic, isHeic, planDecode } from '@su-engineering/heic';
const ctx = self as unknown as DedicatedWorkerGlobalScope;
ctx.onmessage = async (event: MessageEvent<{ file: File; format: 'jpeg' | 'png'; quality: number }>) => {
  try {
    const { file, format, quality } = event.data;
    if (file.size > 50 * 1024 * 1024) throw new Error('input-limit');
    const bytes = await file.arrayBuffer();
    if (!(await isHeic(bytes)).isHeic) throw new Error('decode');
    const plan = planDecode(bytes);
    if (plan.displayWidth * plan.displayHeight > 40_000_000 || plan.codedWidth * plan.codedHeight > 40_000_000) throw new Error('input-limit');
    const result = await convertHeic(bytes, { type: format === 'jpeg' ? 'image/jpeg' : 'image/png', quality: quality / 100, maxDimension: 4096, wasmLoader: async () => (await import('@su-engineering/heic/wasm')).wasmDecoder });
    ctx.postMessage({ ok: true, blob: result.blob, width: result.width, height: result.height });
  } catch (error) { ctx.postMessage({ ok: false, error: error instanceof Error && error.message === 'input-limit' ? 'input-limit' : 'decode' }); }
};
