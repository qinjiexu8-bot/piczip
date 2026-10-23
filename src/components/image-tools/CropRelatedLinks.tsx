import { cropGuides, cropGuidePath } from "@/lib/guides/crop-guide";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/routes";

const copy: Record<Locale, [string, string, string, string]> = {
  en: ["Need to adjust the framing or orientation?", "Crop, rotate and flip images", "After cropping, prepare your images for sharing.", "Read the image resizing guide"],
  zh: ["需要调整画面范围或方向？", "裁剪、旋转和翻转图片", "裁剪完成后，继续调整尺寸，让图片更适合分享。", "查看图片尺寸调整指南"],
  es: ["¿Necesitas ajustar el encuadre o la orientación?", "Recortar, girar y voltear imágenes", "Después de recortar, prepara tus imágenes para compartirlas.", "Leer la guía para cambiar el tamaño de imágenes"],
  "pt-br": ["Precisa ajustar o enquadramento ou a orientação?", "Recortar, girar e espelhar imagens", "Depois de recortar, prepare suas imagens para compartilhar.", "Leia o guia de redimensionamento de imagens"],
  ja: ["構図や向きを調整したいですか？", "画像をトリミング・回転・反転する", "トリミング後は、共有先に合わせて画像サイズを調整できます。", "画像サイズ変更ガイドを読む"],
};

export function CropRelatedLinks({ locale, fromTool = false }: { locale: Locale; fromTool?: boolean }) {
  const t = copy[locale];
  return <aside className="my-6 rounded-xl border border-teal-800/15 bg-white px-5 py-4 text-sm leading-7">
    {fromTool && <p><Link className="font-medium text-teal-700 underline underline-offset-4" href={localePath(cropGuidePath, locale)}>{cropGuides[locale].title} →</Link></p>}
    <p className="text-slate-600">{t[fromTool ? 2 : 0]}</p>
    <Link className="font-medium text-teal-700 underline decoration-teal-700/30 underline-offset-4 hover:decoration-teal-700" href={localePath(fromTool ? "/guides/resize-images-by-pixels-or-percentage" : "/crop-image", locale)}>{t[fromTool ? 3 : 1]} →</Link>
  </aside>;
}
