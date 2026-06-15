import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { requireAdmin, getAllBrandsAdmin } from "@/lib/admin";
import { deleteBrand } from "@/lib/actions/admin";
import { interpolate } from "@/lib/utils";
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
  const brands = await getAllBrandsAdmin();
  const t = dict.admin.brands;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl text-cream">{t.title}</h2>
        <Link
          href={`/${lang}/admin/brands/new`}
          className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-gold-light"
        >
          {t.new}
        </Link>
      </div>

      {brands.length === 0 ? (
        <p className="text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-muted-dark">
                <th className="px-4 py-3 text-start font-normal">{t.name}</th>
                <th className="px-4 py-3 text-start font-normal">{t.country}</th>
                <th className="px-4 py-3 text-start font-normal">{t.categories}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/${lang}/admin/brands/${b.id}`}
                      className="text-cream transition-colors hover:text-gold"
                    >
                      {b.name}
                    </Link>
                    <span className="ms-2 text-xs text-muted-dark">
                      {interpolate(t.items, { count: b.productCount })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{b.country}</td>
                  <td className="px-4 py-3 text-muted">
                    {b.categories
                      .map(
                        (c) =>
                          dict.categoryPages[
                            c as keyof typeof dict.categoryPages
                          ]?.title ?? c,
                      )
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <DeleteButton
                      action={deleteBrand}
                      hidden={{ lang, id: b.id }}
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
