import { cn } from "@/lib/utils";
import type { StockStatus } from "@/lib/catalog";
import type { Dictionary } from "@/i18n/types";

const STYLES: Record<
  StockStatus,
  { key: keyof Dictionary["catalog"]; dot: string; text: string; ring: string }
> = {
  in: { key: "inStock", dot: "bg-emerald-400", text: "text-emerald-300", ring: "border-emerald-400/30" },
  low: { key: "lowStock", dot: "bg-amber-400", text: "text-amber-300", ring: "border-amber-400/30" },
  out: { key: "outOfStock", dot: "bg-rose-500", text: "text-rose-300", ring: "border-rose-500/30" },
};

export function StockBadge({
  status,
  dict,
  className,
}: {
  status: StockStatus;
  dict: Dictionary;
  className?: string;
}) {
  const s = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        s.ring,
        s.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {dict.catalog[s.key]}
    </span>
  );
}
