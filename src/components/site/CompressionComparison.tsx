"use client";

import { siteMessages } from "@/lib/i18n/messages";
import { interpolate, type Locale } from "@/lib/i18n/config";
import Image from "next/image";
import { ChevronsLeftRight } from "lucide-react";
import { useState, type CSSProperties, type PointerEvent } from "react";
import sample from "../../../public/images/comparison/metadata.json";

export function CompressionComparison({ locale }: { locale: Locale }) {
  const t = siteMessages[locale].comparison;
  const [position, setPosition] = useState(50);
  const [pointerFocus, setPointerFocus] = useState(false);
  const savings = Math.round((1 - sample.compressedBytes / sample.originalBytes) * 100);
  const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

  function move(event: PointerEvent<HTMLInputElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPosition(Math.round(Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100))));
  }

  return (
    <section className="home-comparison" aria-labelledby="comparison-heading">
      <div className="comparison-copy">
        <span className="home-section-eyebrow">{t.eyebrow}</span>
        <h2 id="comparison-heading">{t.title}</h2>
        <p>{t.description}</p>
        <div className="comparison-saving"><strong>−{savings}%</strong><span>{t.saved}</span></div>
        <p className="comparison-note">{interpolate(t.note, sample)}</p>
      </div>
      <figure className="comparison-figure">
        <div className="comparison-labels" aria-hidden="true">
          <span>{t.original}<strong>JPG · {kb(sample.originalBytes)}</strong></span>
          <span>{t.compressed}<strong>WebP · {kb(sample.compressedBytes)}</strong></span>
        </div>
        <div className="comparison-image" style={{ "--comparison-position": `${position}%` } as CSSProperties}>
          <Image className="comparison-photo" src="/images/comparison/coast-compressed.webp" alt="" width={sample.width} height={sample.height} unoptimized draggable={false} />
          <Image className="comparison-photo comparison-original" src="/images/comparison/coast-original.jpg" alt={t.alt} width={sample.width} height={sample.height} unoptimized draggable={false} />
          <div className="comparison-divider" aria-hidden="true" />
          <span className="comparison-handle" aria-hidden="true"><ChevronsLeftRight size={22} /></span>
          <input type="range" tabIndex={0} min={0} max={100} step={1} value={position}
            aria-label={t.label}
            aria-valuetext={interpolate(t.value, { position })}
            aria-describedby="comparison-caption"
            data-pointer-focus={pointerFocus}
            onKeyDown={() => setPointerFocus(false)}
            onBlur={() => setPointerFocus(false)}
            onChange={event => setPosition(Number(event.target.value))}
            onPointerDown={event => {
              if (!event.isPrimary || event.button !== 0) return;
              setPointerFocus(true);
              event.preventDefault();
              event.currentTarget.focus({ preventScroll: true });
              event.currentTarget.setPointerCapture(event.pointerId);
              move(event);
            }}
            onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event); }}
            onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
          />
        </div>
        <figcaption id="comparison-caption">{interpolate(t.caption, { before: kb(sample.originalBytes), after: kb(sample.compressedBytes) })}</figcaption>
      </figure>
    </section>
  );
}
