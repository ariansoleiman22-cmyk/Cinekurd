"use client";

import { useActionState } from "react";
import { createBrand, updateBrand, type FormState } from "@/lib/actions/admin";
import { CATEGORIES } from "@/lib/constants";
import type { Trilingual } from "@/lib/constants";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type EditBrand = {
  id: string;
  slug: string;
  name: string;
  country: string;
  foundedYear: number | null;
  categories: string[];
  description: Trilingual;
};

const input =
  "w-full rounded-xl border border-white/10 bg-surface/60 px-4 py-2.5 text-cream outline-none placeholder:text-muted-dark focus:border-gold/60";
const label = "mb-1.5 block text-sm text-cream/80";

export function BrandForm({
  lang,
  dict,
  brand,
}: {
  lang: Locale;
  dict: Dictionary;
  brand?: EditBrand;
}) {
  const action = brand ? updateBrand : createBrand;
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    null,
  );
  const t = dict.admin.brands;
  const err = state?.error
    ? dict.admin.errors[state.error as keyof typeof dict.admin.errors] ??
      dict.admin.errors.generic
    : null;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="lang" value={lang} />
      {brand && <input type="hidden" name="id" value={brand.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>{t.name}</label>
          <input name="name" required defaultValue={brand?.name} placeholder="ARRI" className={input} />
        </div>
        <div>
          <label className={label}>{t.slug}</label>
          <input name="slug" required defaultValue={brand?.slug} placeholder="arri" className={input} />
        </div>
        <div>
          <label className={label}>{t.country}</label>
          <input name="country" required defaultValue={brand?.country} className={input} />
        </div>
        <div>
          <label className={label}>{t.founded}</label>
          <input name="foundedYear" type="number" min={1800} defaultValue={brand?.foundedYear ?? ""} className={input} />
        </div>
      </div>

      <div>
        <span className={label}>{t.categories}</span>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-cream/80">
              <input
                type="checkbox"
                name="categories"
                value={c}
                defaultChecked={brand?.categories.includes(c)}
                className="h-4 w-4 accent-[#c9a24b]"
              />
              {dict.categoryPages[c].title}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label}>{t.descEn}</label>
          <textarea name="description_en" rows={3} defaultValue={brand?.description.en} className={input} />
        </div>
        <div>
          <label className={label}>{t.descAr}</label>
          <textarea name="description_ar" rows={3} dir="rtl" defaultValue={brand?.description.ar} className={input} />
        </div>
        <div>
          <label className={label}>{t.descCkb}</label>
          <textarea name="description_ckb" rows={3} dir="rtl" defaultValue={brand?.description.ckb} className={input} />
        </div>
      </div>

      {err && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">
          {err}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-gold px-8 py-3 text-sm font-medium text-ink transition-colors hover:bg-gold-light disabled:opacity-60"
      >
        {pending ? t.saving : t.save}
      </button>
    </form>
  );
}
