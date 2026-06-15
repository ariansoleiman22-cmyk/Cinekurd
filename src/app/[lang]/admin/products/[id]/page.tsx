import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { requireAdmin, getBrandOptions, getProductForEdit } from "@/lib/admin";
import { deleteProduct } from "@/lib/actions/admin";
import { ProductForm } from "@/components/admin/ProductForm";
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
  const product = await getProductForEdit(id);
  if (!product) notFound();
  const brands = await getBrandOptions();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl text-cream">
          {dict.admin.products.edit}
        </h2>
        <DeleteButton
          action={deleteProduct}
          hidden={{ lang, id: product.id }}
          label={dict.admin.products.delete}
          confirmText={dict.admin.products.deleteConfirm}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-rose-300 transition-colors hover:border-rose-500/50"
        />
      </div>
      <ProductForm lang={lang} dict={dict} brands={brands} product={product} />
    </div>
  );
}
