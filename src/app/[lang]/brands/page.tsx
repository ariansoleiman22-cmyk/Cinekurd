import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { getBrands } from "@/lib/catalog";
import { Container } from "@/components/Container";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BrandCard } from "@/components/BrandCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.brandsPage.title };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const brands = await getBrands();

  return (
    <div className="bg-aurora min-h-[70vh]">
      <Container className="py-12 sm:py-16">
        <Breadcrumb
          items={[
            { label: dict.catalog.breadcrumbHome, href: `/${lang}` },
            { label: dict.brandsPage.title },
          ]}
        />
        <div className="mt-6 max-w-2xl">
          <h1 className="font-display text-4xl text-cream sm:text-5xl">
            {dict.brandsPage.title}
          </h1>
          <p className="mt-3 leading-relaxed text-muted">{dict.brandsPage.sub}</p>
        </div>

        {brands.length ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} lang={lang} dict={dict} />
            ))}
          </div>
        ) : (
          <p className="mt-20 text-center text-muted">{dict.catalog.empty}</p>
        )}
      </Container>
    </div>
  );
}
