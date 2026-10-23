"use client";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { drawWatermark, validWatermark, type WatermarkOptions } from "@/lib/image-tools/watermark";
import { watermarkMessages } from "@/lib/image-tools/watermark-messages";
export function WatermarkControls({locale,value,onChange,onLoadingChange}:{locale:Locale;value:WatermarkOptions;onChange:(v:WatermarkOptions)=>void;onLoadingChange:(busy:boolean)=>void}) {
 const t=watermarkMessages[locale];const [error,setError]=useState("");const [loading,setLoading]=useState(false);const generation=useRef(0);
 useEffect(()=>()=>{generation.current++},[]);
 const patch=(v:Partial<WatermarkOptions>)=>onChange({...value,...v});
 async function loadLogo(file?:File){
  if(!file)return;const token=++generation.current;setLoading(true);onLoadingChange(true);setError("");
  let bitmap:ImageBitmap|undefined;
  try {
   if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>5*1024*1024)throw new Error();
   bitmap=await createImageBitmap(file);if(bitmap.width*bitmap.height>16000000)throw new Error();
   const scale=Math.min(1,1024/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext("2d")!.drawImage(bitmap,0,0,canvas.width,canvas.height);
   const logo=canvas.toDataURL("image/png");if(logo.length>1500000)throw new Error();if(token===generation.current)patch({logo});
  }catch{if(token===generation.current)setError(t.invalid)}finally{bitmap?.close();if(token===generation.current){setLoading(false);onLoadingChange(false)}}
 }
 return <div className="watermark-controls"><label className="tool-field">{t.kind}<select aria-label={t.kind} value={value.kind} onChange={e=>{generation.current++;setLoading(false);patch({kind:e.target.value as WatermarkOptions["kind"]})}}><option value="text">{t.text}</option><option value="logo">{t.logo}</option></select></label>
 {value.kind==="text"?<><label className="tool-field">{t.content}<input type="text" maxLength={100} value={value.text} onChange={e=>patch({text:e.target.value})}/></label><label className="tool-field tool-color">{t.color}<input type="color" value={value.color} onChange={e=>patch({color:e.target.value})}/></label></>:<><label className="tool-field">{t.choose}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={loading} onChange={e=>{void loadLogo(e.target.files?.[0]);e.target.value=""}}/></label><p className="field-hint">{t.logoHint}</p></>}
 <label className="tool-field">{t.position}<select aria-label={t.position} value={value.position} onChange={e=>patch({position:Number(e.target.value)})}>{t.positions.map((label,i)=><option key={label} value={i}>{label}</option>)}</select></label>
 {(["size","opacity","margin"] as const).map(key=><label key={key} className="tool-field">{t[key]}<span className="quality-field"><input aria-label={t[key]} type="range" min={key==="margin"?0:key==="size"?2:1} max={key==="margin"?20:key==="size"?50:100} value={value[key]} onChange={e=>patch({[key]:Number(e.target.value)})}/><output>{value[key]}%</output></span></label>)}
 {error&&<p role="alert" className="workflow-error">{error}</p>}
 </div>;
}
export function WatermarkPreview({files,value,locale,background,format}:{files:{id:string;file:File;url:string}[];value:WatermarkOptions;locale:Locale;background:string;format:string}){
 const t=watermarkMessages[locale];const [selected,setSelected]=useState("");const [error,setError]=useState(false);const canvas=useRef<HTMLCanvasElement>(null);const item=files.find(f=>f.id===selected)??files[0];
 useEffect(()=>{
  let active=true;let image:ImageBitmap|undefined,logo:ImageBitmap|undefined;
  const context=canvas.current?.getContext("2d");context?.clearRect(0,0,640,400);
  async function render(){
   try{
    if(!item)return;image=await createImageBitmap(item.file);if(image.width*image.height>40000000)throw new Error();
    if(value.kind==="logo"&&value.logo)logo=await createImageBitmap(await(await fetch(value.logo)).blob());
    if(!active||!canvas.current)return;const scale=Math.min(1,640/image.width,400/image.height);const c=canvas.current;c.width=Math.round(image.width*scale);c.height=Math.round(image.height*scale);const x=c.getContext("2d")!;x.scale(scale,scale);
    if(format==="jpeg"||(format==="original"&&/jpe?g$/i.test(item.file.name))){x.fillStyle=background;x.fillRect(0,0,image.width,image.height)}
    x.drawImage(image,0,0);if(validWatermark(value))drawWatermark(x,image.width,image.height,value,logo);setError(!validWatermark(value));
   }catch{if(active)setError(true)}finally{image?.close();logo?.close()}
  }
  void render();return()=>{active=false};
 },[item,value,background,format]);
 return <section className="watermark-preview"><h3 className="settings-title">{t.preview}</h3><p className="field-hint">{t.previewHint}</p>{files.length>0&&<><select aria-label={t.preview} value={item?.id??""} onChange={e=>setSelected(e.target.value)}>{files.map(f=><option key={f.id} value={f.id}>{f.file.name}</option>)}</select><canvas ref={canvas} aria-label={t.preview}/>{error&&<p role="status" className="workflow-error">{t.invalid}</p>}</>}</section>;
}
