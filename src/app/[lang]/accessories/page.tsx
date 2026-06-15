import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { getProductsByCategory, ACCESSORY_SUBTYPES } from "@/lib/catalog";
import { CatalogView } from "@/components/CatalogView";
import { SubtypeFilter } from "@/components/SubtypeFilter";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.categoryPages.accessories.title };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ subtype?: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { subtype } = await searchParams;

  const all = await getProductsByCategory("accessories");

  const counts = new Map<string, number>();
  for (const product of all) {
    if (product.subtype) {
      counts.set(product.subtype, (counts.get(product.subtype) ?? 0) + 1);
    }
  }
  const subtypes = ACCESSORY_SUBTYPES.filter((s) => counts.has(s)).map((s) => ({
    key: s,
    count: counts.get(s)!,
  }));

  const active = subtype && counts.has(subtype) ? subtype : null;
  const products = active ? all.filter((p) => p.subtype === active) : all;

  return (
    <CatalogView
      lang={lang}
      dict={dict}
      title={dict.categoryPages.accessories.title}
      sub={dict.categoryPages.accessories.sub}
      products={products}
      breadcrumb={[
        { label: dict.catalog.breadcrumbHome, href: `/${lang}` },
        { label: dict.categoryPages.accessories.title },
      ]}
      filter={
        <SubtypeFilter
          basePath={`/${lang}/accessories`}
          subtypes={subtypes}
          active={active}
          dict={dict}
        />
      }
    />
  );
}
