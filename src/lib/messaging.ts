import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import type { NotificationData } from "./notify-format";

export type MessageView = {
  id: string;
  senderRole: "user" | "admin";
  body: string;
  createdAt: Date;
};

export type NotificationView = {
  id: string;
  type: string;
  data: NotificationData;
  href: string | null;
  read: boolean;
  createdAt: Date;
};

export type SentMessage = { id: string; body: string; createdAt: string };

const MAX_LEN = 2000;

// ---------------- Notifications ----------------
// Delivery is via the SSE stream polling the DB (see app/api/stream) — no in-process bus,
// so it works across dev workers and multi-instance deployments.

export async function createNotification(
  userId: string,
  input: { type: string; data?: NotificationData; href?: string | null },
): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      type: input.type,
      data:
        input.data === undefined || input.data === null
          ? undefined
          : (input.data as Prisma.InputJsonValue),
      href: input.href ?? null,
    },
  });
}

export async function getNotifications(
  userId: string,
  take = 20,
): Promise<NotificationView[]> {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    data: (r.data as unknown as NotificationData) ?? null,
    href: r.href,
    read: r.read,
    createdAt: r.createdAt,
  }));
}

export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

// ---------------- Messages ----------------

export async function getThread(threadUserId: string): Promise<MessageView[]> {
  const rows = await prisma.message.findMany({
    where: { threadUserId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    senderRole: r.senderRole as "user" | "admin",
    body: r.body,
    createdAt: r.createdAt,
  }));
}

export async function markThreadReadByUser(threadUserId: string): Promise<void> {
  await prisma.message.updateMany({
    where: { threadUserId, senderRole: "admin", read: false },
    data: { read: true },
  });
}

export async function markThreadReadByAdmin(threadUserId: string): Promise<void> {
  await prisma.message.updateMany({
    where: { threadUserId, senderRole: "user", read: false },
    data: { read: true },
  });
}

// New customer messages for the admin thread view (lightweight polling).
export async function getThreadMessagesSince(
  threadUserId: string,
  since: Date,
): Promise<MessageView[]> {
  const rows = await prisma.message.findMany({
    where: { threadUserId, createdAt: { gt: since } },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    senderRole: r.senderRole as "user" | "admin",
    body: r.body,
    createdAt: r.createdAt,
  }));
}

export async function sendUserMessage(
  userId: string,
  userName: string,
  body: string,
): Promise<SentMessage | null> {
  const text = body.trim().slice(0, MAX_LEN);
  if (!text) return null;
  const msg = await prisma.message.create({
    data: { threadUserId: userId, senderRole: "user", body: text },
  });
  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    select: { id: true },
  });
  for (const a of admins) {
    await createNotification(a.id, {
      type: "message_user",
      data: { name: userName },
      href: "/admin",
    });
  }
  return { id: msg.id, body: text, createdAt: msg.createdAt.toISOString() };
}

// Used by the admin panel (Phase 6).
export async function sendAdminMessage(
  threadUserId: string,
  body: string,
): Promise<SentMessage | null> {
  const text = body.trim().slice(0, MAX_LEN);
  if (!text) return null;
  const msg = await prisma.message.create({
    data: { threadUserId, senderRole: "admin", body: text },
  });
  await createNotification(threadUserId, {
    type: "message_admin",
    href: "/messages",
  });
  return { id: msg.id, body: text, createdAt: msg.createdAt.toISOString() };
}
