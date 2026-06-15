"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createBooking, type BookingState } from "@/lib/actions/booking";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { interpolate } from "@/lib/utils";

const primary =
  "inline-flex items-center justify-center rounded-full bg-gold px-7 py-3 text-sm font-medium text-ink transition-colors hover:bg-gold-light disabled:opacity-60";

export function BookingForm({
  lang,
  dict,
  productId,
  slug,
  stock,
  maxPerAccount,
  alreadyBooked,
  isLoggedIn,
}: {
  lang: Locale;
  dict: Dictionary;
  productId: string;
  slug: string;
  stock: number;
  maxPerAccount: number;
  alreadyBooked: number;
  isLoggedIn: boolean;
}) {
  const [state, formAction, pending] = useActionState<BookingState, FormData>(
    createBooking,
    null,
  );
  const t = dict.booking;

  const remainingByLimit = Math.max(0, maxPerAccount - alreadyBooked);
  const maxQty = Math.min(stock, remainingByLimit);

  if (!isLoggedIn) {
    return (
      <Link href={`/${lang}/login`} className={primary}>
        {t.signInToBook}
      </Link>
    );
  }

  if (state?.ok) {
    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
        <p className="text-sm text-emerald-200">{t.success}</p>
        <Link
          href={`/${lang}/account`}
          className="mt-2 inline-block text-sm text-gold hover:text-gold-light"
        >
          {t.viewBookings}
        </Link>
      </div>
    );
  }

  if (stock <= 0) {
    return (
      <button type="button" disabled className={primary}>
        {t.outOfStock}
      </button>
    );
  }

  if (remainingByLimit <= 0) {
    return (
      <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
        {t.limitReached}
      </p>
    );
  }

  const options = Array.from({ length: maxQty }, (_, i) => i + 1);
  const errorMessage = state?.error
    ? t.errors[state.error as keyof typeof t.errors] ?? t.errors.generic
    : null;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />

      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm text-muted">
          {t.quantity}
        </label>
        <select
          id="quantity"
          name="quantity"
          defaultValue="1"
          className="rounded-xl border border-white/10 bg-surface/60 px-3 py-2.5 text-cream outline-none focus:border-gold/60"
        >
          {options.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button type="submit" disabled={pending} className={`${primary} flex-1`}>
          {pending ? t.reserving : t.reserve}
        </button>
      </div>

      <p className="text-xs text-muted">
        {interpolate(t.remaining, { count: maxQty })}
      </p>

      {errorMessage && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
