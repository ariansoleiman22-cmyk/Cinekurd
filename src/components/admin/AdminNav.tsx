"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { cn } from "@/lib/utils";

const KEYS = ["dashboard", "products", "bookings", "messages"] as const;

export function AdminNav({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const hrefFor = (key: string) =>
    key === "dashboard" ? `/${lang}/admin` : `/${lang}/admin/${key}`;
  const active = (href: string) =>
    href === `/${lang}/admin` ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="flex flex-wrap gap-2">
      {KEYS.map((key) => {
        const href = hrefFor(key);
        return (
          <Link
            key={key}
            href={href}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition-colors",
              active(href)
                ? "bg-gold text-ink"
                : "border border-white/10 text-cream/80 hover:border-gold/40 hover:text-cream",
            )}
          >
            {dict.admin.nav[key]}
          </Link>
        );
      })}
      <Link
        href={`/${lang}`}
        className="ms-auto rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition-colors hover:text-cream"
      >
        {dict.admin.nav.viewSite}
      </Link>
    </nav>
  );
}
