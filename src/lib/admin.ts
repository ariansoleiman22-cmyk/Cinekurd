import "server-only";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getCurrentUser, type SessionUser } from "./auth";
import { prisma } from "./db";
import type { Trilingual, Spec } from "./catalog";

export async function requireAdmin(lang: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/login`);
  if (user.role !== "admin") redirect(`/${lang}`);
  return user;
}

export type AdminProduct = {
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

export type AdminProductRow = {
  id: string;
  slug: string;
  name: Trilingual;
  category: string;
  brandName: string;
  stock: number;
  maxPerAccount: number;
  featured: boolean;
  imageUrl: string | null;
};

export async function getDashboardStats() {
  const [products, brands, users, pending, confirmed, unreadMessages, lowStock] =
    await Promise.all([
      prisma.product.count(),
      prisma.brand.count(),
      prisma.user.count(),
      prisma.booking.count({ where: { status: "pending" } }),
      prisma.booking.count({ where: { status: "confirmed" } }),
      prisma.message.count({ where: { senderRole: "user", read: false } }),
      prisma.product.count({ where: { stock: { lte: 2 } } }),
    ]);
  return { products, brands, users, pending, confirmed, unreadMessages, lowStock };
}

export type AdminBookingRow = {
  id: string;
  quantity: number;
  status: string;
  createdAt: Date;
  userName: string;
  userEmail: string;
  productName: Trilingual;
  productSlug: string;
};

export async function getRecentBookings(take = 8): Promise<AdminBookingRow[]> {
  return mapBookings(
    await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
    }),
  );
}

export async function getAllBookings(): Promise<AdminBookingRow[]> {
  return mapBookings(
    await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
    }),
  );
}

function mapBookings(
  rows: Array<{
    id: string;
    quantity: number;
    status: string;
    createdAt: Date;
    user: { name: string; email: string };
    product: { name: unknown; slug: string };
  }>,
): AdminBookingRow[] {
  return rows.map((r) => ({
    id: r.id,
    quantity: r.quantity,
    status: r.status,
    createdAt: r.createdAt,
    userName: r.user.name,
    userEmail: r.user.email,
    productName: r.product.name as Trilingual,
    productSlug: r.product.slug,
  }));
}

export async function getAllProductsAdmin(): Promise<AdminProductRow[]> {
  const rows = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    include: { brand: { select: { name: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name as Trilingual,
    category: r.category,
    brandName: r.brand.name,
    stock: r.stock,
    maxPerAccount: r.maxPerAccount,
    featured: r.featured,
    imageUrl: r.imageUrl,
  }));
}

export async function getProductForEdit(id: string): Promise<AdminProduct | null> {
  const r = await prisma.product.findUnique({ where: { id } });
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    category: r.category,
    subtype: r.subtype,
    imageUrl: r.imageUrl,
    brandId: r.brandId,
    name: r.name as Trilingual,
    description: r.description as Trilingual,
    specs: (r.specs as Spec[]) ?? [],
    stock: r.stock,
    maxPerAccount: r.maxPerAccount,
    featured: r.featured,
    releaseYear: r.releaseYear,
  };
}

export type AdminBrand = {
  id: string;
  slug: string;
  name: string;
  country: string;
  foundedYear: number | null;
  categories: string[];
  description: Trilingual;
};

export async function getAllBrandsAdmin(): Promise<
  (AdminBrand & { productCount: number })[]
> {
  const rows = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    country: r.country,
    foundedYear: r.foundedYear,
    categories: (r.categories as string[]) ?? [],
    description: r.description as Trilingual,
    productCount: r._count.products,
  }));
}

export async function getBrandForEdit(id: string): Promise<AdminBrand | null> {
  const r = await prisma.brand.findUnique({ where: { id } });
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    country: r.country,
    foundedYear: r.foundedYear,
    categories: (r.categories as string[]) ?? [],
    description: r.description as Trilingual,
  };
}

export async function getBrandOptions(): Promise<{ id: string; name: string }[]> {
  return prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

// Brands are hidden from the UI, but Product.brandId is still required in the DB.
// Every product is linked to one internal brand so nothing brand-related is shown
// and no database migration is needed. Reuses an existing brand if there is one.
export async function getDefaultBrandId(): Promise<string> {
  const existing = await prisma.brand.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await prisma.brand.create({
    data: {
      slug: "cine-kurd",
      name: "Cine Kurd",
      country: "",
      categories: [] as unknown as Prisma.InputJsonValue,
      description: { en: "", ar: "", ckb: "" } as unknown as Prisma.InputJsonValue,
    },
    select: { id: true },
  });
  return created.id;
}

// ---------------- Admin message threads ----------------

export type ThreadSummary = {
  userId: string;
  name: string;
  email: string;
  lastAt: Date | null;
  unread: number;
};

export async function getThreadList(): Promise<ThreadSummary[]> {
  const groups = await prisma.message.groupBy({
    by: ["threadUserId"],
    _max: { createdAt: true },
  });
  if (groups.length === 0) return [];
  const unreadGroups = await prisma.message.groupBy({
    by: ["threadUserId"],
    where: { senderRole: "user", read: false },
    _count: { _all: true },
  });
  const unreadMap = new Map(
    unreadGroups.map((g) => [g.threadUserId, g._count._all]),
  );
  const users = await prisma.user.findMany({
    where: { id: { in: groups.map((g) => g.threadUserId) } },
    select: { id: true, name: true, email: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));
  return groups
    .map((g) => {
      const u = userMap.get(g.threadUserId);
      return {
        userId: g.threadUserId,
        name: u?.name ?? "—",
        email: u?.email ?? "",
        lastAt: g._max.createdAt,
        unread: unreadMap.get(g.threadUserId) ?? 0,
      };
    })
    .sort((a, b) => (b.lastAt?.getTime() ?? 0) - (a.lastAt?.getTime() ?? 0));
}

export async function getThreadUser(
  userId: string,
): Promise<{ id: string; name: string; email: string } | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
}
