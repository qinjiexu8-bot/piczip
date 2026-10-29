"use client";

import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import type { Locale } from "@/lib/i18n/config";
import copy from "@/lib/image-tools/canvas-messages.json";
import { watermarkMessages } from "@/lib/image-tools/watermark-messages";
import { canvasRatios, paddingLayout, type PaddingOptions } from "@/lib/image-tools/padding";
import { drawMosaic, MAX_MOSAIC_REGIONS, type MosaicOptions, type MosaicRegion } from "@/lib/image-tools/mosaic";

type PreviewFile = { id: string; url: string; file: File };
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const surface = (w: number, h: number) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
function useSource(files: PreviewFile[], locale: Locale, disabled = false) {
  const t = copy[locale].common;
  const [selected, setSelected] = useState("");
  const [loaded, setLoaded] = useState<{ url: string; width: number; height: number } | null>(null);
  const [failed, setFailed] = useState("");
  const image = useRef<HTMLImageElement>(null);
  const file = files.find(f => f.id === selected) ?? files[0];
  const size = loaded?.url === file?.url ? loaded : null;
  const controls = file ? <>
    <label className="tool-field">{t.preview}<select aria-label={t.preview} disabled={disabled} value={file.id} onChange={e => setSelected(e.target.value)}>{files.map(f => <option key={f.id} value={f.id}>{f.file.name}</option>)}</select></label>
    {/* A local object URL cannot be rendered through the Next image optimizer. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img ref={image} key={file.url} src={file.url} alt="" aria-hidden="true" className="hidden" onLoad={e => {
      const img = e.currentTarget;
      if (!img.naturalWidth || img.naturalWidth * img.naturalHeight > 40_000_000) setFailed(file.url);
      else setLoaded({ url: file.url, width: img.naturalWidth, height: img.naturalHeight });
    }} onError={() => setFailed(file.url)} />
    {!size && <p role="status">{failed === file.url ? t.failed : t.loading}</p>}
  </> : <p className="crop-empty">{t.empty}</p>;
  return { file, size, image, controls };
}
export function PaddingControls({ value, onChange, locale }: { value: PaddingOptions; onChange: (v: PaddingOptions) => void; locale: Locale }) {
  const t = copy[locale].padding, c = copy[locale].common;
  const patch = (v: Partial<PaddingOptions>) => onChange({ ...value, ...v });
  return <div className="canvas-tool-controls">
    <label className="tool-field">{t.mode}<select aria-label={t.mode} value={value.mode} onChange={e => patch({ mode: e.target.value as PaddingOptions["mode"] })}><option value="border">{t.border}</option><option value="canvas">{t.canvas}</option><option value="ratio">{t.ratio}</option></select></label>
    {value.mode === "border" && <div className="crop-numbers">{(["top", "right", "bottom", "left"] as const).map(key => <label className="tool-field" key={key}>{c[key]}<input type="number" min="0" max="4096" value={value[key]} onChange={e => patch({ [key]: Number(e.target.value) })} /></label>)}</div>}
    {value.mode === "canvas" && <div className="tool-field-pair">{(["width", "height"] as const).map(key => <label className="tool-field" key={key}>{c[key]}<input type="number" min="1" max="8192" value={value[key] || ""} onChange={e => patch({ [key]: Number(e.target.value) })} /></label>)}</div>}
    {value.mode === "ratio" && <label className="tool-field">{t.ratioLabel}<select aria-label={t.ratioLabel} value={value.ratio} onChange={e => patch({ ratio: e.target.value as PaddingOptions["ratio"] })}>{canvasRatios.map(r => <option key={r}>{r}</option>)}</select></label>}
    {value.mode !== "border" && <label className="tool-field">{c.position}<select aria-label={c.position} value={value.position} onChange={e => patch({ position: Number(e.target.value) })}>{watermarkMessages[locale].positions.map((p, i) => <option key={p} value={i}>{p}</option>)}</select></label>}
    <p className="field-hint">{t.fitHint}</p><p className="field-hint">{c.batch}</p>
  </div>;
}
export function PaddingPreview({ files, value, locale, format, background, transparent, disabled }: { files: PreviewFile[]; value: PaddingOptions; locale: Locale; format: string; background: string; transparent: boolean; disabled: boolean }) {
  const source = useSource(files, locale, disabled);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { size, file, image } = source;
  let layout: ReturnType<typeof paddingLayout> | null = null;
  try { if (size) layout = paddingLayout(size, value); } catch { /* The worker also checks each image before allocating. */ }
  useEffect(() => {
    if (!size || !image.current || !canvas.current) return;
    let box: ReturnType<typeof paddingLayout>;
    try { box = paddingLayout(size, value); } catch { return; }
    const target = canvas.current, scale = Math.min(1, 640 / box.width, 440 / box.height);
    target.width = Math.max(1, Math.round(box.width * scale)); target.height = Math.max(1, Math.round(box.height * scale));
    const ctx = target.getContext("2d"); if (!ctx) return;
    ctx.scale(target.width / box.width, target.height / box.height);
    if (format === "jpeg" || !transparent) { ctx.fillStyle = background; ctx.fillRect(0, 0, box.width, box.height); }
    ctx.drawImage(image.current, box.x, box.y, box.imageWidth, box.imageHeight);
  }, [size, value, format, background, transparent, file?.url, image]);
  return <section className="canvas-tool-preview">{source.controls}{layout && <><div className="canvas-preview-stage"><canvas ref={canvas} role="img" aria-label={copy[locale].common.result} /></div><p className="field-hint" data-padding-size>{copy[locale].common.size}: {layout.width} × {layout.height} px</p></>}{size && !layout && <p role="status">{copy[locale].padding.invalid}</p>}</section>;
}
export function MosaicControls({ value, onChange, locale }: { value: MosaicOptions; onChange: (v: MosaicOptions) => void; locale: Locale }) {
  const t = copy[locale].mosaic;
  return <div className="canvas-tool-controls">
    <label className="tool-field">{t.mode}<select aria-label={t.mode} value={value.mode} onChange={e => onChange({ ...value, mode: e.target.value as MosaicOptions["mode"] })}><option value="pixelate">{t.pixelate}</option><option value="solid">{t.solid}</option></select></label>
    {value.mode === "pixelate" ? <label className="tool-field">{t.blockSize}<input type="number" min="4" max="100" value={value.blockSize} onChange={e => onChange({ ...value, blockSize: Number(e.target.value) })} /></label> : <label className="tool-field tool-color">{t.color}<input type="color" value={value.color} onChange={e => onChange({ ...value, color: e.target.value })} /></label>}
    <p className="field-hint">{t.hint}</p><p className="mosaic-safety-note">{t.safety}</p>
  </div>;
}
export function MosaicEditor({ files, value, onChange, locale, disabled, format, background }: { files: PreviewFile[]; value: MosaicOptions; onChange: (v: MosaicOptions) => void; locale: Locale; disabled: boolean; format: string; background: string }) {
  const source = useSource(files, locale, disabled), { size, file, image } = source;
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ pointer: number; index: number; mode: "draw" | "move"; x: number; y: number; region: MosaicRegion } | null>(null);
  const [selected, setSelected] = useState(0);
  const index = Math.min(selected, Math.max(0, value.regions.length - 1)), region = value.regions[index];
  const t = copy[locale].mosaic, c = copy[locale].common, id = useId();
  useEffect(() => {
    if (!size || !image.current || !canvas.current) return;
    const target = canvas.current, scale = Math.min(1, 640 / size.width, 440 / size.height);
    target.width = Math.max(1, Math.round(size.width * scale)); target.height = Math.max(1, Math.round(size.height * scale));
    const ctx = target.getContext("2d"); if (!ctx) return;
    const jpeg = format === "jpeg" || (format === "original" && /\.jpe?g$/i.test(file!.file.name));
    if (jpeg) { ctx.fillStyle = background; ctx.fillRect(0, 0, target.width, target.height); }
    ctx.drawImage(image.current, 0, 0, target.width, target.height);
    if (value.regions.length) {
      const snapshot = surface(target.width, target.height); snapshot.getContext("2d")!.drawImage(target, 0, 0);
      try { drawMosaic(ctx, snapshot, target, value, surface, scale, jpeg ? background : undefined); } catch { /* Incomplete settings can be edited before running. */ }
      snapshot.width = 1; snapshot.height = 1;
    }
  }, [size, value, format, background, file, image]);
  const updateRegion = (next: MosaicRegion, at = index) => onChange({ ...value, regions: value.regions.map((r, i) => i === at ? next : r) });
  function point(e: PointerEvent<HTMLDivElement>) { const r = e.currentTarget.getBoundingClientRect(); return { x: clamp((e.clientX - r.left) / r.width * 100, 0, 99.9), y: clamp((e.clientY - r.top) / r.height * 100, 0, 99.9) }; }
  const end = (e: PointerEvent<HTMLDivElement>) => { if (drag.current?.pointer === e.pointerId) { drag.current = null; if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); } };
  return <section className="canvas-tool-preview mosaic-editor">{source.controls}
    {size && <div className="mosaic-stage" data-ready="true" style={{ aspectRatio: `${size.width}/${size.height}`, width: Math.min(640, 440 * size.width / size.height) }}
      onPointerDown={e => {
        if (disabled || drag.current || (e.pointerType === "mouse" && e.button !== 0)) return;
        const p = point(e), hit = (e.target as HTMLElement).closest<HTMLElement>("[data-region]");
        const existing = hit ? Number(hit.dataset.region) : -1;
        if (existing < 0 && value.regions.length >= MAX_MOSAIC_REGIONS) return;
        const at = existing >= 0 ? existing : value.regions.length;
        const box = existing >= 0 ? value.regions[at] : { x: p.x, y: p.y, width: 0.1, height: 0.1 };
        setSelected(at); drag.current = { pointer: e.pointerId, index: at, mode: existing >= 0 ? "move" : "draw", x: p.x, y: p.y, region: box };
        if (existing < 0) onChange({ ...value, regions: [...value.regions, box] });
        e.currentTarget.setPointerCapture(e.pointerId); e.preventDefault();
      }} onPointerMove={e => {
        const d = drag.current; if (!d || d.pointer !== e.pointerId || disabled) return;
        const p = point(e);
        const next = d.mode === "move" ? { ...d.region, x: clamp(d.region.x + p.x - d.x, 0, 100 - d.region.width), y: clamp(d.region.y + p.y - d.y, 0, 100 - d.region.height) }
          : { x: Math.min(d.x, p.x), y: Math.min(d.y, p.y), width: Math.max(0.1, Math.abs(p.x - d.x)), height: Math.max(0.1, Math.abs(p.y - d.y)) };
        updateRegion(next, d.index);
      }} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={() => { drag.current = null; }}>
      <canvas ref={canvas} role="img" aria-label={c.result} />
      {value.regions.map((r, i) => <div key={i} data-region={i} className={`mosaic-region ${i === index ? "is-selected" : ""}`} style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.width}%`, height: `${r.height}%` }} aria-hidden="true"><span>{i + 1}</span></div>)}
    </div>}
    <p className="field-hint" id={`${id}-help`}>{t.hint}</p>
    <fieldset disabled={disabled} aria-describedby={`${id}-help`} className="mosaic-region-settings">
      <div className="mosaic-region-actions"><button type="button" className="secondary-button" disabled={value.regions.length >= MAX_MOSAIC_REGIONS} onClick={() => { setSelected(value.regions.length); onChange({ ...value, regions: [...value.regions, { x: 25, y: 25, width: 25, height: 25 }] }); }}>{t.add}</button><button type="button" className="quiet-button" disabled={!value.regions.length} onClick={() => onChange({ ...value, regions: [] })}>{t.clear}</button></div>
      {!!region && <><label className="tool-field">{t.region}<select aria-label={t.region} value={index} onChange={e => setSelected(Number(e.target.value))}>{value.regions.map((_, i) => <option key={i} value={i}>{i + 1}</option>)}</select></label><div className="crop-numbers">
        {(["x", "y", "width", "height"] as const).map(key => <label className="tool-field" key={key}>{key === "width" ? t.regionWidth : key === "height" ? t.regionHeight : c[key]}<input type="number" step="0.1" min={key === "x" || key === "y" ? 0 : 0.1} max={key === "x" ? 100 - region.width : key === "y" ? 100 - region.height : key === "width" ? 100 - region.x : 100 - region.y} value={Number(region[key].toFixed(2))} onChange={e => updateRegion({ ...region, [key]: clamp(Number(e.target.value), key === "x" || key === "y" ? 0 : 0.1, key === "x" ? 100 - region.width : key === "y" ? 100 - region.height : key === "width" ? 100 - region.x : 100 - region.y) })} /></label>)}
      </div><button type="button" className="quiet-button" onClick={() => { onChange({ ...value, regions: value.regions.filter((_, i) => i !== index) }); setSelected(Math.max(0, index - 1)); }}>{t.remove}</button></>}
    </fieldset>
  </section>;
}
