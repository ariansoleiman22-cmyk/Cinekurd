import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { type BrandView, pick } from "@/lib/catalog";
import { interpolate } from "@/lib/utils";
import { BrandMedia } from "./ProductMedia";
import { ArrowRight } from "./icons";

export function BrandCard({
  brand,
  lang,
  dict,
}: {
  brand: BrandView;
  lang: Locale;
  dict: Dictionary;
}) {
  return (
    <Link
      href={`/${lang}/brands/${brand.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-surface/50 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-gold"
    >
      <BrandMedia name={brand.name} className="aspect-[16/9] w-full" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-xl text-cream">{brand.name}</h3>
          <span className="shrink-0 text-xs text-muted">{brand.country}</span>
        </div>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
          {pick(brand.description, lang)}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
          <span className="text-xs text-gold/80">
            {interpolate(dict.brandsPage.items, { count: brand.productCount })}
          </span>
          <span className="inline-flex items-center gap-1 text-sm text-gold/70 transition-colors group-hover:text-gold">
            {dict.brandsPage.viewGear}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
