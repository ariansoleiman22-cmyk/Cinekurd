import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { type ProductView, pick, stockStatus } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { StockBadge } from "./StockBadge";
import { ProductMedia } from "./ProductMedia";
import { ArrowRight } from "./icons";

export function ProductCard({
  product,
  lang,
  dict,
}: {
  product: ProductView;
  lang: Locale;
  dict: Dictionary;
}) {
  const status = stockStatus(product.stock);
  const subtypeLabel = product.subtype
    ? dict.subtypes[product.subtype as keyof typeof dict.subtypes] ??
      dict.subtypes.other
    : null;

  return (
    <Link
      href={`/${lang}/product/${product.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-surface/50 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-gold",
        status === "out" && "opacity-80",
      )}
    >
      <ProductMedia
        category={product.category}
        watermark={product.brand.name}
        imageUrl={product.imageUrl}
        alt={pick(product.name, lang)}
        zoom
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="aspect-[4/3] w-full"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs uppercase tracking-wider text-gold/80">
            {product.brand.name}
          </span>
          {subtypeLabel && (
            <span className="shrink-0 text-xs text-muted">{subtypeLabel}</span>
          )}
        </div>
        <h3 className="mt-2 line-clamp-1 font-display text-xl text-cream">
          {pick(product.name, lang)}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
          {pick(product.description, lang)}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
          <StockBadge status={status} dict={dict} />
          <span className="inline-flex items-center gap-1 text-sm text-gold/70 transition-colors group-hover:text-gold">
            {dict.catalog.viewDetails}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
