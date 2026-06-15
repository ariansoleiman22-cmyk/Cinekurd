"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Category, StockStatus } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { ProductMedia } from "./ProductMedia";
import { StockBadge } from "./StockBadge";
import { ArrowRight } from "./icons";

export type SpotlightSlide = {
  slug: string;
  category: Category;
  imageUrl: string | null;
  brand: string;
  name: string;
  description: string;
  specs: { label: string; value: string }[];
  stock: number;
  status: StockStatus;
};

const ROTATE_MS = 5500;

export function SpotlightCarousel({
  lang,
  dict,
  slides,
}: {
  lang: Locale;
  dict: Dictionary;
  slides: SpotlightSlide[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);
  const count = slides.length;

  const go = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count],
  );

  // Auto-rotate (paused on hover).
  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % count), ROTATE_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  // Subtle scroll parallax on the ambient glow.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = glowRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const delta =
          (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        el.style.transform = `translate3d(0, ${(-delta * 44).toFixed(1)}px, 0)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (count === 0) return null;
  const s = slides[index];
  const href = `/${lang}/product/${s.slug}`;

  return (
    <section
      className="bg-aurora grain relative overflow-hidden border-y border-white/5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute -top-1/3 start-1/2 h-[55rem] w-[55rem] -translate-x-1/2 rounded-full bg-gold/[0.06] blur-3xl"
      />

      <Container className="relative py-20 sm:py-28">
        <div
          key={index}
          className="animate-fade grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
        >
          {/* Media */}
          <Link href={href} className="group relative block">
            <div className="pointer-events-none absolute -inset-4 rounded-[2.25rem] bg-gold/10 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100" />
            <ProductMedia
              category={s.category}
              imageUrl={s.imageUrl}
              watermark={s.brand}
              alt={s.name}
              zoom
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="relative aspect-[4/3] w-full rounded-3xl border border-white/10 shadow-gold transition-all duration-500 group-hover:border-gold/40"
            />
            <span className="absolute start-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gold backdrop-blur">
              {dict.home.spotlight}
            </span>
          </Link>

          {/* Content */}
          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-gold/90">
              <span className="h-px w-8 bg-gold/50" />
              {s.brand}
            </div>
            <h2 className="text-gold-gradient mt-5 font-display text-4xl leading-tight sm:text-5xl">
              {s.name}
            </h2>
            <p className="mt-5 line-clamp-3 max-w-xl leading-relaxed text-muted">
              {s.description}
            </p>

            {s.specs.length > 0 && (
              <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4">
                {s.specs.map((sp, i) => (
                  <div key={i}>
                    <dt className="text-xs uppercase tracking-wider text-muted-dark">
                      {sp.label}
                    </dt>
                    <dd className="mt-1 text-sm text-cream">{sp.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href={href}
                className="group inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-medium text-ink shadow-gold transition-colors hover:bg-gold-light"
              >
                {dict.home.discover}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
              <StockBadge status={s.status} dict={dict} />
            </div>
          </div>
        </div>

        {/* Controls */}
        {count > 1 && (
          <div className="mt-12 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-cream/70 transition-colors hover:border-gold/40 hover:text-cream"
            >
              <ArrowRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
            </button>
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index ? "w-7 bg-gold" : "w-1.5 bg-white/20 hover:bg-white/40",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-cream/70 transition-colors hover:border-gold/40 hover:text-cream"
            >
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </button>
          </div>
        )}
      </Container>
    </section>
  );
}
