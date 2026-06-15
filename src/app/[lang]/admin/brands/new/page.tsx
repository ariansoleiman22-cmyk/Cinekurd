import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { requireAdmin } from "@/lib/admin";
import { BrandForm } from "@/components/admin/BrandForm";

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

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl text-cream">
        {dict.admin.brands.new}
      </h2>
      <BrandForm lang={lang} dict={dict} />
    </div>
  );
}
