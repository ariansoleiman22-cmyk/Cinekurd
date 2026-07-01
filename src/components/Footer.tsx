import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { Logo } from "./Logo";

const CATEGORY_KEYS = ["camera", "lens", "light", "accessories"] as const;

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-white/5 bg-charcoal">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Logo lang={lang} size="sm" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {dict.footer.tagline}
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-muted-dark">
              {dict.footer.explore}
            </h4>
            <ul className="mt-4 space-y-3">
              {CATEGORY_KEYS.map((key) => (
                <li key={key}>
                  <Link
                    href={`/${lang}/${key}`}
                    className="text-sm text-cream/75 transition-colors hover:text-gold"
                  >
                    {dict.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-muted-dark">
              {dict.footer.company}
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={`/${lang}`}
                  className="text-sm text-cream/75 transition-colors hover:text-gold"
                >
                  {dict.nav.home}
                </Link>
              </li>
              <li>
                <span className="text-sm text-cream/75">{dict.footer.about}</span>
              </li>
              <li>
                <span className="text-sm text-cream/75">{dict.footer.contact}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="gold-divider my-10" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted sm:flex-row">
          <p>
            © {year} Cine Kurd. {dict.footer.rights}
          </p>
          <p>{dict.footer.madeWith}</p>
        </div>
      </div>
    </footer>
  );
}
