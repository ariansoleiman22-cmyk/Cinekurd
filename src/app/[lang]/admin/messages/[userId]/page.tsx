import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { requireAdmin, getThreadUser } from "@/lib/admin";
import { getThread, markThreadReadByAdmin } from "@/lib/messaging";
import { AdminMessageThread } from "@/components/admin/AdminMessageThread";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; userId: string }>;
}) {
  const { lang, userId } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdmin(lang);
  const dict = await getDictionary(lang);
  const threadUser = await getThreadUser(userId);
  if (!threadUser) notFound();

  await markThreadReadByAdmin(userId);
  const thread = await getThread(userId);
  const initialMessages = thread.map((m) => ({
    id: m.id,
    senderRole: m.senderRole,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div>
      <Link
        href={`/${lang}/admin/messages`}
        className="text-sm text-muted transition-colors hover:text-gold"
      >
        ← {dict.admin.messages.back}
      </Link>
      <div className="mb-6 mt-3">
        <h2 className="font-display text-2xl text-cream">{threadUser.name}</h2>
        <p className="text-xs text-muted-dark">{threadUser.email}</p>
      </div>
      <div className="rounded-2xl border border-white/8 bg-surface/40 p-5">
        <AdminMessageThread
          lang={lang}
          dict={dict}
          threadUserId={userId}
          initialMessages={initialMessages}
        />
      </div>
    </div>
  );
}
