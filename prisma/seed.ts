import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

type Tri = { en: string; ar: string; ckb: string };
type Brand = {
  slug: string;
  name: string;
  country: string;
  foundedYear?: number;
  categories: string[];
  description: Tri;
};
type Product = {
  slug: string;
  category: string;
  subtype?: string;
  brandSlug: string;
  name: Tri;
  description: Tri;
  specs: { label: string; value: string }[];
  stock: number;
  maxPerAccount: number;
  featured: boolean;
  releaseYear?: number;
};
type Catalog = { brands: Brand[]; products: Product[] };

function dedupeBySlug<T extends { slug: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    out.push(item);
  }
  return out;
}

async function main() {
  const file = join(process.cwd(), "prisma", "catalog.json");
  const catalog: Catalog = JSON.parse(readFileSync(file, "utf8"));

  const brands = dedupeBySlug(catalog.brands ?? []);
  const products = dedupeBySlug(catalog.products ?? []);
  console.log(`Seeding ${brands.length} brands, ${products.length} products...`);

  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();

  const brandIdBySlug = new Map<string, string>();
  for (const b of brands) {
    const created = await prisma.brand.create({
      data: {
        slug: b.slug,
        name: b.name,
        country: b.country,
        foundedYear: b.foundedYear ?? null,
        categories: b.categories,
        description: b.description,
      },
    });
    brandIdBySlug.set(b.slug, created.id);
  }

  let skipped = 0;
  for (const p of products) {
    const brandId = brandIdBySlug.get(p.brandSlug);
    if (!brandId) {
      skipped++;
      console.warn(`  ! skip "${p.slug}": unknown brand "${p.brandSlug}"`);
      continue;
    }
    const subtype =
      p.category === "accessories" ? p.subtype || "other" : null;
    await prisma.product.create({
      data: {
        slug: p.slug,
        category: p.category,
        subtype,
        brandId,
        name: p.name,
        description: p.description,
        specs: p.specs ?? [],
        stock: p.stock ?? 0,
        maxPerAccount: p.maxPerAccount ?? 1,
        featured: Boolean(p.featured),
        releaseYear: p.releaseYear ?? null,
      },
    });
  }

  const [brandCount, productCount] = await Promise.all([
    prisma.brand.count(),
    prisma.product.count(),
  ]);
  console.log(
    `Done. Brands: ${brandCount}, Products: ${productCount}${
      skipped ? `, skipped: ${skipped}` : ""
    }`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
