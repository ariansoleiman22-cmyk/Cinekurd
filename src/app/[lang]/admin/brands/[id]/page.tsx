import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { requireAdmin, getBrandForEdit } from "@/lib/admin";
import { deleteBrand } from "@/lib/actions/admin";
import { BrandForm } from "@/components/admin/BrandForm";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdmin(lang);
  const dict = await getDictionary(lang);
  const brand = await getBrandForEdit(id);
  if (!brand) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl text-cream">
          {dict.admin.brands.edit}
        </h2>
        <DeleteButton
          action={deleteBrand}
          hidden={{ lang, id: brand.id }}
          label={dict.admin.brands.delete}
          confirmText={dict.admin.brands.deleteConfirm}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-rose-300 transition-colors hover:border-rose-500/50"
        />
      </div>
      <BrandForm lang={lang} dict={dict} brand={brand} />
    </div>
  );
}
