"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  sendUserMessage,
  markNotificationsRead,
  markThreadReadByUser,
} from "@/lib/messaging";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export type MessageActionState = {
  ok?: boolean;
  error?: string;
  message?: { id: string; body: string; createdAt: string };
} | null;

function safeLang(value: FormDataEntryValue | null): Locale {
  const s = String(value ?? "");
  return isLocale(s) ? s : defaultLocale;
}

export async function sendMessageAction(
  _prev: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  const lang = safeLang(formData.get("lang"));
  const body = String(formData.get("body") ?? "");

  const user = await getCurrentUser();
  if (!user) return { error: "auth" };
  if (!body.trim()) return { error: "empty" };

  const sent = await sendUserMessage(user.id, user.name, body);
  revalidatePath(`/${lang}/messages`);
  return { ok: true, message: sent ?? undefined };
}

export async function markNotificationsReadAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user) await markNotificationsRead(user.id);
}

export async function markThreadReadAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user) await markThreadReadByUser(user.id);
}
