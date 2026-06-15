import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { getCurrentUser } from "@/lib/auth";
import { getThread, markThreadReadByUser } from "@/lib/messaging";
import { Container } from "@/components/Container";
import { MessageThread } from "@/components/MessageThread";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.messages.title };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/login`);
  const dict = await getDictionary(lang);

  await markThreadReadByUser(user.id);
  const thread = await getThread(user.id);
  const initialMessages = thread.map((m) => ({
    id: m.id,
    senderRole: m.senderRole,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="bg-aurora min-h-[70vh]">
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-4xl text-cream sm:text-5xl">
            {dict.messages.title}
          </h1>
          <p className="mt-2 text-sm text-muted">{dict.messages.sub}</p>
          <div className="mt-8 rounded-2xl border border-white/8 bg-surface/40 p-5">
            <MessageThread
              lang={lang}
              dict={dict}
              initialMessages={initialMessages}
              currentUserId={user.id}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
