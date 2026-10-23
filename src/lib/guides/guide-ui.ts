import type { AddedLocale } from "@/lib/i18n/config";

export const guideUi = {
  es: {
    title: "Guías para trabajar con imágenes",
    description: "Elige una tarea y sigue instrucciones prácticas, resultados medidos y respuestas a las dudas más frecuentes.",
    tools: "Dimensiones, formatos y composición", compression: "Compresión y tamaño del archivo",
    contents: "En esta guía", steps: "Paso a paso", faq: "Preguntas frecuentes", related: "Guías relacionadas",
    openTool: "Abrir la herramienta", allGuides: "Ver todas las guías", readingTime: "{minutes} min de lectura",
    screenshot: "Captura original de la prueba, con la interfaz en inglés.", fullImage: "Ver captura completa (se abre en otra pestaña)",
  },
  "pt-br": {
    title: "Guias para trabalhar com imagens",
    description: "Escolha uma tarefa e siga instruções práticas, resultados medidos e respostas às dúvidas mais comuns.",
    tools: "Dimensões, formatos e composição", compression: "Compressão e tamanho do arquivo",
    contents: "Neste guia", steps: "Passo a passo", faq: "Perguntas frequentes", related: "Guias relacionados",
    openTool: "Abrir a ferramenta", allGuides: "Ver todos os guias", readingTime: "{minutes} min de leitura",
    screenshot: "Captura original do teste, com a interface em inglês.", fullImage: "Ver captura completa (abre em outra aba)",
  },
  ja: {
    title: "画像編集ガイド",
    description: "目的に合ったガイドを選び、操作手順、実測結果、よくある質問を確認できます。",
    tools: "サイズ・形式・画像の連結", compression: "圧縮とファイル容量",
    contents: "この記事の内容", steps: "操作手順", faq: "よくある質問", related: "関連記事",
    openTool: "ツールを開く", allGuides: "すべてのガイドを見る", readingTime: "約 {minutes} 分で読めます",
    screenshot: "検証時の元のスクリーンショットです。画面は英語版です。", fullImage: "スクリーンショットを拡大（別タブで開きます）",
  },
} satisfies Record<AddedLocale, Record<string, string>>;
