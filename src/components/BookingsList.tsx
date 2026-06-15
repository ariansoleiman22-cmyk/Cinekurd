import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { type BookingView, ACTIVE_STATUSES } from "@/lib/bookings";
import { pick } from "@/lib/catalog";
import { interpolate, cn } from "@/lib/utils";
import { CancelBookingButton } from "./CancelBookingButton";

const STATUS_STYLE: Record<string, string> = {
  pending: "border-amber-400/30 text-amber-300",
  confirmed: "border-emerald-400/30 text-emerald-300",
  cancelled: "border-rose-500/30 text-rose-300",
  completed: "border-sky-400/30 text-sky-300",
};
const ACTIVE = ACTIVE_STATUSES as unknown as string[];

export function BookingsList({
  lang,
  dict,
  bookings,
}: {
  lang: Locale;
  dict: Dictionary;
  bookings: BookingView[];
}) {
  if (!bookings.length) {
    return (
      <div className="rounded-2xl border border-white/8 bg-surface/40 p-8 text-center">
        <p className="text-sm text-muted">{dict.booking.empty}</p>
        <Link
          href={`/${lang}/camera`}
          className="mt-3 inline-block text-sm text-gold hover:text-gold-light"
        >
          {dict.booking.browse}
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {bookings.map((b) => {
        const statusLabel =
          dict.booking.status[b.status as keyof typeof dict.booking.status] ??
          b.status;
        let date = "";
        try {
          date = new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(
            b.createdAt,
          );
        } catch {
          date = b.createdAt.toISOString().slice(0, 10);
        }
        return (
          <li
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/8 bg-surface/40 p-4"
          >
            <div className="min-w-0">
              <Link
                href={`/${lang}/product/${b.product.slug}`}
                className="font-display text-lg text-cream transition-colors hover:text-gold"
              >
                {pick(b.product.name, lang)}
              </Link>
              <p className="mt-0.5 text-xs text-muted">
                {b.product.brand} ·{" "}
                {interpolate(dict.booking.qty, { count: b.quantity })} · {date}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  STATUS_STYLE[b.status] ?? "border-white/15 text-muted",
                )}
              >
                {statusLabel}
              </span>
              {ACTIVE.includes(b.status) && (
                <CancelBookingButton
                  lang={lang}
                  bookingId={b.id}
                  label={dict.booking.cancel}
                  pendingLabel={dict.booking.cancelling}
                  className="rounded-full border border-white/15 px-4 py-1.5 text-xs text-cream/70 transition-colors hover:border-rose-500/50 hover:text-rose-300"
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
