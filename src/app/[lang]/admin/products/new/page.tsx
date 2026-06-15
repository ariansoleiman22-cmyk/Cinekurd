import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { requireAdmin, getBrandOptions } from "@/lib/admin";
import { ProductForm } from "@/components/admin/ProductForm";

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
  const brands = await getBrandOptions();

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl text-cream">
        {dict.admin.products.new}
      </h2>
      <ProductForm lang={lang} dict={dict} brands={brands} />
    </div>
  );
}
