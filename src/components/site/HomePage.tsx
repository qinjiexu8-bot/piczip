import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, FileArchive, Lock, ShieldCheck, UserRoundX, WalletCards } from "lucide-react";
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
    <div className="grain flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-10 sm:px-8">
        <section className="pt-7 text-center lg:pt-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-[rgba(255,253,247,0.78)] px-3 py-2 text-sm font-black text-slate-700 backdrop-blur">
              <span className="size-2.5 rounded-full bg-[var(--teal)] shadow-[0_0_0_6px_rgba(15,159,143,0.14)]" />
              {copy.eyebrow}
            </div>
            <h1 className="font-serif text-5xl font-black leading-[0.95] tracking-normal sm:text-6xl lg:text-7xl">
              {copy.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              {copy.description}
            </p>

            <div className="mx-auto mt-7 grid max-w-2xl grid-cols-3 gap-3 text-left">
              {copy.proofs.map(([value, label]) => (
                <div key={value} className="rounded-lg border border-black/10 bg-[rgba(255,253,247,0.66)] p-4">
                  <strong className="block text-2xl font-black">{value}</strong>
                  <span className="mt-1 block text-sm text-slate-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <CompressorApp locale={copy.locale} />
        </section>

        <section className="mt-7 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {copy.features.map((feature, index) => (
            <Feature
              key={feature.title}
              icon={icons[feature.icon]}
              title={feature.title}
              text={feature.text}
              active={index === 0}
            />
          ))}
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-black/10 bg-[rgba(255,253,247,0.74)] p-6">
            <h2 className="font-black">{copy.popularTitle}</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {copy.popularLinks.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black hover:border-foreground"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-black/10 bg-[rgba(255,253,247,0.74)] p-6">
            <h2 className="font-black">{copy.privacyTitle}</h2>
            <p className="mt-3 leading-7 text-slate-600">{copy.privacyText}</p>
            <Link href={copy.guideLink[1]} className="mt-4 inline-block text-sm font-black text-teal-700">
              {copy.guideLink[0]}
            </Link>
          </div>
        </section>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <Footer />
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
  active = false,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  active?: boolean;
}) {
  return (
    <article
      className={`min-h-32 rounded-xl border p-5 ${
        active
          ? "border-2 border-foreground bg-[var(--lime)] shadow-[4px_4px_0_var(--foreground)]"
          : "border-black/10 bg-[rgba(255,253,247,0.74)]"
      }`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}
