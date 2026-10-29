import { validPadding } from "../image-tools/padding.ts";
import { validMosaic } from "../image-tools/mosaic.ts";
import { validRename, type RenameOptions } from "../export/names.ts";
import { validWatermark } from "../image-tools/watermark.ts";
import { validCrop } from "../image-tools/crop.ts";
import type { ToolOptions } from "../image-tools/types";

export type WorkflowTool = "compress" | "resize" | "convert" | "stitch" | "crop" | "watermark" | "padding" | "mosaic";
export type CompressionPreset = { rename?: RenameOptions; format: "auto" | "jpeg" | "png" | "webp"; quality: number; targetKb: number; maxWidth: number };
export type Settings = CompressionPreset | ToolOptions;
export type Preset = { id: string; tool: WorkflowTool; name: string; settings: Settings };
export const PRESET_KEY = "piczip:presets:v1";
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const number = (value: unknown, min: number, max: number) => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
const integer = (value: unknown, min: number, max: number) => number(value, min, max) && Number.isInteger(value);
export function validSettings(tool: WorkflowTool, value: unknown): value is Settings {
  if (!record(value) || !number(value.quality, 20, 100)) return false;
  if (value.rename !== undefined && !validRename(value.rename)) return false;
  if (tool === "padding" && !validPadding(value.padding)) return false;
  if (tool === "mosaic" && !validMosaic(value.mosaic)) return false;
  if (tool === "watermark" && !validWatermark(value.watermark)) return false;
  if (tool === "compress") return ["auto", "jpeg", "png", "webp"].includes(String(value.format)) && number(value.targetKb, 0, 51200) && integer(value.maxWidth, 0, 40000000);
  if (tool === "crop" && !validCrop(value.crop)) return false;
  if (value.tool !== tool || !["jpeg", "png", "webp", ...((tool === "resize" || tool === "crop" || tool === "watermark" || tool === "mosaic") ? ["original"] : [])].includes(String(value.format))) return false;
  if (typeof value.background !== "string" || !/^#[\da-f]{6}$/i.test(value.background) || typeof value.transparent !== "boolean") return false;
  if (!["vertical", "horizontal"].includes(String(value.direction)) || !integer(value.edge, 1, 8192) || !integer(value.gap, 0, 200)) return false;
  const r = value.resize;
  if (!record(r) || !["pixels", "percent"].includes(String(r.mode)) || typeof r.lock !== "boolean" || !integer(r.width, 0, 8192) || !integer(r.height, 0, 8192) || !number(r.percent, 1, 400)) return false;
  if (tool === "resize" && r.mode === "pixels" && (!(r.width || r.height) || (!r.lock && (!r.width || !r.height)))) return false;
  return true;
}
export function parsePresets(raw: string | null): Preset[] {
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || data.length > 160 || !data.every(p => record(p) && typeof p.id === "string" && typeof p.name === "string" && p.name.trim().length > 0 && p.name.length <= 60 && ["compress", "resize", "convert", "stitch", "crop", "watermark", "padding", "mosaic"].includes(String(p.tool)) && validSettings(p.tool as WorkflowTool, p.settings))) throw new Error("invalid-presets");
  return data as Preset[];
}
