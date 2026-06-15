"use client";

import { useFormStatus } from "react-dom";
import { setBookingStatusAction } from "@/lib/actions/admin";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { cn } from "@/lib/utils";

function Btn({ label, className }: { label: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "…" : label}
    </button>
  );
}

function StatusForm({
  lang,
  bookingId,
  status,
  label,
  className,
}: {
  lang: Locale;
  bookingId: string;
  status: string;
  label: string;
  className: string;
}) {
  return (
    <form action={setBookingStatusAction} className="inline">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="status" value={status} />
      <Btn label={label} className={className} />
    </form>
  );
}

const base =
  "rounded-full border px-3 py-1.5 text-xs transition-colors disabled:opacity-50";

export function BookingStatusActions({
  lang,
  bookingId,
  status,
  dict,
}: {
  lang: Locale;
  bookingId: string;
  status: string;
  dict: Dictionary;
}) {
  const t = dict.admin.bookings;
  return (
    <div className="flex flex-wrap gap-2">
      {status === "pending" && (
        <StatusForm
          lang={lang}
          bookingId={bookingId}
          status="confirmed"
          label={t.confirm}
          className={cn(base, "border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/10")}
        />
      )}
      {(status === "pending" || status === "confirmed") && (
        <StatusForm
          lang={lang}
          bookingId={bookingId}
          status="cancelled"
          label={t.cancel}
          className={cn(base, "border-rose-500/40 text-rose-300 hover:bg-rose-500/10")}
        />
      )}
      {status === "confirmed" && (
        <StatusForm
          lang={lang}
          bookingId={bookingId}
          status="completed"
          label={t.complete}
          className={cn(base, "border-sky-400/40 text-sky-300 hover:bg-sky-400/10")}
        />
      )}
    </div>
  );
}
