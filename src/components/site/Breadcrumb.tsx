import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  locale?: "en" | "zh";
  items: BreadcrumbItem[];
};

export function Breadcrumb({ locale = "en", items }: BreadcrumbProps) {
  const isChinese = locale === "zh";
  const homeLabel = isChinese ? "首页" : "Home";
  const homeHref = isChinese ? "/zh" : "/";

  const allItems: BreadcrumbItem[] = [
    { label: homeLabel, href: homeHref },
    ...items,
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.label,
      item: item.href ? `https://piczip.app${item.href}` : undefined,
    })),
  };

  return (
    <>
      <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
        {allItems.map((item, idx) => {
          const isLast = idx === allItems.length - 1;
          return (
            <div key={item.label} className="flex items-center gap-2">
              {idx > 0 && <span className="text-slate-400">/</span>}
              {isLast || !item.href ? (
                <span className="text-slate-700">{item.label}</span>
              ) : (
                <Link href={item.href} className="hover:text-slate-800 transition-colors">
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
