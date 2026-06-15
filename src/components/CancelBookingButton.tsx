"use client";

import { useFormStatus } from "react-dom";
import { cancelBooking } from "@/lib/actions/booking";
import type { Locale } from "@/i18n/config";

function Inner({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export function CancelBookingButton({
  lang,
  bookingId,
  label,
  pendingLabel,
  className,
}: {
  lang: Locale;
  bookingId: string;
  label: string;
  pendingLabel: string;
  className?: string;
}) {
  return (
    <form action={cancelBooking} className="contents">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="bookingId" value={bookingId} />
      <Inner label={label} pendingLabel={pendingLabel} className={className} />
    </form>
  );
}
