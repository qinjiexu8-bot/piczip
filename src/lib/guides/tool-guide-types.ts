import type { ToolKind } from "@/lib/image-tools/types";
export type GuideLocale = "en" | "zh";
export type ToolGuide = {
  tool: ToolKind;
  slug: string;
  title: string;
  description: string;
  label: string;
  readingTime: string;
  summary: string;
  steps: string[];
  example: {
    title: string;
    intro: string;
    headers: string[];
    rows: string[][];
    caption: string;
    note: string;
  };
  sections: { id: string; title: string; paragraphs: string[] }[];
  faqs: { question: string; answer: string }[];
  cta: string;
};
