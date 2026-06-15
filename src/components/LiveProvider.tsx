"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { NotificationData } from "@/lib/notify-format";

export type ClientNotification = {
  id: string;
  type: string;
  data: NotificationData;
  href: string | null;
  read: boolean;
  createdAt: string;
};

export type LiveMessage = {
  id: string;
  threadUserId: string;
  senderRole: "user" | "admin";
  body: string;
  createdAt: string;
};

type LiveContextValue = {
  notifications: ClientNotification[];
  unread: number;
  markAllRead: () => void;
  onMessage: (cb: (m: LiveMessage) => void) => () => void;
};

const LiveContext = createContext<LiveContextValue | null>(null);

export function useLive(): LiveContextValue {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error("useLive must be used within <LiveProvider>");
  return ctx;
}

export function LiveProvider({
  enabled,
  initialNotifications,
  initialUnread,
  markReadAction,
  children,
}: {
  enabled: boolean;
  initialNotifications: ClientNotification[];
  initialUnread: number;
  markReadAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] =
    useState<ClientNotification[]>(initialNotifications);
  const [unread, setUnread] = useState(initialUnread);
  const messageListeners = useRef(new Set<(m: LiveMessage) => void>());

  useEffect(() => {
    if (!enabled) return;
    const source = new EventSource("/api/stream");
    source.onmessage = (e) => {
      try {
        const evt = JSON.parse(e.data);
        if (evt.kind === "notification") {
          const incoming = {
            id: evt.id,
            type: evt.type,
            data: evt.data ?? null,
            href: evt.href ?? null,
            read: false,
            createdAt: evt.createdAt,
          };
          setNotifications((prev) =>
            prev.some((n) => n.id === incoming.id)
              ? prev
              : [incoming, ...prev].slice(0, 30),
          );
          setUnread((u) => u + 1);
        } else if (evt.kind === "message") {
          messageListeners.current.forEach((cb) => cb(evt as LiveMessage));
        }
      } catch {
        /* ignore malformed event */
      }
    };
    source.onerror = () => {
      /* EventSource auto-reconnects */
    };
    return () => source.close();
  }, [enabled]);

  const markAllRead = useCallback(() => {
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    void markReadAction();
  }, [markReadAction]);

  const onMessage = useCallback((cb: (m: LiveMessage) => void) => {
    messageListeners.current.add(cb);
    return () => {
      messageListeners.current.delete(cb);
    };
  }, []);

  return (
    <LiveContext.Provider
      value={{ notifications, unread, markAllRead, onMessage }}
    >
      {children}
    </LiveContext.Provider>
  );
}
