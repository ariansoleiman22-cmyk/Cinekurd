"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { reserveProduct, releaseBooking } from "@/lib/bookings";
import { prisma } from "@/lib/db";
import { pick, type Trilingual } from "@/lib/catalog";
import { createNotification } from "@/lib/messaging";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export type BookingState = { ok?: boolean; error?: string } | null;

function safeLang(value: FormDataEntryValue | null): Locale {
  const s = String(value ?? "");
  return isLocale(s) ? s : defaultLocale;
}

export async function createBooking(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const lang = safeLang(formData.get("lang"));
  const productId = String(formData.get("productId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const quantity = Math.floor(Number(formData.get("quantity") ?? "1"));

  const user = await getCurrentUser();
  if (!user) return { error: "auth" };
  if (!productId || !Number.isFinite(quantity) || quantity < 1) {
    return { error: "quantity" };
  }

  const result = await reserveProduct(user.id, productId, quantity);
  if (!result.ok) return { error: result.error };

  // Notify the customer + any admins (delivered live via SSE).
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true },
  });
  const productName = product ? pick(product.name as Trilingual, lang) : "";
  await createNotification(user.id, {
    type: "booking_received",
    data: { product: productName },
    href: "/account",
  });
  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    select: { id: true },
  });
  for (const a of admins) {
    await createNotification(a.id, {
      type: "booking_new",
      data: { product: productName, name: user.name },
      href: "/admin",
    });
  }

  revalidatePath(`/${lang}/product/${slug}`);
  revalidatePath(`/${lang}/account`);
  return { ok: true };
}

export async function cancelBooking(formData: FormData): Promise<void> {
  const lang = safeLang(formData.get("lang"));
  const bookingId = String(formData.get("bookingId") ?? "");

  const user = await getCurrentUser();
  if (!user || !bookingId) redirect(`/${lang}/login`);

  await releaseBooking(user!.id, bookingId);

  revalidatePath(`/${lang}/account`);
  redirect(`/${lang}/account`);
}
