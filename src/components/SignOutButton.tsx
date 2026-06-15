"use client";

import { useFormStatus } from "react-dom";
import { logoutAction } from "@/lib/actions/auth";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

function Inner({ label, className }: { label: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "…" : label}
    </button>
  );
}

export function SignOutButton({
  lang,
  label,
  className,
}: {
  lang: Locale;
  label: string;
  className?: string;
}) {
  return (
    <form action={logoutAction} className="contents">
      <input type="hidden" name="lang" value={lang} />
      <Inner label={label} className={cn(className)} />
    </form>
  );
}
