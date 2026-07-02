import type { ReactNode } from "react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

type ContentPageProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ContentPage({ title, description, children }: ContentPageProps) {
  return (
    <div className="grain flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 pb-10 sm:px-8">
        <article className="rounded-2xl border border-black/10 bg-[rgba(255,253,247,0.82)] p-6 shadow-sm sm:p-9">
          <h1 className="font-serif text-5xl font-black leading-none tracking-normal">{title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">{description}</p>
          <div className="prose-p:leading-8 prose-p:text-slate-600 prose-h2:mt-8 prose-h2:text-2xl prose-h2:font-black prose-li:leading-8 mt-8 space-y-5">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
