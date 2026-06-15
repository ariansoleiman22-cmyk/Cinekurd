import type { Dictionary } from "@/i18n/types";
import { interpolate } from "./utils";

export type NotificationData = Record<string, unknown> | null;

// Notifications are localized at render time from (type, data) — never stored as text.
export function notificationText(
  dict: Dictionary,
  type: string,
  data: NotificationData,
): string {
  const n = dict.notifications;
  const d = (data ?? {}) as Record<string, string>;
  switch (type) {
    case "booking_received":
      return interpolate(n.bookingReceived, { product: d.product ?? "" });
    case "booking_new":
      return interpolate(n.bookingNew, {
        product: d.product ?? "",
        name: d.name ?? "",
      });
    case "message_user":
      return interpolate(n.messageFromUser, { name: d.name ?? "" });
    case "message_admin":
      return n.messageFromAdmin;
    case "booking_status": {
      const statuses = dict.booking.status as Record<string, string>;
      const statusLabel = statuses[d.status] ?? d.status ?? "";
      return interpolate(n.bookingStatus, {
        product: d.product ?? "",
        status: statusLabel,
      });
    }
    default:
      return n.generic;
  }
}
