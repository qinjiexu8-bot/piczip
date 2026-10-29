export function convertHeicFile(file: File, format: 'jpeg' | 'png', quality: number, signal: AbortSignal): Promise<{ blob: Blob; width: number; height: number }> {
  if (signal.aborted) return Promise.reject(new DOMException('Cancelled', 'AbortError'));
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../../workers/heic.worker.ts', import.meta.url), { type: 'module' });
    const cleanup = () => { clearTimeout(timer); worker.terminate(); signal.removeEventListener('abort', onAbort); };
    const fail = (error: Error) => { cleanup(); reject(error); };
    const onAbort = () => fail(new DOMException('Cancelled', 'AbortError'));
    const timer = setTimeout(() => fail(new Error('timeout')), 120_000);
    signal.addEventListener('abort', onAbort, { once: true });
    worker.onerror = event => { event.preventDefault(); fail(new Error('decode')); };
    worker.onmessageerror = () => fail(new Error('decode'));
    worker.onmessage = event => { cleanup(); if (event.data.ok) resolve(event.data); else reject(new Error(event.data.error)); };
    try { worker.postMessage({ file, format, quality }); } catch { fail(new Error('decode')); }
  });
}
