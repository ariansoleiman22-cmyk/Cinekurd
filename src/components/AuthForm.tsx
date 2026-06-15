"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import {
  signupAction,
  loginAction,
  type AuthState,
} from "@/lib/actions/auth";

function Field({
  name,
  type,
  label,
  autoComplete,
  hint,
}: {
  name: string;
  type: string;
  label: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-cream/80">{label}</span>
      <input
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-white/10 bg-surface/60 px-4 py-3 text-cream outline-none transition-colors placeholder:text-muted-dark focus:border-gold/60"
      />
      {hint && <span className="mt-1 block text-xs text-muted-dark">{hint}</span>}
    </label>
  );
}

export function AuthForm({
  mode,
  lang,
  dict,
}: {
  mode: "login" | "signup";
  lang: Locale;
  dict: Dictionary;
}) {
  const action = mode === "signup" ? signupAction : loginAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    null,
  );
  const t = dict.auth;
  const errorMessage = state?.error
    ? t.errors[state.error as keyof typeof t.errors] ?? t.errors.invalid
    : null;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="lang" value={lang} />

      {mode === "signup" && (
        <Field name="name" type="text" label={t.name} autoComplete="name" />
      )}
      <Field
        name="email"
        type="email"
        label={t.email}
        autoComplete="email"
      />
      <Field
        name="password"
        type="password"
        label={t.password}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        hint={mode === "signup" ? t.passwordHint : undefined}
      />

      {errorMessage && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gold py-3 text-sm font-medium text-ink transition-colors hover:bg-gold-light disabled:opacity-60"
      >
        {pending
          ? t.pleaseWait
          : mode === "signup"
            ? t.createAccount
            : t.signIn}
      </button>

      <p className="text-center text-sm text-muted">
        {mode === "signup" ? t.haveAccount : t.noAccount}{" "}
        <Link
          href={`/${lang}/${mode === "signup" ? "login" : "signup"}`}
          className="text-gold transition-colors hover:text-gold-light"
        >
          {mode === "signup" ? t.signIn : t.createAccount}
        </Link>
      </p>
    </form>
  );
}
