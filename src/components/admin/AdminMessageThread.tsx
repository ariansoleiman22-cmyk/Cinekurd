"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  sendAdminReply,
  fetchAdminThreadSince,
  type AdminReplyState,
} from "@/lib/actions/admin";
import { cn } from "@/lib/utils";
import { Send } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type Msg = {
  id: string;
  senderRole: "user" | "admin";
  body: string;
  createdAt: string;
};

function fmtTime(iso: string, lang: Locale): string {
  try {
    return new Intl.DateTimeFormat(lang, { timeStyle: "short" }).format(
      new Date(iso),
    );
  } catch {
    return "";
  }
}

export function AdminMessageThread({
  lang,
  dict,
  threadUserId,
  initialMessages,
}: {
  lang: Locale;
  dict: Dictionary;
  threadUserId: string;
  initialMessages: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [state, formAction, pending] = useActionState<AdminReplyState, FormData>(
    sendAdminReply,
    null,
  );
  const lastRef = useRef(
    initialMessages.length
      ? initialMessages[initialMessages.length - 1].createdAt
      : new Date(0).toISOString(),
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const fresh = await fetchAdminThreadSince(threadUserId, lastRef.current);
        if (fresh.length) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            const add = fresh.filter((m) => !ids.has(m.id));
            if (!add.length) return prev;
            lastRef.current = add[add.length - 1].createdAt;
            return [...prev, ...add];
          });
        }
      } catch {
        /* ignore poll error */
      }
    }, 3000);
    return () => clearInterval(id);
  }, [threadUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      const m = state.message;
      if (m) {
        setMessages((prev) =>
          prev.some((x) => x.id === m.id)
            ? prev
            : [...prev, { id: m.id, senderRole: "admin", body: m.body, createdAt: m.createdAt }],
        );
        lastRef.current = m.createdAt;
      }
    }
  }, [state]);

  return (
    <div className="flex flex-col">
      <div className="flex max-h-[55vh] min-h-64 flex-col gap-3 overflow-y-auto py-2">
        {messages.length === 0 ? (
          <p className="my-auto text-center text-sm text-muted">
            {dict.messages.empty}
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                m.senderRole === "admin"
                  ? "ms-auto bg-gold/15 text-cream"
                  : "me-auto bg-surface-2 text-cream/90",
              )}
            >
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              <span className="mt-1 block text-[10px] text-muted-dark">
                {fmtTime(m.createdAt, lang)}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="mt-4 flex items-end gap-2 border-t border-white/5 pt-4"
      >
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="threadUserId" value={threadUserId} />
        <textarea
          name="body"
          rows={1}
          required
          placeholder={dict.admin.messages.placeholder}
          className="max-h-32 flex-1 resize-y rounded-xl border border-white/10 bg-surface/60 px-4 py-2.5 text-cream outline-none placeholder:text-muted-dark focus:border-gold/60"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label={dict.admin.messages.send}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition-colors hover:bg-gold-light disabled:opacity-60"
        >
          <Send className="h-5 w-5 rtl:-scale-x-100" />
        </button>
      </form>
    </div>
  );
}
