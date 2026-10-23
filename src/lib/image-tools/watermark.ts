export type WatermarkOptions = { kind: "text" | "logo"; text: string; logo: string; position: number; size: number; opacity: number; margin: number; color: string };
export const defaultWatermark: WatermarkOptions = { kind: "text", text: "© PicZip", logo: "", position: 8, size: 8, opacity: 60, margin: 4, color: "#ffffff" };
export function validWatermark(value: unknown): value is WatermarkOptions {
  if (!value || typeof value !== "object") return false;
  const v=value as WatermarkOptions;
  return ["text","logo"].includes(v.kind) && typeof v.text === "string" && v.text.length <= 100 && (v.kind !== "text" || !!v.text.trim()) && typeof v.logo === "string" && v.logo.length <= 1500000 && (!v.logo || /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(v.logo)) && (v.kind !== "logo" || !!v.logo) && Number.isInteger(v.position) && v.position >= 0 && v.position <= 8 && Number.isFinite(v.size) && v.size >= 2 && v.size <= 50 && Number.isFinite(v.opacity) && v.opacity >= 1 && v.opacity <= 100 && Number.isFinite(v.margin) && v.margin >= 0 && v.margin <= 20 && /^#[a-f0-9]{6}$/i.test(v.color);
}
export function drawWatermark(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, width: number, height: number, v: WatermarkOptions, logo?: CanvasImageSource & { width: number; height: number }) {
  if (!validWatermark(v) || (v.kind === "logo" && !logo)) throw new Error("invalid-watermark");
  ctx.save();
  const short = Math.min(width,height), margin = short*v.margin/100;
  const maxW=width-2*margin,maxH=height-2*margin;
  let w:number,h:number;
  if (v.kind === "text") {
    let size=short*v.size/100;
    ctx.font=`600 ${size}px sans-serif`;
    const measure=ctx.measureText(v.text);const ratio=Math.min(1,maxW/Math.max(1,measure.width),maxH/(size*1.4));size*=ratio;
    ctx.font=`600 ${size}px sans-serif`;w=ctx.measureText(v.text).width;h=size*1.4;
  } else { w=short*v.size/100;h=w*logo!.height/logo!.width;const scale=Math.min(1,maxW/w,maxH/h);w*=scale;h*=scale; }
  const column=v.position%3,row=Math.floor(v.position/3);
  const x=column===0?margin:column===1?(width-w)/2:width-margin-w;
  const y=row===0?margin:row===1?(height-h)/2:height-margin-h;
  ctx.globalAlpha=v.opacity/100;
  if(v.kind === "logo") ctx.drawImage(logo!,x,y,w,h);
  else {ctx.fillStyle=v.color;ctx.textAlign="left";ctx.textBaseline="middle";ctx.fillText(v.text,x,y+h/2);}
  ctx.restore();
}
