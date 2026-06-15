import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { getBrandWithProducts, pick } from "@/lib/catalog";
import { interpolate } from "@/lib/utils";
import { Container } from "@/components/Container";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BrandMedia } from "@/components/ProductMedia";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const data = await getBrandWithProducts(slug);
  return { title: data?.brand.name };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const data = await getBrandWithProducts(slug);
  if (!data) notFound();
  const { brand, products } = data;

  return (
    <div className="bg-aurora min-h-[70vh]">
      <Container className="py-12 sm:py-16">
        <Breadcrumb
          items={[
            { label: dict.catalog.breadcrumbHome, href: `/${lang}` },
            { label: dict.brandsPage.title, href: `/${lang}/brands` },
            { label: brand.name },
          ]}
        />

        <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
          <BrandMedia
            name={brand.name}
            className="h-28 w-28 shrink-0 rounded-2xl border border-white/8"
          />
          <div>
            <h1 className="font-display text-4xl text-cream sm:text-5xl">
              {brand.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
              <span>
                {dict.brandsPage.country}: {brand.country}
              </span>
              {brand.foundedYear && (
                <span>
                  {dict.brandsPage.founded}: {brand.foundedYear}
                </span>
              )}
              <span className="text-gold/80">
                {interpolate(dict.brandsPage.items, { count: brand.productCount })}
              </span>
            </div>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">
              {pick(brand.description, lang)}
            </p>
          </div>
        </header>

        {products.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl text-cream">
              {interpolate(dict.brandsPage.productsBy, { brand: brand.name })}
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  lang={lang}
                  dict={dict}
                />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
