import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { requireAdmin, getAllProductsAdmin } from "@/lib/admin";
import { deleteProduct } from "@/lib/actions/admin";
import { pick } from "@/lib/catalog";
import { DeleteButton } from "@/components/admin/DeleteButton";

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
  const products = await getAllProductsAdmin();
  const t = dict.admin.products;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl text-cream">{t.title}</h2>
        <Link
          href={`/${lang}/admin/products/new`}
          className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-gold-light"
        >
          {t.new}
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-muted-dark">
                <th className="px-4 py-3 text-start font-normal">{t.nameEn}</th>
                <th className="px-4 py-3 text-start font-normal">{t.category}</th>
                <th className="px-4 py-3 text-start font-normal">{t.stock}</th>
                <th className="px-4 py-3 text-start font-normal">{t.maxPerAccount}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/${lang}/admin/products/${p.id}`}
                      className="text-cream transition-colors hover:text-gold"
                    >
                      {pick(p.name, lang)}
                    </Link>
                    {p.featured && <span className="ms-2 text-xs text-gold">★</span>}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {dict.categoryPages[
                      p.category as keyof typeof dict.categoryPages
                    ]?.title ?? p.category}
                  </td>
                  <td className="px-4 py-3 text-muted">{p.stock}</td>
                  <td className="px-4 py-3 text-muted">{p.maxPerAccount}</td>
                  <td className="px-4 py-3 text-end">
                    <DeleteButton
                      action={deleteProduct}
                      hidden={{ lang, id: p.id }}
                      label={t.delete}
                      confirmText={t.deleteConfirm}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-rose-300 transition-colors hover:border-rose-500/50"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
