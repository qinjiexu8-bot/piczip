import type { CompressionJob, CompressionResult, WorkerResponse } from "./types";

export class CompressionWorkerError extends Error {
  readonly code: "worker" | "timeout" | "unavailable" | "busy";

  constructor(code: CompressionWorkerError["code"]) {
    super(`Compression worker: ${code}`);
    this.name = "CompressionWorkerError";
    this.code = code;
  }
}

/** One active image per client. Workers are created lazily and replaced on failure. */
export class CompressionWorkerClient {
  private worker: Worker | null = null;
  private cancelPending: (() => void) | null = null;
  private readonly createWorker: () => Worker;
  private readonly timeoutMs: number;

  constructor(createWorker: () => Worker, timeoutMs = 120_000) {
    this.createWorker = createWorker;
    this.timeoutMs = timeoutMs;
  }

  run(job: CompressionJob, signal?: AbortSignal): Promise<CompressionResult> {
    if (signal?.aborted) return Promise.reject(new DOMException("Cancelled", "AbortError"));
    if (this.cancelPending) return Promise.reject(new CompressionWorkerError("busy"));

    let worker: Worker;
    try {
      worker = this.worker ?? this.createWorker();
      this.worker = worker;
    } catch {
      return Promise.reject(new CompressionWorkerError("unavailable"));
    }

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        worker.removeEventListener("message", onMessage);
        worker.removeEventListener("error", onError);
        worker.removeEventListener("messageerror", onError);
        signal?.removeEventListener("abort", onAbort);
        this.cancelPending = null;
      };
      const fail = (error: Error) => {
        cleanup();
        worker.terminate();
        this.worker = null;
        reject(error);
      };
      const onAbort = () => fail(new DOMException("Cancelled", "AbortError"));
      const onError = (event: Event) => {
        event.preventDefault();
        fail(new CompressionWorkerError("worker"));
      };
      const onMessage = (event: MessageEvent<WorkerResponse>) => {
        if (event.data?.id !== job.id) return;
        cleanup();
        if (event.data.ok) resolve(event.data.result);
        else reject(new Error(event.data.error));
      };
      const timer = setTimeout(() => fail(new CompressionWorkerError("timeout")), this.timeoutMs);

      this.cancelPending = onAbort;
      worker.addEventListener("message", onMessage);
      worker.addEventListener("error", onError);
      worker.addEventListener("messageerror", onError);
      signal?.addEventListener("abort", onAbort, { once: true });

      try {
        worker.postMessage(job, [job.buffer]);
      } catch {
        fail(new CompressionWorkerError("worker"));
      }
    });
  }

  dispose() {
    this.cancelPending?.();
    this.worker?.terminate();
    this.worker = null;
  }
}
