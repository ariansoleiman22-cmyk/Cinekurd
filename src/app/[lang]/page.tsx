import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import {
  getFeaturedProducts,
  getCategoryShowcase,
  pick,
  stockStatus,
} from "@/lib/catalog";
import { SpotlightCarousel } from "@/components/SpotlightCarousel";
import { CategoryShowcase } from "@/components/CategoryShowcase";
import { categoryIcons, ArrowRight, Bolt, Shield, Chat } from "@/components/icons";

const CATEGORY_KEYS = ["camera", "lens", "light", "accessories"] as const;

const FEATURE_ICONS = {
  stock: Bolt,
  limit: Shield,
  message: Chat,
} as const;

// Live (the shared layout reads the session cookie, so render per request).
export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const [featured, showcase] = await Promise.all([
    getFeaturedProducts(6),
    getCategoryShowcase(4),
  ]);
  const slides = featured.map((p) => ({
    slug: p.slug,
    category: p.category,
    imageUrl: p.imageUrl,
    name: pick(p.name, lang),
    description: pick(p.description, lang),
    specs: p.specs.slice(0, 3),
    stock: p.stock,
    status: stockStatus(p.stock),
  }));

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="bg-aurora grain relative overflow-hidden">
        <div className="relative mx-auto flex min-h-[88vh] max-w-5xl flex-col items-center justify-center px-5 py-28 text-center sm:px-8">
          <div className="animate-rise flex items-center gap-4 text-xs uppercase tracking-[0.32em] text-gold/90">
            <span className="h-px w-8 bg-gold/50" />
            {dict.hero.eyebrow}
            <span className="h-px w-8 bg-gold/50" />
          </div>

          <h1
            className="animate-rise text-gold-gradient mt-8 font-display text-5xl leading-[1.05] sm:text-6xl md:text-7xl lg:text-[5.25rem]"
            style={{ animationDelay: "80ms" }}
          >
            {dict.hero.title}
          </h1>

          <p
            className="animate-rise mt-7 max-w-2xl text-base leading-relaxed text-muted sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            {dict.hero.subtitle}
          </p>

          <div
            className="animate-rise mt-10 flex flex-col gap-4 sm:flex-row"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href={`/${lang}/camera`}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-medium text-ink shadow-gold transition-all hover:bg-gold-light"
            >
              {dict.hero.ctaPrimary}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
            <Link
              href={`/${lang}#categories`}
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-8 py-3.5 text-sm font-medium text-cream/90 transition-colors hover:border-gold/50 hover:text-cream"
            >
              {dict.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* fade into the next section */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ink" />
      </section>

      {/* ---------------- Spotlight carousel (live) ---------------- */}
      {slides.length > 0 && (
        <SpotlightCarousel lang={lang} dict={dict} slides={slides} />
      )}

      {/* ---------------- Categories ---------------- */}
      <section
        id="categories"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl text-cream sm:text-4xl">
            {dict.categories.heading}
          </h2>
          <p className="mt-4 text-muted">{dict.categories.subheading}</p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_KEYS.map((key) => {
            const Icon = categoryIcons[key];
            const item = dict.categories.items[key];
            return (
              <Link
                key={key}
                href={`/${lang}/${key}`}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-surface/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-gold"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-gold/25 bg-gold/5 text-gold transition-colors group-hover:bg-gold/10">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 font-display text-2xl text-cream">{item.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm text-gold opacity-80 transition-opacity group-hover:opacity-100">
                  {dict.categories.explore}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------------- Per-category showcase (live) ---------------- */}
      {showcase.length > 0 && (
        <CategoryShowcase lang={lang} dict={dict} groups={showcase} />
      )}

      {/* ---------------- Features ---------------- */}
      <section className="border-y border-white/5 bg-charcoal">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl text-cream sm:text-4xl">
              {dict.features.heading}
            </h2>
            <p className="mt-4 text-muted">{dict.features.subheading}</p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {(["stock", "limit", "message"] as const).map((key) => {
              const Icon = FEATURE_ICONS[key];
              const item = dict.features.items[key];
              return (
                <div
                  key={key}
                  className="rounded-2xl border border-white/8 bg-surface/40 p-8 text-center"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/25 bg-gold/5 text-gold">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-cream">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
