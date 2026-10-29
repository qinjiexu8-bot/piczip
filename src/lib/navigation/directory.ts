import { ArrowRightLeft, Crop, Minimize2, PanelsTopLeft, Scaling, Stamp } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { siteMessages } from "@/lib/i18n/messages";
import { cropMessages } from "@/lib/image-tools/crop-messages";
import { watermarkMessages } from "@/lib/image-tools/watermark-messages";

export const toolGroups = ["optimize", "edit", "protect"] as const;
export type ToolGroup = typeof toolGroups[number];

export const directoryCopy = {
  en: {
    all: "All tools", title: "A tool for every image task", description: "Compress, resize, convert, crop, stitch or watermark. Pick a tool, then send your results to the next step.",
    browse: "Explore all tools", guide: "How to use", resources: "Help & guides", count: "6 tools. One connected workflow.",
    groups: { optimize: "Optimize & convert", edit: "Edit & arrange", protect: "Watermark & privacy" },
    groupDescriptions: { optimize: "The right size and format.", edit: "Make every image fit.", protect: "Make your work your own." },
    descriptions: ["Reduce file size with quality and KB targets.", "Set pixel dimensions or scale by percentage.", "Convert between JPG, PNG and WebP.", "Reframe, rotate and flip your images.", "Join images horizontally or vertically.", "Add text or a logo to a batch of images."],
    helpTitle: "Not sure where to start?", helpText: "Follow a guide or find an answer in the FAQ. Your results can move between tools without downloading them first.",
  },
  zh: {
    all: "全部工具", title: "每一步，都有合适的工具", description: "压缩、调整尺寸、转换格式、裁剪、拼接或添加水印。选一个工具开始，完成后还可以继续下一步。",
    browse: "查看全部工具", guide: "使用方法", resources: "帮助与指南", count: "6 个工具，串起日常图片工作。",
    groups: { optimize: "优化与转换", edit: "编辑与排版", protect: "水印与隐私" },
    groupDescriptions: { optimize: "合适的体积，合适的格式。", edit: "让构图与尺寸恰到好处。", protect: "为作品留下你的标记。" },
    descriptions: ["调整画质或指定 KB，减小图片体积。", "按像素或百分比调整图片尺寸。", "在 JPG、PNG 和 WebP 之间转换。", "裁剪画面、旋转方向或镜像翻转。", "横向或纵向拼接，自定义间隔。", "为整批图片添加文字或 Logo 水印。"],
    helpTitle: "不知道从哪一步开始？", helpText: "看看使用指南，或在常见问题中寻找答案。完成的图片可以直接交给下一个工具，无需先下载。",
  },
  es: {
    all: "Todas las herramientas", title: "Una herramienta para cada tarea", description: "Comprime, redimensiona, convierte, recorta, une o añade marcas de agua. Elige una herramienta y continúa con tus resultados en el siguiente paso.",
    browse: "Ver todas las herramientas", guide: "Cómo usar", resources: "Ayuda y guías", count: "6 herramientas. Un flujo conectado.",
    groups: { optimize: "Optimizar y convertir", edit: "Editar y organizar", protect: "Marca de agua y privacidad" },
    groupDescriptions: { optimize: "El tamaño y el formato adecuados.", edit: "Haz que cada imagen encaje.", protect: "Deja tu marca en tus imágenes." },
    descriptions: ["Reduce el peso con ajustes de calidad o un objetivo en KB.", "Define píxeles o cambia el tamaño por porcentaje.", "Convierte entre JPG, PNG y WebP.", "Recorta, gira y voltea tus imágenes.", "Une imágenes en horizontal o vertical.", "Añade texto o un logotipo a un lote de imágenes."],
    helpTitle: "¿No sabes por dónde empezar?", helpText: "Consulta las guías o las preguntas frecuentes. Envía los resultados a otra herramienta sin descargarlos primero.",
  },
  "pt-br": {
    all: "Todas as ferramentas", title: "Uma ferramenta para cada tarefa", description: "Comprima, redimensione, converta, recorte, junte ou adicione marcas-d’água. Escolha uma ferramenta e leve os resultados para a próxima etapa.",
    browse: "Ver todas as ferramentas", guide: "Como usar", resources: "Ajuda e guias", count: "6 ferramentas. Um fluxo conectado.",
    groups: { optimize: "Otimizar e converter", edit: "Editar e organizar", protect: "Marca-d’água e privacidade" },
    groupDescriptions: { optimize: "O tamanho e o formato certos.", edit: "Faça cada imagem se encaixar.", protect: "Deixe sua marca nas imagens." },
    descriptions: ["Reduza o peso com qualidade ou um tamanho em KB.", "Defina pixels ou redimensione por porcentagem.", "Converta entre JPG, PNG e WebP.", "Recorte, gire e espelhe suas imagens.", "Junte imagens na horizontal ou vertical.", "Adicione texto ou logotipo a um lote de imagens."],
    helpTitle: "Não sabe por onde começar?", helpText: "Consulte os guias ou as perguntas frequentes. Envie os resultados para outra ferramenta sem precisar baixar antes.",
  },
  ja: {
    all: "すべてのツール", title: "画像作業に、ちょうどいいツール", description: "圧縮、サイズ変更、形式変換、切り抜き、結合、透かし。ツールを選んで、処理した画像を次のステップへ渡せます。",
    browse: "すべてのツールを見る", guide: "使い方", resources: "ヘルプとガイド", count: "6つのツールで、作業がつながる。",
    groups: { optimize: "最適化・形式変換", edit: "編集・レイアウト", protect: "透かし・プライバシー" },
    groupDescriptions: { optimize: "使いやすいサイズと形式に。", edit: "構図も寸法も、思いどおりに。", protect: "作品に自分の印を。" },
    descriptions: ["画質や目標KB数を指定して容量を削減。", "ピクセル数や割合でサイズを変更。", "JPG・PNG・WebPを相互に変換。", "切り抜き、回転、反転で構図を調整。", "間隔を指定して画像を縦や横に結合。", "複数の画像に文字やロゴの透かしを追加。"],
    helpTitle: "どこから始めればいい？", helpText: "使い方ガイドやよくある質問をご覧ください。処理した画像は、ダウンロードせずに次のツールへ送れます。",
  },
} satisfies Record<Locale, unknown>;

