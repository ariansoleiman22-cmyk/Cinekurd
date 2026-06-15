import Link from "next/link";
import type { Dictionary } from "@/i18n/types";
import { cn } from "@/lib/utils";

function Pill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition-colors",
        active
          ? "border-gold/60 bg-gold/10 text-gold"
          : "border-white/10 text-cream/70 hover:border-gold/40 hover:text-cream",
      )}
    >
      {label}
    </Link>
  );
}

export function SubtypeFilter({
  basePath,
  subtypes,
  active,
  dict,
}: {
  basePath: string;
  subtypes: { key: string; count: number }[];
  active: string | null;
  dict: Dictionary;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Pill href={basePath} active={!active} label={dict.catalog.filterAll} />
      {subtypes.map((s) => {
        const label =
          dict.subtypes[s.key as keyof typeof dict.subtypes] ??
          dict.subtypes.other;
        return (
          <Pill
            key={s.key}
            href={`${basePath}?subtype=${s.key}`}
            active={active === s.key}
            label={`${label} · ${s.count}`}
          />
        );
      })}
    </div>
  );
}
