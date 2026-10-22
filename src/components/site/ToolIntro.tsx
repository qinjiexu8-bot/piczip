import { Check, Lock } from "lucide-react";

type ToolIntroProps = {
  title: string;
  description: string;
  locale: "en" | "zh";
  benefits: string[];
};

/** One compact introduction shared by every image-processing page. */
export function ToolIntro({ title, description, locale, benefits }: ToolIntroProps) {
  return (
    <section className="tool-intro">
      <div className="tool-intro-copy">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="tool-intro-details">
        <span className="tool-intro-privacy">
          <Lock size={12} aria-hidden="true" />
          {locale === "zh" ? "图片留在本地" : "Files stay on your device"}
        </span>
        <ul>
          {benefits.map(benefit => (
            <li key={benefit}><Check size={11} aria-hidden="true" /><span>{benefit}</span></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
