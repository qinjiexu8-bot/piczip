"use client";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { FlipHorizontal2, FlipVertical2, RotateCcw, RotateCw } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { cropMessages } from "@/lib/image-tools/crop-messages";
import { cropRatios, cropRectangle, defaultCrop, drawCrop, type CropOptions } from "@/lib/image-tools/crop";
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export function CropControls({ value, onChange, locale }: { value: CropOptions; onChange: (value: CropOptions) => void; locale: Locale }) {
  const t = cropMessages[locale];
  const patch = (next: Partial<CropOptions>) => onChange({ ...value, ...next });
  return <div className="crop-controls">
    <label className="tool-field">{t.ratio}<select aria-label={t.ratio} value={value.ratio} onChange={e => patch({ ratio: e.target.value as CropOptions["ratio"] })}>{cropRatios.map(ratio => <option value={ratio} key={ratio}>{ratio === "none" ? t.none : ratio === "free" ? t.free : ratio === "original" ? t.original : ratio}</option>)}</select></label>
    {value.ratio !== "none" && <div className="crop-numbers">{(["x", "y", "width", "height"] as const).map(key => <label className="tool-field" key={key}>{t[key]}<input type="number" step="0.1" min={key === "x" || key === "y" ? 0 : 1} max={key === "x" ? 100-value.width : key === "y" ? 100-value.height : key === "width" ? 100-value.x : 100-value.y} value={Number(value[key].toFixed(2))} onChange={e => {
      const n = Number(e.target.value);
      patch({ [key]: clamp(Number.isFinite(n) ? n : 0, key === "x" || key === "y" ? 0 : 1, key === "x" ? 100-value.width : key === "y" ? 100-value.height : key === "width" ? 100-value.x : 100-value.y) });
    }} /></label>)}</div>}
    <div className="crop-transform-buttons"><button type="button" className="secondary-button" onClick={() => patch({ rotation: ((value.rotation+270)%360) as CropOptions["rotation"] })}><RotateCcw size={16} />{t.left}</button><button type="button" className="secondary-button" onClick={() => patch({ rotation: ((value.rotation+90)%360) as CropOptions["rotation"] })}><RotateCw size={16} />{t.right}</button><button type="button" className="secondary-button" aria-pressed={value.flipX} onClick={() => patch({ flipX: !value.flipX })}><FlipHorizontal2 size={16} />{t.flipX}</button><button type="button" className="secondary-button" aria-pressed={value.flipY} onClick={() => patch({ flipY: !value.flipY })}><FlipVertical2 size={16} />{t.flipY}</button></div>
    <div className="crop-reset"><span>{t.rotation}: {value.rotation}°</span><button type="button" className="quiet-button" onClick={() => onChange({ ...defaultCrop })}>{t.reset}</button></div>
    <p className="crop-batch-hint">{t.batch}</p>
  </div>;
}

