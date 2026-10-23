import type { Locale } from "@/lib/i18n/config";

export const articleCopy = {
  en: { tested: "Tested PicZip guide", by: "By ", published: "Published ", verified: "Verified ", step: "Step", note: "Testing note: the figures and screenshots on this page come from a reproducible PicZip browser test using a privacy-safe image fixture.", contact: "Found an error or a result you cannot reproduce? Contact ", copyright: "All rights reserved." },
  zh: { tested: "PicZip 实测指南", by: "作者：", published: "发布于 ", verified: "复测于 ", step: "步骤", note: "测试说明：本文数据和截图来自可重复执行的 PicZip 浏览器测试，测试图片不含个人隐私。", contact: "发现错误，或无法复现文中的结果？请联系 ", copyright: "版权所有。" },
  es: { tested: "Guía de PicZip con pruebas", by: "Por ", published: "Publicado: ", verified: "Verificado: ", step: "Paso", note: "Nota sobre las pruebas: los datos y las capturas proceden de pruebas reproducibles de PicZip en el navegador, con imágenes de ejemplo sin datos personales.", contact: "¿Has encontrado un error o no puedes reproducir un resultado? Escríbenos a ", copyright: "Todos los derechos reservados." },
  "pt-br": { tested: "Guia do PicZip com testes", by: "Por ", published: "Publicado em ", verified: "Verificado em ", step: "Etapa", note: "Nota sobre os testes: os dados e as capturas vêm de testes reproduzíveis do PicZip no navegador, com imagens de exemplo sem dados pessoais.", contact: "Encontrou um erro ou não conseguiu reproduzir um resultado? Entre em contato: ", copyright: "Todos os direitos reservados." },
  ja: { tested: "PicZip 実測ガイド", by: "著者：", published: "公開日：", verified: "検証日：", step: "手順", note: "検証について：掲載する数値とスクリーンショットは、個人情報を含まないサンプル画像を使い、ブラウザーで再現可能な PicZip のテストから得たものです。", contact: "誤りを見つけた場合や、結果を再現できない場合の連絡先：", copyright: "すべての権利を留保します。" },
} satisfies Record<Locale, Record<string, string>>;
