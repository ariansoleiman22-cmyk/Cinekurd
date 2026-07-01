"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { requireAdmin, getDefaultBrandId } from "@/lib/admin";
import { saveImage } from "@/lib/upload";
import { createNotification, sendAdminMessage, getThreadMessagesSince } from "@/lib/messaging";
import { adminSetBookingStatus } from "@/lib/bookings";
import {
  isCategory,
  pick,
  CATALOG_TAG,
  type Trilingual,
  type Spec,
} from "@/lib/catalog";
import { Prisma } from "@prisma/client";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export type FormState = { error?: string; ok?: boolean } | null;

function safeLang(value: FormDataEntryValue | null): Locale {
  const s = String(value ?? "");
  return isLocale(s) ? s : defaultLocale;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function tri(fd: FormData, base: string): Trilingual {
  const en = String(fd.get(`${base}_en`) ?? "").trim();
  const ar = String(fd.get(`${base}_ar`) ?? "").trim();
  const ckb = String(fd.get(`${base}_ckb`) ?? "").trim();
  return { en, ar: ar || en, ckb: ckb || en };
}

function parseSpecs(raw: string): Spec[] {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .map((s) => ({
        label: String(s?.label ?? "").trim(),
        value: String(s?.value ?? "").trim(),
      }))
      .filter((s) => s.label && s.value)
      .slice(0, 12);
  } catch {
    return [];
  }
}

async function resolveImage(
  fd: FormData,
  current: string | null,
): Promise<{ url: string | null } | { error: string }> {
  const file = fd.get("image");
  if (file instanceof File && file.size > 0) {
    const res = await saveImage(file);
    if ("error" in res) return { error: `image_${res.error}` };
    return { url: res.url };
  }
  return { url: current };
}

// ---------------- Products ----------------

