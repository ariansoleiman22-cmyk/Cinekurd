import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { requireAdmin } from "@/lib/admin";
import { Container } from "@/components/Container";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdmin(lang);
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-[80vh] bg-ink">
      <Container className="py-10">
        <h1 className="mb-6 font-display text-3xl text-cream">
          {dict.admin.title}
        </h1>
        <AdminNav lang={lang} dict={dict} />
        <div className="mt-8">{children}</div>
      </Container>
    </div>
  );
}
