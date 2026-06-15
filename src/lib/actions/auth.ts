"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
} from "@/lib/auth";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export type AuthState = { error: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeLang(value: FormDataEntryValue | null): Locale {
  const s = String(value ?? "");
  return isLocale(s) ? s : defaultLocale;
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const lang = safeLang(formData.get("lang"));
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { error: "name" };
  if (!EMAIL_RE.test(email)) return { error: "email" };
  if (password.length < 8) return { error: "password" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "exists" };

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });
  await createSession(user.id);

  redirect(`/${lang}/account`);
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const lang = safeLang(formData.get("lang"));
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email) || !password) return { error: "invalid" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "invalid" };
  }

  await createSession(user.id);
  redirect(`/${lang}/account`);
}

export async function logoutAction(formData: FormData): Promise<void> {
  const lang = safeLang(formData.get("lang"));
  await destroySession();
  redirect(`/${lang}`);
}
