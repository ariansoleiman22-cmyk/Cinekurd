import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { requireAdmin, getThreadList } from "@/lib/admin";
import { interpolate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdmin(lang);
  const dict = await getDictionary(lang);
  const threads = await getThreadList();
  const t = dict.admin.messages;

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl text-cream">{t.inbox}</h2>
      {threads.length === 0 ? (
        <p className="text-muted">{t.empty}</p>
      ) : (
        <ul className="space-y-2">
          {threads.map((th) => {
            let when = "";
            try {
              if (th.lastAt)
                when = new Intl.DateTimeFormat(lang, {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(th.lastAt);
            } catch {
              when = "";
            }
            return (
              <li key={th.userId}>
                <Link
                  href={`/${lang}/admin/messages/${th.userId}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-surface/40 px-5 py-4 transition-colors hover:border-gold/40"
                >
                  <div className="min-w-0">
                    <p className="text-cream">{th.name}</p>
                    <p className="text-xs text-muted-dark">{th.email}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    {th.unread > 0 && (
                      <span className="rounded-full bg-gold px-2 py-0.5 font-bold text-ink">
                        {interpolate(t.unread, { count: th.unread })}
                      </span>
                    )}
                    <span>{when}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
