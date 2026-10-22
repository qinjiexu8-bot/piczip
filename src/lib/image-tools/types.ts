import type { ResizeOptions } from "./geometry";
export type ToolKind = "resize" | "convert" | "stitch";
export type Format = "jpeg" | "png" | "webp";
export type ToolOptions = { tool: ToolKind; resize: ResizeOptions; format: Format | "original"; quality: number; background: string; transparent: boolean; direction: "vertical" | "horizontal"; edge: number; gap: number };
export type ToolFile = { id: string; file: File };
export type ToolResult = { id: string; name: string; blob: Blob; width: number; height: number };
export type ToolResponse = { type: "result"; result: ToolResult } | { type: "error"; name: string; error: string } | { type: "done" } | { type: "progress"; current: number; total: number };