export async function createProduct(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const lang = safeLang(fd.get("lang"));
  await requireAdmin(lang);

  const slug = String(fd.get("slug") ?? "").trim().toLowerCase();
  const category = String(fd.get("category") ?? "");
  const name = tri(fd, "name");
  const description = tri(fd, "description");

  if (!SLUG_RE.test(slug)) return { error: "slug" };
  if (!isCategory(category)) return { error: "category" };
  if (!name.en) return { error: "name" };

  const subtypeRaw = String(fd.get("subtype") ?? "").trim();
  const subtype = category === "accessories" ? subtypeRaw || "other" : null;
  const stock = Math.max(0, Math.floor(Number(fd.get("stock") ?? "0")) || 0);
  const maxPerAccount = Math.max(
    1,
    Math.floor(Number(fd.get("maxPerAccount") ?? "1")) || 1,
  );
  const featured = fd.get("featured") === "on";
  const releaseYearRaw = Number(fd.get("releaseYear") ?? "");
  const releaseYear = Number.isFinite(releaseYearRaw) && releaseYearRaw > 0
    ? Math.floor(releaseYearRaw)
    : null;
  const specs = parseSpecs(String(fd.get("specs") ?? "[]"));

  const image = await resolveImage(fd, null);
  if ("error" in image) return { error: image.error };

  // Brands are hidden from the UI; every product is linked to one internal brand.
  const brandId = await getDefaultBrandId();

  try {
    await prisma.product.create({
      data: {
        slug,
        category,
        subtype,
        imageUrl: image.url,
        brandId,
        name: name as unknown as Prisma.InputJsonValue,
        description: description as unknown as Prisma.InputJsonValue,
        specs: specs as unknown as Prisma.InputJsonValue,
        stock,
        maxPerAccount,
        featured,
        releaseYear,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "slug_taken" };
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return { error: "brand" };
    }
    return { error: "generic" };
  }

  revalidateTag(CATALOG_TAG, "max");
  revalidatePath(`/${lang}/admin/products`);
  redirect(`/${lang}/admin/products`);
}

export async function updateProduct(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const lang = safeLang(fd.get("lang"));
  await requireAdmin(lang);
  const id = String(fd.get("id") ?? "");
  if (!id) return { error: "generic" };

  const slug = String(fd.get("slug") ?? "").trim().toLowerCase();
  const category = String(fd.get("category") ?? "");
  const name = tri(fd, "name");
  const description = tri(fd, "description");
  if (!SLUG_RE.test(slug)) return { error: "slug" };
  if (!isCategory(category)) return { error: "category" };
  if (!name.en) return { error: "name" };

  const subtypeRaw = String(fd.get("subtype") ?? "").trim();
  const subtype = category === "accessories" ? subtypeRaw || "other" : null;
  const stock = Math.max(0, Math.floor(Number(fd.get("stock") ?? "0")) || 0);
  const maxPerAccount = Math.max(
    1,
    Math.floor(Number(fd.get("maxPerAccount") ?? "1")) || 1,
  );
  const featured = fd.get("featured") === "on";
  const releaseYearRaw = Number(fd.get("releaseYear") ?? "");
  const releaseYear = Number.isFinite(releaseYearRaw) && releaseYearRaw > 0
    ? Math.floor(releaseYearRaw)
    : null;
  const specs = parseSpecs(String(fd.get("specs") ?? "[]"));
  const currentImage = String(fd.get("currentImageUrl") ?? "") || null;

  const image = await resolveImage(fd, currentImage);
  if ("error" in image) return { error: image.error };

  try {
    await prisma.product.update({
      where: { id },
      data: {
        slug,
        category,
        subtype,
        imageUrl: image.url,
        name: name as unknown as Prisma.InputJsonValue,
        description: description as unknown as Prisma.InputJsonValue,
        specs: specs as unknown as Prisma.InputJsonValue,
        stock,
        maxPerAccount,
        featured,
        releaseYear,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "slug_taken" };
    }
    return { error: "generic" };
  }

  revalidateTag(CATALOG_TAG, "max");
  revalidatePath(`/${lang}/admin/products`);
  redirect(`/${lang}/admin/products`);
}

export async function deleteProduct(fd: FormData): Promise<void> {
  const lang = safeLang(fd.get("lang"));
  await requireAdmin(lang);
  const id = String(fd.get("id") ?? "");
  if (id) await prisma.product.delete({ where: { id } }).catch(() => {});
  revalidateTag(CATALOG_TAG, "max");
  revalidatePath(`/${lang}/admin/products`);
  redirect(`/${lang}/admin/products`);
}

// ---------------- Brands ----------------

export async function createBrand(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const lang = safeLang(fd.get("lang"));
  await requireAdmin(lang);

  const slug = String(fd.get("slug") ?? "").trim().toLowerCase();
  const name = String(fd.get("name") ?? "").trim();
  const country = String(fd.get("country") ?? "").trim();
  const description = tri(fd, "description");
  const categories = fd
    .getAll("categories")
    .map((c) => String(c))
    .filter(isCategory);
  const foundedRaw = Number(fd.get("foundedYear") ?? "");
  const foundedYear =
    Number.isFinite(foundedRaw) && foundedRaw > 0 ? Math.floor(foundedRaw) : null;

  if (!SLUG_RE.test(slug)) return { error: "slug" };
  if (!name) return { error: "name" };
  if (!country) return { error: "country" };
  if (categories.length === 0) return { error: "categories" };

  try {
    await prisma.brand.create({
      data: {
        slug,
        name,
        country,
        foundedYear,
        categories: categories as unknown as Prisma.InputJsonValue,
        description: description as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "slug_taken" };
    }
    return { error: "generic" };
  }

  revalidateTag(CATALOG_TAG, "max");
  revalidatePath(`/${lang}/admin/brands`);
  redirect(`/${lang}/admin/brands`);
}

export async function updateBrand(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const lang = safeLang(fd.get("lang"));
  await requireAdmin(lang);
  const id = String(fd.get("id") ?? "");
  if (!id) return { error: "generic" };

  const slug = String(fd.get("slug") ?? "").trim().toLowerCase();
  const name = String(fd.get("name") ?? "").trim();
  const country = String(fd.get("country") ?? "").trim();
  const description = tri(fd, "description");
  const categories = fd
    .getAll("categories")
    .map((c) => String(c))
    .filter(isCategory);
  const foundedRaw = Number(fd.get("foundedYear") ?? "");
  const foundedYear =
    Number.isFinite(foundedRaw) && foundedRaw > 0 ? Math.floor(foundedRaw) : null;

  if (!SLUG_RE.test(slug)) return { error: "slug" };
  if (!name) return { error: "name" };
  if (!country) return { error: "country" };
  if (categories.length === 0) return { error: "categories" };

  try {
    await prisma.brand.update({
      where: { id },
      data: {
        slug,
        name,
        country,
        foundedYear,
        categories: categories as unknown as Prisma.InputJsonValue,
        description: description as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "slug_taken" };
    }
    return { error: "generic" };
  }

  revalidateTag(CATALOG_TAG, "max");
  revalidatePath(`/${lang}/admin/brands`);
  redirect(`/${lang}/admin/brands`);
}

export async function deleteBrand(fd: FormData): Promise<void> {
  const lang = safeLang(fd.get("lang"));
  await requireAdmin(lang);
  const id = String(fd.get("id") ?? "");
  if (id) await prisma.brand.delete({ where: { id } }).catch(() => {});
  revalidateTag(CATALOG_TAG, "max");
  revalidatePath(`/${lang}/admin/brands`);
  redirect(`/${lang}/admin/brands`);
}

// ---------------- Bookings ----------------

export async function setBookingStatusAction(fd: FormData): Promise<void> {
  const lang = safeLang(fd.get("lang"));
  await requireAdmin(lang);
  const bookingId = String(fd.get("bookingId") ?? "");
  const status = String(fd.get("status") ?? "");
  if (
    bookingId &&
    (status === "confirmed" || status === "cancelled" || status === "completed")
  ) {
    const result = await adminSetBookingStatus(bookingId, status);
    if (result.ok) {
      await createNotification(result.userId, {
        type: "booking_status",
        data: { product: pick(result.name, "en"), status: result.status },
        href: "/account",
      });
    }
  }
  revalidateTag(CATALOG_TAG, "max");
  revalidatePath(`/${lang}/admin/bookings`);
  redirect(`/${lang}/admin/bookings`);
}

// ---------------- Admin messaging ----------------

export type AdminReplyState = {
  ok?: boolean;
  error?: string;
  message?: { id: string; body: string; createdAt: string };
} | null;

export async function sendAdminReply(
  _prev: AdminReplyState,
  fd: FormData,
): Promise<AdminReplyState> {
  const lang = safeLang(fd.get("lang"));
  await requireAdmin(lang);
  const threadUserId = String(fd.get("threadUserId") ?? "");
  const body = String(fd.get("body") ?? "");
  if (!threadUserId || !body.trim()) return { error: "empty" };
  const sent = await sendAdminMessage(threadUserId, body);
  revalidatePath(`/${lang}/admin/messages/${threadUserId}`);
  return { ok: true, message: sent ?? undefined };
}

export async function fetchAdminThreadSince(
  threadUserId: string,
  sinceISO: string,
): Promise<{ id: string; senderRole: "user" | "admin"; body: string; createdAt: string }[]> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return [];
  const since = new Date(sinceISO);
  const rows = await getThreadMessagesSince(threadUserId, since);
  return rows.map((m) => ({
    id: m.id,
    senderRole: m.senderRole,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  }));
}