type PreviewFile = { id: string; url: string; file: File };
export function CropEditor({ files, value, onChange, locale, disabled, format, background }: { files: PreviewFile[]; value: CropOptions; onChange: (value: CropOptions) => void; locale: Locale; disabled: boolean; format: string; background: string }) {
  const t = cropMessages[locale];
  const id = useId();
  const [chosen, setChosen] = useState("");
  const file = files.find(file => file.id === chosen) ?? files[0];
  const [loaded, setLoaded] = useState<{ src: string; width: number; height: number } | null>(null);
  const [failed, setFailed] = useState("");
  const image = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ pointer: number; mode: "draw" | "move" | "resize"; startX: number; startY: number; box: { x:number; y:number; width:number; height:number } } | null>(null);
  const size = loaded?.src === file?.url ? loaded : null;
  const rect = size ? cropRectangle(size, value) : null;
  const box = size && rect ? { x:Math.min(99,rect.x/size.width*100), y:Math.min(99,rect.y/size.height*100), width:Math.max(1,rect.width/size.width*100), height:Math.max(1,rect.height/size.height*100) } : null;
  const out = rect ? value.rotation % 180 ? { width:rect.height, height:rect.width } : rect : null;
  const overLimit = !!out && (out.width>8192 || out.height>8192 || out.width*out.height>16000000);
  useEffect(() => {
    if (!size || !image.current || !canvas.current) return;
    const r = cropRectangle(size, value);
    const output = value.rotation%180 ? {width:r.height,height:r.width} : r;
    const scale = Math.min(1,360/output.width,240/output.height);
    const target = canvas.current; target.width = Math.max(1,Math.round(output.width*scale)); target.height = Math.max(1,Math.round(output.height*scale));
    const ctx = target.getContext("2d"); if (!ctx) return;
    if (format === "jpeg" || (format === "original" && /\.jpe?g$/i.test(file.file.name))) { ctx.fillStyle=background; ctx.fillRect(0,0,target.width,target.height); }
    ctx.scale(target.width/output.width,target.height/output.height);
    drawCrop(ctx,image.current,size,value);
  }, [size, value, format, background, file?.file.name]);
  if (!file) return <p className="crop-empty">{t.empty}</p>;
  function point(e: PointerEvent<HTMLDivElement>) { const r=e.currentTarget.getBoundingClientRect(); return { x:clamp((e.clientX-r.left)/r.width*100,0,100), y:clamp((e.clientY-r.top)/r.height*100,0,100) }; }
  return <section className="crop-editor">
    <label className="tool-field" htmlFor={`${id}-image`}>{t.preview}<select id={`${id}-image`} value={file.id} disabled={disabled} onChange={e=>setChosen(e.target.value)}>{files.map(f=><option key={f.id} value={f.id}>{f.file.name}</option>)}</select></label>
    <div className="crop-stage-wrap"><div className="crop-stage" data-ready={!!size} style={{ width:size ? Math.min(640,360*size.width/size.height) : 400, aspectRatio:size ? `${size.width}/${size.height}` : "4/3" }}
      onPointerDown={e=>{
        if (disabled || !box || (e.pointerType === "mouse" && e.button !== 0) || drag.current) return;
        const p=point(e); const target=e.target as HTMLElement;
        const mode=target.dataset.corner ? "resize" : target.closest(".crop-selection") && value.ratio!=="none" ? "move" : "draw";
        drag.current={pointer:e.pointerId,mode,startX:p.x,startY:p.y,box}; e.currentTarget.setPointerCapture(e.pointerId); e.preventDefault();
      }} onPointerMove={e=>{
        const d=drag.current; if (!d || d.pointer!==e.pointerId || disabled) return;
        const p=point(e); let next=d.box;
        if(d.mode==="move") next={...d.box,x:clamp(d.box.x+p.x-d.startX,0,100-d.box.width),y:clamp(d.box.y+p.y-d.startY,0,100-d.box.height)};
        if(d.mode==="resize") next={...d.box,width:clamp(d.box.width+p.x-d.startX,1,100-d.box.x),height:clamp(d.box.height+p.y-d.startY,1,100-d.box.y)};
        if(d.mode==="draw") { const x=clamp(Math.min(d.startX,p.x),0,99),y=clamp(Math.min(d.startY,p.y),0,99); next={x,y,width:clamp(Math.abs(p.x-d.startX),1,100-x),height:clamp(Math.abs(p.y-d.startY),1,100-y)}; }
        onChange({...value,...next,ratio:value.ratio==="none"?"free":value.ratio});
      }} onPointerUp={e=>{if(drag.current?.pointer===e.pointerId){drag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}}>
      {/* User-selected local Blob previews cannot use the Next image optimizer. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={file.url} ref={image} src={file.url} alt={file.file.name} draggable={false} onLoad={e=>{const img=e.currentTarget;if(img.naturalWidth*img.naturalHeight>40000000){setFailed(file.url);return;}setLoaded({src:file.url,width:img.naturalWidth,height:img.naturalHeight});}} onError={()=>setFailed(file.url)} />
      {box && <div className={`crop-selection ${value.ratio==="none"?"is-full":""}`} style={{left:`${box.x}%`,top:`${box.y}%`,width:`${box.width}%`,height:`${box.height}%`}} tabIndex={disabled?-1:0} role="group" aria-label={t.selection} aria-describedby={`${id}-hint`} onKeyDown={e=>{if(disabled||!box)return;const moves:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};const delta=moves[e.key];if(!delta)return;e.preventDefault();const step=e.shiftKey?5:1;onChange({...value,...box,ratio:value.ratio==="none"?"free":value.ratio,x:clamp(box.x+delta[0]*step,0,100-box.width),y:clamp(box.y+delta[1]*step,0,100-box.height)});}}><span className="crop-thirds" aria-hidden="true" />{value.ratio!=="none"&&<span data-corner="true" className="crop-corner" title={t.corner} aria-hidden="true" />}</div>}
    </div></div>
    {!size && <p role="status">{failed===file.url?t.failed:t.loading}</p>}
    <p id={`${id}-hint`} className="crop-help">{t.hint}</p>
    {size && <div className="crop-result-preview"><div><strong>{t.result}</strong><span>{t.size}: {out?.width} × {out?.height} px</span></div><canvas ref={canvas} role="img" aria-label={t.result} />{overLimit&&<p role="status">{t.limit}</p>}</div>}
  </section>;
}
