import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { requireAdmin, getAllBookings } from "@/lib/admin";
import { pick } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { BookingStatusActions } from "@/components/admin/BookingStatusActions";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  pending: "text-amber-300",
  confirmed: "text-emerald-300",
  cancelled: "text-rose-300",
  completed: "text-sky-300",
};

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdmin(lang);
  const dict = await getDictionary(lang);
  const bookings = await getAllBookings();
  const t = dict.admin.bookings;

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl text-cream">{t.title}</h2>
      {bookings.length === 0 ? (
        <p className="text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-muted-dark">
                <th className="px-4 py-3 text-start font-normal">{t.item}</th>
                <th className="px-4 py-3 text-start font-normal">{t.customer}</th>
                <th className="px-4 py-3 text-start font-normal">{t.qty}</th>
                <th className="px-4 py-3 text-start font-normal">{t.status}</th>
                <th className="px-4 py-3 text-start font-normal">{t.date}</th>
                <th className="px-4 py-3 text-start font-normal">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                let date = "";
                try {
                  date = new Intl.DateTimeFormat(lang, {
                    dateStyle: "medium",
                  }).format(b.createdAt);
                } catch {
                  date = b.createdAt.toISOString().slice(0, 10);
                }
                return (
                  <tr
                    key={b.id}
                    className="border-b border-white/5 align-top last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/${lang}/product/${b.productSlug}`}
                        className="text-cream transition-colors hover:text-gold"
                      >
                        {pick(b.productName, lang)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      <div>{b.userName}</div>
                      <div className="text-xs text-muted-dark">{b.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">×{b.quantity}</td>
                    <td
                      className={cn(
                        "px-4 py-3",
                        STATUS_STYLE[b.status] ?? "text-muted",
                      )}
                    >
                      {dict.booking.status[
                        b.status as keyof typeof dict.booking.status
                      ] ?? b.status}
                    </td>
                    <td className="px-4 py-3 text-muted">{date}</td>
                    <td className="px-4 py-3">
                      <BookingStatusActions
                        lang={lang}
                        bookingId={b.id}
                        status={b.status}
                        dict={dict}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
