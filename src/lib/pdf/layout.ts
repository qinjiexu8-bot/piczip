export type Paper = 'auto' | 'a4' | 'letter';
export type Orientation = 'portrait' | 'landscape';
export type PdfLayout = { width: number; height: number; x: number; y: number; imageWidth: number; imageHeight: number };
const papers = { a4: [595.28, 841.89], letter: [612, 792] } as const;
export function pdfLayout(image: { width: number; height: number }, paper: Paper, orientation: Orientation, marginMm: number): PdfLayout {
  if (!Number.isFinite(image.width) || !Number.isFinite(image.height) || image.width < 1 || image.height < 1 || image.width * image.height > 40_000_000 || !Number.isFinite(marginMm) || marginMm < 0 || marginMm > 50 || !['auto','a4','letter'].includes(paper) || !['portrait','landscape'].includes(orientation)) throw new Error('invalid-pdf');
  const margin = marginMm * 72 / 25.4;
  const box = paper === 'auto' ? [image.width * 72 / 96 + margin * 2, image.height * 72 / 96 + margin * 2] : [...papers[paper]];
  const width = paper === 'auto' ? box[0] : orientation === 'portrait' ? box[0] : box[1];
  const height = paper === 'auto' ? box[1] : orientation === 'portrait' ? box[1] : box[0];
  if (width <= margin * 2 || height <= margin * 2 || width > 14400 || height > 14400) throw new Error('invalid-pdf');
  const scale = Math.min((width - margin * 2) / image.width, (height - margin * 2) / image.height);
  const imageWidth = image.width * scale, imageHeight = image.height * scale;
  return { width, height, x: (width - imageWidth) / 2, y: (height - imageHeight) / 2, imageWidth, imageHeight };
}
