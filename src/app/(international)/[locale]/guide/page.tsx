import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { ContentPage } from "@/components/site/ContentPage";
import { isAddedLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/routes";
import { siteMessages } from "@/lib/i18n/messages";
import { guideSlugs } from "@/lib/guides/guide-slugs";
import { guideUi } from "@/lib/guides/guide-ui";
import { getTranslatedGuide } from "@/lib/guides/translated-guides";
import { createMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isAddedLocale(locale)) notFound();
  const t = guideUi[locale];
  return createMetadata({ title: t.title, description: t.description, path: localePath("/guide", locale) });
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isAddedLocale(locale)) notFound();
  const t = guideUi[locale];
  const groups = [{ title: t.tools, slugs: guideSlugs.slice(0, 4) }, { title: t.compression, slugs: guideSlugs.slice(4) }];
  return <ContentPage title={t.title} description={t.description} locale={locale} breadcrumbLabel={siteMessages[locale].common.guides}>
    {groups.map(group => <section key={group.title} className="pb-4">
      <h2 className="mb-4 text-xl font-semibold text-foreground">{group.title}</h2>
      <div className="grid gap-3">{group.slugs.map(slug => {
        const guide = getTranslatedGuide(locale, slug);
        return <Link key={slug} data-guide-card href={localePath(`/guides/${slug}`, locale)} prefetch={false} className="group rounded-xl border border-black/10 bg-white px-5 py-4 transition-colors hover:border-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700">
          <div className="flex items-start justify-between gap-4"><h3 className="font-semibold leading-7 text-foreground">{guide.title}</h3><ArrowUpRight aria-hidden="true" size={19} className="mt-1 shrink-0 text-teal-700" /></div>
          <p className="mt-1 text-sm leading-6 text-slate-600">{guide.description}</p>
        </Link>;
      })}</div>
    </section>)}
  </ContentPage>;
}
