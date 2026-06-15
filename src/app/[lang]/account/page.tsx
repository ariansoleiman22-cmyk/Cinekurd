import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { getCurrentUser } from "@/lib/auth";
import { getUserBookings } from "@/lib/bookings";
import { interpolate } from "@/lib/utils";
import { Container } from "@/components/Container";
import { SignOutButton } from "@/components/SignOutButton";
import { BookingsList } from "@/components/BookingsList";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-end text-sm text-cream">{value}</dd>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.auth.account.title };
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
  const a = dict.auth.account;
  const bookings = await getUserBookings(user.id);

  let memberSince = "";
  try {
    memberSince = new Intl.DateTimeFormat(lang, { dateStyle: "long" }).format(
      user.createdAt,
    );
  } catch {
    memberSince = user.createdAt.toISOString().slice(0, 10);
  }

  return (
    <div className="bg-aurora min-h-[70vh]">
      <Container className="py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-display text-4xl text-cream sm:text-5xl">
              {a.title}
            </h1>
            <SignOutButton
              lang={lang}
              label={a.signOut}
              className="rounded-full border border-white/15 px-5 py-2 text-sm text-cream/80 transition-colors hover:border-gold/50 hover:text-cream"
            />
          </div>
          <p className="mt-3 font-display text-lg text-gold-gradient">
            {interpolate(a.greeting, { name: user.name })}
          </p>

          <dl className="mt-8 divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/8">
            <Row label={a.email} value={user.email} />
            <Row
              label={a.role}
              value={user.role === "admin" ? a.roleAdmin : a.roleUser}
            />
            <Row label={a.memberSince} value={memberSince} />
          </dl>

          <section className="mt-10">
            <h2 className="mb-4 font-display text-2xl text-cream">
              {a.bookingsTitle}
            </h2>
            <BookingsList lang={lang} dict={dict} bookings={bookings} />
          </section>
        </div>
      </Container>
    </div>
  );
}
