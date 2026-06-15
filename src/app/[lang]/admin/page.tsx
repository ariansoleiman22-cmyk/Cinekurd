import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { requireAdmin, getDashboardStats, getRecentBookings } from "@/lib/admin";
import { pick } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-surface/40 p-5">
      <p className="text-sm text-muted">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-3xl",
          accent && value > 0 ? "text-gold-gradient" : "text-cream",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdmin(lang);
  const dict = await getDictionary(lang);
  const stats = await getDashboardStats();
  const recent = await getRecentBookings(8);
  const d = dict.admin.dashboard;

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={d.products} value={stats.products} />
        <Stat label={d.brands} value={stats.brands} />
        <Stat label={d.users} value={stats.users} />
        <Stat label={d.pending} value={stats.pending} accent />
        <Stat label={d.confirmed} value={stats.confirmed} />
        <Stat label={d.unread} value={stats.unreadMessages} accent />
        <Stat label={d.lowStock} value={stats.lowStock} accent />
      </div>

      <div>
        <h2 className="mb-4 font-display text-2xl text-cream">
          {d.recentBookings}
        </h2>
        {recent.length === 0 ? (
          <p className="text-muted">{d.noBookings}</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/8">
            <table className="w-full min-w-[520px] text-sm">
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/${lang}/product/${b.productSlug}`}
                        className="text-cream transition-colors hover:text-gold"
                      >
                        {pick(b.productName, lang)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{b.userName}</td>
                    <td className="px-4 py-3 text-muted">×{b.quantity}</td>
                    <td className="px-4 py-3 text-end text-gold/80">
                      {dict.booking.status[
                        b.status as keyof typeof dict.booking.status
                      ] ?? b.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
