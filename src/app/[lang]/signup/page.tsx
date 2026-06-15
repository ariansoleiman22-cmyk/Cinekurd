import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/Container";
import { AuthForm } from "@/components/AuthForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.auth.createAccount };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await getCurrentUser();
  if (user) redirect(`/${lang}/account`);
  const dict = await getDictionary(lang);

  return (
    <div className="bg-aurora grain relative">
      <Container className="flex min-h-[80vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-white/8 bg-surface/40 p-8">
          <h1 className="font-display text-3xl text-cream">
            {dict.auth.signUpTitle}
          </h1>
          <p className="mt-2 text-sm text-muted">{dict.auth.signUpSub}</p>
          <div className="mt-8">
            <AuthForm mode="signup" lang={lang} dict={dict} />
          </div>
        </div>
      </Container>
    </div>
  );
}
