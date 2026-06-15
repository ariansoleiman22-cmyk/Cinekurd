import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { ProductView, Category } from "@/lib/catalog";
import { Container } from "./Container";
import { ProductCard } from "./ProductCard";
import { ArrowRight } from "./icons";

export function CategoryShowcase({
  lang,
  dict,
  groups,
}: {
  lang: Locale;
  dict: Dictionary;
  groups: { category: Category; products: ProductView[] }[];
}) {
  return (
    <>
      {groups.map((group) => (
        <section key={group.category} className="border-t border-white/5">
          <Container className="py-16 sm:py-20">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl text-cream sm:text-4xl">
                {dict.categoryPages[group.category].title}
              </h2>
              <Link
                href={`/${lang}/${group.category}`}
                className="group inline-flex shrink-0 items-center gap-1.5 text-sm text-gold/80 transition-colors hover:text-gold"
              >
                {dict.categories.explore}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {group.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  lang={lang}
                  dict={dict}
                />
              ))}
            </div>
          </Container>
        </section>
      ))}
    </>
  );
}
