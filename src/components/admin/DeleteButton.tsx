"use client";

import { useFormStatus } from "react-dom";

function Inner({
  label,
  confirmText,
  className,
}: {
  label: string;
  confirmText: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
      className={className}
    >
      {pending ? "…" : label}
    </button>
  );
}

export function DeleteButton({
  action,
  hidden,
  label,
  confirmText,
  className,
}: {
  action: (fd: FormData) => Promise<void>;
  hidden: Record<string, string>;
  label: string;
  confirmText: string;
  className?: string;
}) {
  return (
    <form action={action} className="contents">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <Inner label={label} confirmText={confirmText} className={className} />
    </form>
  );
}
