"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { Globe, ChevronDown } from "./icons";

export function LanguageSwitcher({ lang }: { lang: Locale }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function switchTo(next: Locale) {
    setOpen(false);
    if (next === lang) return;
    const segments = (pathname || `/${lang}`).split("/");
    segments[1] = next; // replace the locale segment
    const target = segments.join("/") || `/${next}`;
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;samesite=lax`;
    router.push(target);
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-sm text-cream/80 transition-colors hover:border-gold/40 hover:text-cream"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{localeNames[lang].native}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-48 overflow-hidden rounded-xl glass hairline shadow-xl">
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => switchTo(code)}
              className={`flex w-full items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-white/5 ${
                code === lang ? "text-gold" : "text-cream/80"
              }`}
            >
              <span>{localeNames[code].native}</span>
              <span className="text-xs text-muted-dark">
                {localeNames[code].english}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
