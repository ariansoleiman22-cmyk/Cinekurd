import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { getProductsByCategory } from "@/lib/catalog";
import { CatalogView } from "@/components/CatalogView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.categoryPages.light.title };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const products = await getProductsByCategory("light");

  return (
    <CatalogView
      lang={lang}
      dict={dict}
      title={dict.categoryPages.light.title}
      sub={dict.categoryPages.light.sub}
      products={products}
      breadcrumb={[
        { label: dict.catalog.breadcrumbHome, href: `/${lang}` },
        { label: dict.categoryPages.light.title },
      ]}
    />
  );
}
