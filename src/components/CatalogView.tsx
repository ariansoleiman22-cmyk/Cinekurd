import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { ProductView } from "@/lib/catalog";
import { interpolate } from "@/lib/utils";
import { Container } from "./Container";
import { Breadcrumb, type Crumb } from "./Breadcrumb";
import { ProductCard } from "./ProductCard";

export function CatalogView({
  lang,
  dict,
  title,
  sub,
  products,
  breadcrumb,
  filter,
}: {
  lang: Locale;
  dict: Dictionary;
  title: string;
  sub: string;
  products: ProductView[];
  breadcrumb: Crumb[];
  filter?: ReactNode;
}) {
  return (
    <div className="bg-aurora min-h-[70vh]">
      <Container className="py-12 sm:py-16">
        <Breadcrumb items={breadcrumb} />

        <div className="mt-6 max-w-2xl">
          <h1 className="font-display text-4xl text-cream sm:text-5xl">{title}</h1>
          <p className="mt-3 leading-relaxed text-muted">{sub}</p>
          <p className="mt-4 text-sm text-gold/80">
            {interpolate(dict.catalog.results, { count: products.length })}
          </p>
        </div>

        {filter && <div className="mt-8">{filter}</div>}

        {products.length ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                lang={lang}
                dict={dict}
              />
            ))}
          </div>
        ) : (
          <p className="mt-20 text-center text-muted">{dict.catalog.empty}</p>
        )}
      </Container>
    </div>
  );
}
