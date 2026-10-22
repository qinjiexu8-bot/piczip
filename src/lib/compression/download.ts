import type { CompressionResult } from "./types";

/** ZIP keys must remain unique even when the generated suffix already exists. */
export function createZipEntries(results: Pick<CompressionResult, "outputName" | "buffer">[]): Record<string, Uint8Array> {
  const files: Record<string, Uint8Array> = Object.create(null);
  const used = new Set<string>();

  for (const result of results) {
    // Discard directory separators so entries cannot become paths in an archive.
    const name = result.outputName.replace(/[\\/]/g, "_");
    const dot = name.lastIndexOf(".");
    const stem = dot > 0 ? name.slice(0, dot) : name;
    const extension = dot > 0 ? name.slice(dot) : "";
    let unique = name;
    let index = 2;

    while (used.has(unique.toLowerCase())) {
      unique = `${stem} (${index++})${extension}`;
    }

    used.add(unique.toLowerCase());
    files[unique] = new Uint8Array(result.buffer);
  }

  return files;
}
