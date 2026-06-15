import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { NotificationData } from "@/lib/notify-format";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const POLL_MS = 2000;

// Server-Sent Events: streams new notifications + thread messages by polling the DB.
// DB is the shared source of truth, so this is correct across dev workers / instances.
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const userId = user.id;
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | undefined;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (obj: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        } catch {
          /* closed */
        }
      };

      send({ kind: "ready" });

      // Only stream events created after the connection opens.
      let sinceNotif = new Date();
      let sinceMsg = new Date();
      let ticks = 0;

      const poll = async () => {
        if (closed) return;
        try {
          const notifs = await prisma.notification.findMany({
            where: { userId, createdAt: { gt: sinceNotif } },
            orderBy: { createdAt: "asc" },
            take: 20,
          });
          for (const n of notifs) {
            send({
              kind: "notification",
              id: n.id,
              type: n.type,
              data: (n.data as unknown as NotificationData) ?? null,
              href: n.href,
              createdAt: n.createdAt.toISOString(),
            });
            sinceNotif = n.createdAt;
          }

          const msgs = await prisma.message.findMany({
            where: { threadUserId: userId, createdAt: { gt: sinceMsg } },
            orderBy: { createdAt: "asc" },
            take: 50,
          });
          for (const m of msgs) {
            send({
              kind: "message",
              id: m.id,
              threadUserId: userId,
              senderRole: m.senderRole,
              body: m.body,
              createdAt: m.createdAt.toISOString(),
            });
            sinceMsg = m.createdAt;
          }

          if (++ticks % 12 === 0 && !closed) {
            try {
              controller.enqueue(encoder.encode(`: ping\n\n`));
            } catch {
              /* closed */
            }
          }
        } catch {
          /* transient DB error — try again next tick */
        }
      };

      timer = setInterval(poll, POLL_MS);
      request.signal.addEventListener("abort", () => {
        closed = true;
        if (timer) clearInterval(timer);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
    cancel() {
      closed = true;
      if (timer) clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
