import { prisma } from "./db";
import type { Trilingual } from "./catalog";

export const ACTIVE_STATUSES = ["pending", "confirmed"] as const;
export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type BookingView = {
  id: string;
  quantity: number;
  status: BookingStatus;
  createdAt: Date;
  product: {
    slug: string;
    category: string;
    name: Trilingual;
    brand: string;
  };
};

export async function getUserBookings(userId: string): Promise<BookingView[]> {
  const rows = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: { include: { brand: { select: { name: true } } } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    quantity: r.quantity,
    status: r.status as BookingStatus,
    createdAt: r.createdAt,
    product: {
      slug: r.product.slug,
      category: r.product.category,
      name: r.product.name as Trilingual,
      brand: r.product.brand.name,
    },
  }));
}

// How many units of a product this user currently holds (active bookings only).
export async function getActiveBookedQty(
  userId: string,
  productId: string,
): Promise<number> {
  const agg = await prisma.booking.aggregate({
    _sum: { quantity: true },
    where: {
      userId,
      productId,
      status: { in: ACTIVE_STATUSES as unknown as string[] },
    },
  });
  return agg._sum.quantity ?? 0;
}

export type ReserveResult =
  | { ok: true }
  | { ok: false; error: "limit" | "stock" | "notfound" | "generic" };

// Atomic reservation: enforces per-account limit and oversell-safe stock decrement.
export async function reserveProduct(
  userId: string,
  productId: string,
  quantity: number,
): Promise<ReserveResult> {
  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("notfound");

      const agg = await tx.booking.aggregate({
        _sum: { quantity: true },
        where: {
          userId,
          productId,
          status: { in: ACTIVE_STATUSES as unknown as string[] },
        },
      });
      const already = agg._sum.quantity ?? 0;
      if (already + quantity > product.maxPerAccount) throw new Error("limit");

      const dec = await tx.product.updateMany({
        where: { id: productId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (dec.count === 0) throw new Error("stock");

      await tx.booking.create({
        data: { userId, productId, quantity, status: "pending" },
      });
    });
    return { ok: true };
  } catch (error) {
    const code = error instanceof Error ? error.message : "generic";
    if (code === "limit" || code === "stock" || code === "notfound") {
      return { ok: false, error: code };
    }
    return { ok: false, error: "generic" };
  }
}

// Cancel a user's active booking and return its units to stock.
export async function releaseBooking(
  userId: string,
  bookingId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.userId !== userId) return;
    if (!(ACTIVE_STATUSES as unknown as string[]).includes(booking.status)) {
      return;
    }
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "cancelled" },
    });
    await tx.product.update({
      where: { id: booking.productId },
      data: { stock: { increment: booking.quantity } },
    });
  });
}

export type AdminStatusResult =
  | { ok: true; name: Trilingual; userId: string; status: string }
  | { ok: false };

// Admin status change: cancel/complete from an active state returns units to stock.
export async function adminSetBookingStatus(
  bookingId: string,
  status: "confirmed" | "cancelled" | "completed",
): Promise<AdminStatusResult> {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { product: { select: { name: true } } },
    });
    if (!booking) return { ok: false as const };

    const wasActive = (ACTIVE_STATUSES as unknown as string[]).includes(
      booking.status,
    );
    if ((status === "cancelled" || status === "completed") && wasActive) {
      await tx.product.update({
        where: { id: booking.productId },
        data: { stock: { increment: booking.quantity } },
      });
    }
    await tx.booking.update({ where: { id: bookingId }, data: { status } });
    return {
      ok: true as const,
      name: booking.product.name as Trilingual,
      userId: booking.userId,
      status,
    };
  });
}
