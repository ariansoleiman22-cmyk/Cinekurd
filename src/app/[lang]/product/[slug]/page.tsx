import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import {
  getProduct,
  getRelatedProducts,
  pick,
  stockStatus,
} from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { getActiveBookedQty } from "@/lib/bookings";
import { interpolate } from "@/lib/utils";
import { Container } from "@/components/Container";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductMedia } from "@/components/ProductMedia";
import { StockBadge } from "@/components/StockBadge";
import { SpecList } from "@/components/SpecList";
import { ProductCard } from "@/components/ProductCard";
import { BookingForm } from "@/components/BookingForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const product = await getProduct(slug);
  return { title: product ? pick(product.name, lang) : undefined };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category, product.slug, 4);
  const user = await getCurrentUser();
  const alreadyBooked = user
    ? await getActiveBookedQty(user.id, product.id)
    : 0;
  const status = stockStatus(product.stock);
  const categoryTitle = dict.categoryPages[product.category].title;
  const subtypeLabel = product.subtype
    ? dict.subtypes[product.subtype as keyof typeof dict.subtypes] ??
      dict.subtypes.other
    : null;
  const soldOut = product.stock <= 0;

  return (
    <div className="bg-aurora">
      <Container className="py-12 sm:py-16">
        <Breadcrumb
          items={[
            { label: dict.catalog.breadcrumbHome, href: `/${lang}` },
            { label: categoryTitle, href: `/${lang}/${product.category}` },
            { label: pick(product.name, lang) },
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <ProductMedia
            category={product.category}
            watermark={product.brand.name}
            imageUrl={product.imageUrl}
            alt={pick(product.name, lang)}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="aspect-[4/3] w-full rounded-2xl border border-white/8"
          />

          <div>
            <Link
              href={`/${lang}/brands/${product.brand.slug}`}
              className="text-sm uppercase tracking-wider text-gold/80 transition-colors hover:text-gold"
            >
              {product.brand.name}
            </Link>
            <h1 className="mt-2 font-display text-4xl text-cream sm:text-5xl">
              {pick(product.name, lang)}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <StockBadge status={status} dict={dict} />
              {!soldOut && (
                <span className="text-sm text-muted">
                  {interpolate(dict.catalog.available, { count: product.stock })}
                </span>
              )}
              {subtypeLabel && (
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-cream/70">
                  {subtypeLabel}
                </span>
              )}
            </div>

            <p className="mt-6 leading-relaxed text-muted">
              {pick(product.description, lang)}
            </p>

            {/* Booking */}
            <div className="mt-8 rounded-2xl border border-white/8 bg-surface/40 p-5">
              <p className="mb-4 text-sm text-cream">
                {interpolate(dict.catalog.maxPerAccount, {
                  count: product.maxPerAccount,
                })}
              </p>
              <BookingForm
                lang={lang}
                dict={dict}
                productId={product.id}
                slug={product.slug}
                stock={product.stock}
                maxPerAccount={product.maxPerAccount}
                alreadyBooked={alreadyBooked}
                isLoggedIn={Boolean(user)}
              />
            </div>

            {product.specs.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-sm uppercase tracking-[0.2em] text-muted-dark">
                  {dict.catalog.specifications}
                </h2>
                <SpecList specs={product.specs} />
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl text-cream">
              {dict.catalog.related}
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
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
