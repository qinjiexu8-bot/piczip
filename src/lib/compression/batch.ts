type BatchItem = { id: string };

/** Cancellation also covers preparation before a request reaches the worker. */
export class CompressionBatch {
  private cancelled = false;
  private removed = new Set<string>();
  private active: { id: string; controller: AbortController } | null = null;

  cancel() {
    this.cancelled = true;
    this.active?.controller.abort();
  }

  remove(id: string) {
    this.removed.add(id);
    if (this.active?.id === id) this.active.controller.abort();
  }

  async run<T extends BatchItem, R>(
    items: T[],
    process: (item: T, signal: AbortSignal) => Promise<R>,
    callbacks: {
      start: (item: T, index: number, total: number) => void;
      success: (item: T, result: R) => void;
      failure: (item: T, error: unknown) => void;
    },
  ) {
    for (const [index, item] of items.entries()) {
      if (this.cancelled) break;
      if (this.removed.has(item.id)) continue;

      const controller = new AbortController();
      this.active = { id: item.id, controller };
      callbacks.start(item, index + 1, items.length);
      try {
        const result = await process(item, controller.signal);
        if (!this.cancelled && !this.removed.has(item.id)) callbacks.success(item, result);
      } catch (error) {
        if (!this.cancelled && !this.removed.has(item.id)) callbacks.failure(item, error);
      } finally {
        this.active = null;
      }
    }
  }
}
