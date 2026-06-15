import { unstable_cache } from "next/cache";
import { prisma } from "./db";
import type { Locale } from "@/i18n/config";
import { CATEGORIES, ACCESSORY_SUBTYPES, isCategory } from "./constants";
import type { Trilingual, Spec, Category, AccessorySubtype } from "./constants";

// Re-export client-safe primitives so existing `@/lib/catalog` imports keep working.
export { CATEGORIES, ACCESSORY_SUBTYPES, isCategory };
export type { Trilingual, Spec, Category, AccessorySubtype };

export type BrandView = {
  id: string;
  slug: string;
  name: string;
  country: string;
  foundedYear: number | null;
  categories: Category[];
  description: Trilingual;
  productCount: number;
};

export type ProductView = {
  id: string;
  slug: string;
  category: Category;
  subtype: string | null;
  imageUrl: string | null;
  brand: { slug: string; name: string };
  name: Trilingual;
  description: Trilingual;
  specs: Spec[];
  stock: number;
  maxPerAccount: number;
  featured: boolean;
  releaseYear: number | null;
};

// Catalogue queries are cached in Next's Data Cache under this tag and invalidated
// whenever the catalogue/stock changes (see revalidateTag(CATALOG_TAG) in actions).
export const CATALOG_TAG = "catalog";
const CATALOG_TTL = 300; // seconds (fallback refresh)

// ---------- Locale + stock helpers ----------

export function pick(value: Trilingual | null | undefined, lang: Locale): string {
  if (!value) return "";
  return value[lang] || value.en || "";
}

export type StockStatus = "out" | "low" | "in";

export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out";
  if (stock <= 2) return "low";
  return "in";
}

// ---------- Row mappers ----------

type ProductRow = {
  id: string;
  slug: string;
  category: string;
  subtype: string | null;
  imageUrl: string | null;
  name: unknown;
  description: unknown;
  specs: unknown;
  stock: number;
  maxPerAccount: number;
  featured: boolean;
  releaseYear: number | null;
  brand: { slug: string; name: string };
};

function toProduct(row: ProductRow): ProductView {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category as Category,
    subtype: row.subtype,
    imageUrl: row.imageUrl,
    brand: { slug: row.brand.slug, name: row.brand.name },
    name: row.name as Trilingual,
    description: row.description as Trilingual,
    specs: (row.specs as Spec[]) ?? [],
    stock: row.stock,
    maxPerAccount: row.maxPerAccount,
    featured: row.featured,
    releaseYear: row.releaseYear,
  };
}

const productInclude = { brand: { select: { slug: true, name: true } } } as const;
const productOrder = [
  { featured: "desc" as const },
  { stock: "desc" as const },
  { createdAt: "asc" as const },
];

const cacheOpts = { tags: [CATALOG_TAG], revalidate: CATALOG_TTL };

// ---------- Cached queries ----------

export async function getProductsByCategory(
  category: Category,
): Promise<ProductView[]> {
  return unstable_cache(
    async () => {
      const rows = await prisma.product.findMany({
        where: { category },
        include: productInclude,
        orderBy: productOrder,
      });
      return rows.map(toProduct);
    },
    ["products-by-category", category],
    cacheOpts,
  )();
}

export async function getProduct(slug: string): Promise<ProductView | null> {
  return unstable_cache(
    async () => {
      const row = await prisma.product.findUnique({
        where: { slug },
        include: productInclude,
      });
      return row ? toProduct(row) : null;
    },
    ["product", slug],
    cacheOpts,
  )();
}

export async function getRelatedProducts(
  category: Category,
  excludeSlug: string,
  limit = 4,
): Promise<ProductView[]> {
  return unstable_cache(
    async () => {
      const rows = await prisma.product.findMany({
        where: { category, slug: { not: excludeSlug } },
        include: productInclude,
        orderBy: productOrder,
        take: limit,
      });
      return rows.map(toProduct);
    },
    ["related", category, excludeSlug, String(limit)],
    cacheOpts,
  )();
}

export async function getFeaturedProducts(limit = 8): Promise<ProductView[]> {
  return unstable_cache(
    async () => {
      const rows = await prisma.product.findMany({
        where: { featured: true },
        include: productInclude,
        orderBy: productOrder,
        take: limit,
      });
      return rows.map(toProduct);
    },
    ["featured", String(limit)],
    cacheOpts,
  )();
}

export async function getCategoryShowcase(
  perCategory = 4,
): Promise<{ category: Category; products: ProductView[] }[]> {
  return unstable_cache(
    async () => {
      const groups = await Promise.all(
        CATEGORIES.map(async (category) => {
          const rows = await prisma.product.findMany({
            where: { category },
            include: productInclude,
            orderBy: productOrder,
            take: perCategory,
          });
          return { category, products: rows.map(toProduct) };
        }),
      );
      return groups.filter((g) => g.products.length > 0);
    },
    ["showcase", String(perCategory)],
    cacheOpts,
  )();
}

export async function getBrands(): Promise<BrandView[]> {
  return unstable_cache(
    async () => {
      const rows = await prisma.brand.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      });
      return rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        country: row.country,
        foundedYear: row.foundedYear,
        categories: (row.categories as Category[]) ?? [],
        description: row.description as Trilingual,
        productCount: row._count.products,
      }));
    },
    ["brands"],
    cacheOpts,
  )();
}

export async function getBrandWithProducts(
  slug: string,
): Promise<{ brand: BrandView; products: ProductView[] } | null> {
  return unstable_cache(
    async () => {
      const row = await prisma.brand.findUnique({
        where: { slug },
        include: {
          _count: { select: { products: true } },
          products: { include: productInclude, orderBy: productOrder },
        },
      });
      if (!row) return null;
      return {
        brand: {
          id: row.id,
          slug: row.slug,
          name: row.name,
          country: row.country,
          foundedYear: row.foundedYear,
          categories: (row.categories as Category[]) ?? [],
          description: row.description as Trilingual,
          productCount: row._count.products,
        },
        products: row.products.map(toProduct),
      };
    },
    ["brand-with-products", slug],
    cacheOpts,
  )();
}
