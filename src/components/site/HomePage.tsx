import { ToolIntro } from "@/components/site/ToolIntro";
import { ToolLinks } from "@/components/image-tools/ToolLinks";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, FileArchive, Lock, ShieldCheck, UserRoundX, WalletCards } from "lucide-react";
import { CompressorApp } from "@/components/compressor/CompressorApp";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

type HomePageCopy = {
  locale: "en" | "zh";
  eyebrow: string;
  title: string;
  description: string;
  proofs: Array<[string, string]>;
  features: Array<{
    icon: "local" | "free" | "signup" | "size" | "zip" | "upload";
    title: string;
    text: string;
  }>;
  popularTitle: string;
  popularLinks: Array<[string, string]>;
  privacyTitle: string;
  privacyText: string;
  guideLink: [string, string];
};

const icons = {
  local: <ShieldCheck className="size-5" />,
  free: <WalletCards className="size-5" />,
  signup: <UserRoundX className="size-5" />,
  size: <CheckCircle2 className="size-5" />,
  zip: <FileArchive className="size-5" />,
  upload: <Lock className="size-5" />,
};

export function HomePage({ copy }: { copy: HomePageCopy }) {
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PicZip",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    inLanguage: copy.locale === "zh" ? "zh-CN" : "en",
    url: copy.locale === "zh" ? "https://piczip.app/zh" : "https://piczip.app/",
    description: copy.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="grain flex min-h-screen flex-col overflow-x-clip">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-7 sm:px-8">
        <ToolIntro
          title={copy.title}
          description={copy.description}
          locale={copy.locale}
          benefits={copy.locale === "zh" ? ["无需注册", "一次最多 50 张"] : ["No sign-up needed", "Up to 50 images at once"]}
        />

        <CompressorApp locale={copy.locale} />

        <section className="benefit-grid" aria-label={copy.locale === "zh" ? "为什么选择 PicZip" : "Why PicZip"}>
          {copy.features.filter(feature => ["local", "free", "zip"].includes(feature.icon)).map(feature => (
            <Feature key={feature.title} icon={icons[feature.icon]} title={feature.title} text={feature.text} />
          ))}
        </section>

        <ToolLinks locale={copy.locale} />

        <section className="home-support">
          <div>
            <h2>{copy.popularTitle}</h2>
            <div className="task-links">
              {copy.popularLinks.map(([label, href]) => (
                <Link key={href} href={href} prefetch={false}>{label}<ArrowUpRight size={11} /></Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="flex items-center gap-2"><ShieldCheck size={16} />{copy.privacyTitle}</h2>
            <p>{copy.privacyText}</p>
            <Link href={copy.guideLink[1]} className="mt-3 inline-flex min-h-8 items-center gap-1.5 text-xs font-medium text-teal-700">
              {copy.guideLink[0]}<ArrowUpRight size={13} />
            </Link>
          </div>
        </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <Footer />
    </div>
  );
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="benefit">
      <span className="benefit-icon">{icon}</span>
      <div><h3>{title}</h3><p>{text}</p></div>
    </article>
  );
}
