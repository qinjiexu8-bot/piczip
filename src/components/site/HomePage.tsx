import { ToolIntro } from "@/components/site/ToolIntro";
import { ToolLinks } from "@/components/image-tools/ToolLinks";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { CompressorApp } from "@/components/compressor/CompressorApp";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

type HomePageCopy = {
  locale: "en" | "zh";
  title: string;
  description: string;
  popularTitle: string;
  popularLinks: Array<[string, string]>;
  helpTitle: string;
  helpText: string;
  guideLink: [string, string];
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
        />

        <CompressorApp locale={copy.locale} />

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
            <h2 className="flex items-center gap-2"><BookOpen size={16} />{copy.helpTitle}</h2>
            <p>{copy.helpText}</p>
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
