import type { WorkflowTool } from "./settings";
export type TransferImage = { name: string; blob: Blob };
type StoredImage = { name: string; type: string; bytes: ArrayBuffer };
type Packet = { id: string; target: WorkflowTool; expires: number; images: StoredImage[] };
export const TRANSFER_TTL = 10 * 60 * 1000;
export function transferAllowed(images: TransferImage[], target: WorkflowTool) {
  return images.length >= (target === "stitch" ? 2 : 1) && images.length <= (target === "stitch" ? 20 : 50) && images.every(i => i.blob.size <= 50 * 1024 * 1024 && ["image/jpeg", "image/png", "image/webp"].includes(i.blob.type)) && images.reduce((sum, i) => sum + i.blob.size, 0) <= 200 * 1024 * 1024;
}
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("piczip-workflow", 2);
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; reject(new Error("storage-timeout")); }, 5000);
    request.onupgradeneeded = () => {
      const store = request.result.objectStoreNames.contains("transfers") ? request.transaction!.objectStore("transfers") : request.result.createObjectStore("transfers", { keyPath: "id" });
      if (!store.indexNames.contains("expires")) store.createIndex("expires", "expires");
    };
    request.onsuccess = () => { clearTimeout(timer); if (timedOut) request.result.close(); else resolve(request.result); };
    request.onerror = request.onblocked = () => { timedOut = true; clearTimeout(timer); reject(new Error("storage-unavailable")); };
  });
}
async function transact<T>(action: (store: IDBObjectStore, result: (value: T) => void) => void): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction("transfers", "readwrite");
    const store = transaction.objectStore("transfers");
    let value: T;
    const cursor = store.index("expires").openKeyCursor(IDBKeyRange.upperBound(Date.now()));
    cursor.onsuccess = () => { const c = cursor.result; if (c) { store.delete(c.primaryKey); c.continue(); } };
    const timer = setTimeout(() => { transaction.abort(); }, 30000);
    try { action(store, result => { value = result; }); }
    catch (error) { clearTimeout(timer); transaction.abort(); db.close(); reject(error); return; }
    transaction.oncomplete = () => { clearTimeout(timer); db.close(); resolve(value); };
    transaction.onerror = transaction.onabort = () => { clearTimeout(timer); db.close(); reject(new Error("storage-unavailable")); };
  });
}
export async function saveTransfer(images: TransferImage[], target: WorkflowTool): Promise<string> {
  if (!transferAllowed(images, target)) throw new Error("transfer-limit");
  const id = crypto.randomUUID();
  // WebKit may reject Blob/File values in IndexedDB. Store portable binary data instead.
  const stored: StoredImage[] = [];
  for (const image of images) stored.push({ name: image.name, type: image.blob.type, bytes: await image.blob.arrayBuffer() });
  await transact<void>(store => { store.put({ id, target, expires: Date.now() + TRANSFER_TTL, images: stored } satisfies Packet); });
  return id;
}
export async function readTransfer(id: string, target: WorkflowTool): Promise<TransferImage[] | null> {
  return transact((store, done) => {
    const request = store.get(id);
    request.onsuccess = () => {
      const packet = request.result as Packet | undefined;
      if (!packet || packet.target !== target || packet.expires <= Date.now() || !Array.isArray(packet.images)) { done(null); return; }
      if (!packet.images.every(image => typeof image.name === "string" && image.bytes instanceof ArrayBuffer && typeof image.type === "string")) { done(null); return; }
      const images = packet.images.map(image => ({ name: image.name, blob: new Blob([image.bytes], { type: image.type }) }));
      done(transferAllowed(images, target) ? images : null);
    };
  });
}
export async function deleteTransfer(id?: string) { await transact<void>(store => { if (id) store.delete(id); }); }
