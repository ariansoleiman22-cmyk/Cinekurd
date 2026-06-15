"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLive } from "./LiveProvider";
import { Bell } from "./icons";
import { notificationText } from "@/lib/notify-format";
import type { Dictionary } from "@/i18n/types";
import type { Locale } from "@/i18n/config";

function fmtTime(iso: string, lang: Locale): string {
  try {
    return new Intl.DateTimeFormat(lang, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}

export function NotificationBell({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const { notifications, unread, markAllRead } = useLive();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) markAllRead();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={dict.notifications.title}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-cream/80 transition-colors hover:border-gold/40 hover:text-cream"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-80 max-w-[85vw] overflow-hidden rounded-xl glass hairline shadow-xl">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-medium text-cream">
            {dict.notifications.title}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted">
                {dict.notifications.empty}
              </p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={`/${lang}${n.href ?? "/account"}`}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/5 px-4 py-3 transition-colors last:border-0 hover:bg-white/5"
                >
                  <p className="text-sm text-cream/90">
                    {notificationText(dict, n.type, n.data)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-dark">
                    {fmtTime(n.createdAt, lang)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
