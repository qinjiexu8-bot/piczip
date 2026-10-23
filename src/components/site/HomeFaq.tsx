import { faqMessages, siteMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/routes";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";

export function HomeFaq({ locale }: { locale: Locale }) {
  const t = siteMessages[locale].common;
  return (
    <section className="home-faq" aria-labelledby="home-faq-heading">
      <div className="home-faq-intro">
        <span className="home-section-eyebrow">{t.tips}</span>
        <h2 id="home-faq-heading">{t.faq}</h2>
        <Link href={localePath("/faq", locale)}>{t.allQuestions}<ArrowUpRight size={14} /></Link>
      </div>
      <div className="home-faq-list">
        {faqMessages[locale].slice(0, 6).map(([question, answer]) => (
          <details key={question}>
            <summary>{question}<Plus size={18} aria-hidden="true" /></summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
