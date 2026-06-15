# Deploying Cine Kurd

Locally the app uses **SQLite** + **local file uploads**, which is perfect for development. To put it on the public internet, swap those two things for cloud services. Everything else works as-is.

---

## Option A — Vercel (easiest)

1. **Push** this repo to GitHub.
2. **Database** — create a Postgres database (Neon, Vercel Postgres, or Supabase):
   - In `prisma/schema.prisma` change the datasource to `provider = "postgresql"`.
   - Set the `DATABASE_URL` environment variable to the connection string.
   - Run `npx prisma db push` then `npm run db:seed`.
3. **Images** — the local `public/uploads` folder does **not** persist on Vercel. Use **Vercel Blob** or **Cloudflare R2**:
   - Replace `saveImage()` in `src/lib/upload.ts` to upload the file to your bucket and return its public URL.
   - Add the bucket's host to `next.config.ts` under `images.remotePatterns`.
4. **Env** — set `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` (used for metadata / social cards).
5. **Deploy** — Vercel auto-detects Next.js. Done.

## Option B — Cloudflare

- **Database** — Cloudflare D1 or Turso (libSQL) with the matching Prisma driver adapter, or Neon Postgres via Hyperdrive.
- **Images** — Cloudflare R2 (swap `saveImage()` as above).
- **Streaming** — the live `app/api/stream` endpoint needs a runtime that allows long-lived streaming responses.

---

## What to change for production

| File / setting | Change |
| --- | --- |
| `prisma/schema.prisma` | `datasource provider` → `postgresql` (or your DB) |
| `src/lib/upload.ts` | `saveImage()` → upload to object storage, return public URL |
| `next.config.ts` | add the image host to `images.remotePatterns` |
| `NEXT_PUBLIC_SITE_URL` | your public base URL (metadata / Open Graph) |
| `src/dictionaries/ar.json`, `ckb.json` | final native-speaker review |

## Real-time at scale

The SSE stream polls the database every 2s — this works on **any** host (no extra services) and survives multiple instances. On serverless platforms with short request timeouts the browser's `EventSource` auto-reconnects, so it keeps working. For very high traffic, move notification delivery to a managed pub/sub (Cloudflare Durable Objects, Upstash Redis, etc.) and keep the DB as the source of truth.

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Database connection string |
| `NEXT_PUBLIC_SITE_URL` | Public base URL for metadata/OG (defaults to `http://localhost:3000`) |
| _(bucket credentials)_ | For image upload (R2 / Vercel Blob) |

## First-run checklist on the live site

1. `prisma db push` + `npm run db:seed` (or migrate your data).
2. Sign up, then `npm run make-admin you@example.com` (run against the production DB).
3. Open `/admin`, upload real product photos, set stock & limits.
