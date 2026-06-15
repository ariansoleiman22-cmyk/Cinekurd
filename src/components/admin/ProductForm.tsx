"use client";

import { useActionState, useState } from "react";
import { createProduct, updateProduct, type FormState } from "@/lib/actions/admin";
import { CATEGORIES, ACCESSORY_SUBTYPES } from "@/lib/constants";
import type { Trilingual, Spec } from "@/lib/constants";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type EditProduct = {
  id: string;
  slug: string;
  category: string;
  subtype: string | null;
  imageUrl: string | null;
  brandId: string;
  name: Trilingual;
  description: Trilingual;
  specs: Spec[];
  stock: number;
  maxPerAccount: number;
  featured: boolean;
  releaseYear: number | null;
};

const input =
  "w-full rounded-xl border border-white/10 bg-surface/60 px-4 py-2.5 text-cream outline-none placeholder:text-muted-dark focus:border-gold/60";
const label = "mb-1.5 block text-sm text-cream/80";

export function ProductForm({
  lang,
  dict,
  brands,
  product,
}: {
  lang: Locale;
  dict: Dictionary;
  brands: { id: string; name: string }[];
  product?: EditProduct;
}) {
  const isEdit = Boolean(product);
  const action = isEdit ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    null,
  );
  const [category, setCategory] = useState(product?.category ?? "camera");
  const [specs, setSpecs] = useState<Spec[]>(product?.specs ?? []);
  const [preview, setPreview] = useState<string | null>(product?.imageUrl ?? null);
  const t = dict.admin.products;
  const err = state?.error
    ? dict.admin.errors[state.error as keyof typeof dict.admin.errors] ??
      dict.admin.errors.generic
    : null;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="lang" value={lang} />
      {product && <input type="hidden" name="id" value={product.id} />}
      {product && (
        <input
          type="hidden"
          name="currentImageUrl"
          value={product.imageUrl ?? ""}
        />
      )}
      <input
        type="hidden"
        name="specs"
        value={JSON.stringify(specs.filter((s) => s.label && s.value))}
      />

      <div>
        <span className={label}>{t.image}</span>
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-surface-2">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-xs text-muted">
                {t.noImage}
              </span>
            )}
          </div>
          <div>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPreview(URL.createObjectURL(f));
              }}
              className="text-sm text-cream/80 file:me-3 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:text-sm file:text-ink"
            />
            <p className="mt-1 text-xs text-muted-dark">{t.imageHint}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>{t.slug}</label>
          <input
            name="slug"
            required
            defaultValue={product?.slug}
            placeholder="arri-alexa-35"
            className={input}
          />
        </div>
        <div>
          <label className={label}>{t.brand}</label>
          <select
            name="brandId"
            defaultValue={product?.brandId ?? ""}
            className={input}
          >
            <option value="" disabled>
              —
            </option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>{t.category}</label>
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={input}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {dict.categoryPages[c].title}
              </option>
            ))}
          </select>
        </div>
        {category === "accessories" && (
          <div>
            <label className={label}>{t.subtype}</label>
            <select
              name="subtype"
              defaultValue={product?.subtype ?? "stand"}
              className={input}
            >
              {ACCESSORY_SUBTYPES.map((s) => (
                <option key={s} value={s}>
                  {dict.subtypes[s]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label}>{t.nameEn}</label>
          <input name="name_en" required defaultValue={product?.name.en} className={input} />
        </div>
        <div>
          <label className={label}>{t.nameAr}</label>
          <input name="name_ar" dir="rtl" defaultValue={product?.name.ar} className={input} />
        </div>
        <div>
          <label className={label}>{t.nameCkb}</label>
          <input name="name_ckb" dir="rtl" defaultValue={product?.name.ckb} className={input} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label}>{t.descEn}</label>
          <textarea name="description_en" rows={3} defaultValue={product?.description.en} className={input} />
        </div>
        <div>
          <label className={label}>{t.descAr}</label>
          <textarea name="description_ar" rows={3} dir="rtl" defaultValue={product?.description.ar} className={input} />
        </div>
        <div>
          <label className={label}>{t.descCkb}</label>
          <textarea name="description_ckb" rows={3} dir="rtl" defaultValue={product?.description.ckb} className={input} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className={label}>{t.stock}</label>
          <input name="stock" type="number" min={0} defaultValue={product?.stock ?? 0} className={input} />
        </div>
        <div>
          <label className={label}>{t.maxPerAccount}</label>
          <input name="maxPerAccount" type="number" min={1} defaultValue={product?.maxPerAccount ?? 1} className={input} />
        </div>
        <div>
          <label className={label}>{t.releaseYear}</label>
          <input name="releaseYear" type="number" min={1900} defaultValue={product?.releaseYear ?? ""} className={input} />
        </div>
        <label className="flex items-end gap-2 pb-2.5">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} className="h-4 w-4 accent-[#c9a24b]" />
          <span className="text-sm text-cream/80">{t.featured}</span>
        </label>
      </div>

      <div>
        <span className={label}>{t.specs}</span>
        <div className="space-y-2">
          {specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={s.label}
                onChange={(e) =>
                  setSpecs((prev) =>
                    prev.map((sp, idx) => (idx === i ? { ...sp, label: e.target.value } : sp)),
                  )
                }
                placeholder={t.specLabel}
                className={input}
              />
              <input
                value={s.value}
                onChange={(e) =>
                  setSpecs((prev) =>
                    prev.map((sp, idx) => (idx === i ? { ...sp, value: e.target.value } : sp)),
                  )
                }
                placeholder={t.specValue}
                className={input}
              />
              <button
                type="button"
                onClick={() => setSpecs((prev) => prev.filter((_, idx) => idx !== i))}
                className="shrink-0 rounded-xl border border-white/10 px-3 text-muted hover:text-rose-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSpecs((prev) => [...prev, { label: "", value: "" }])}
          className="mt-2 rounded-full border border-white/15 px-4 py-1.5 text-sm text-cream/80 transition-colors hover:border-gold/40"
        >
          {t.addSpec}
        </button>
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