/** One catalog drives the navigation and directory; all entries are live tools. */
export function directoryTools(locale: Locale) {
  const t = siteMessages[locale].common;
  const descriptions = directoryCopy[locale].descriptions;
  return [
    { id: "compress", path: "/", label: t.compress, icon: Minimize2, group: "optimize", guide: "/guide" },
    { id: "resize", path: "/resize-image", label: t.resize, icon: Scaling, group: "edit", guide: "/guides/resize-images-by-pixels-or-percentage" },
    { id: "convert", path: "/convert-image", label: t.convert, icon: ArrowRightLeft, group: "optimize", guide: "/guides/convert-jpg-png-webp" },
    { id: "crop", path: "/crop-image", label: cropMessages[locale].nav, icon: Crop, group: "edit", guide: "/guides/crop-rotate-flip-images" },
    { id: "stitch", path: "/stitch-images", label: t.stitch, icon: PanelsTopLeft, group: "edit", guide: "/guides/stitch-images-horizontally-vertically" },
    { id: "watermark", path: "/watermark-image", label: watermarkMessages[locale].nav, icon: Stamp, group: "protect", guide: "/guides/batch-watermark-and-rename-images" },
  ].map((tool, index) => ({ ...tool, group: tool.group as ToolGroup, description: descriptions[index] }));
}

export function isToolActive(pathname: string, path: string) {
  return path === "/"
    ? pathname === "/" || pathname.startsWith("/compress") || ["/local-image-compressor", "/batch-image-compressor"].includes(pathname)
    : pathname === path;
}
