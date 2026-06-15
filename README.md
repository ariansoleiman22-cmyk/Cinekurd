# Cine Kurd 🎬

A luxury cinema-equipment rental & booking catalogue. Admins post gear (no prices shown); customers browse with **live stock**, **book** within per-account limits, and **message the admin** — all in real time, in **English, Arabic and Kurdish Sorani** (with automatic right-to-left).

## Features

- **Trilingual** (EN / AR / CKB) with automatic RTL layout and a language switcher
- **Catalogue** — Camera · Lens · Light · Accessories (with sub-types) · Brands
- **Live stock** badges (In stock / Low / Out) — no prices, by design
- **Accounts** — email + password (secure `scrypt` hashing, database-backed sessions)
- **Booking** — atomic, oversell-safe, enforces the admin's per-account limit; "My Bookings" with cancel
- **Real-time** messaging (customer ↔ admin) and notifications via Server-Sent Events
- **Admin panel** — dashboard, gear CRUD with photo upload, brand CRUD, booking management (confirm/cancel/complete), message inbox
- **Luxury** dark + champagne-gold responsive design

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Prisma 6 + SQLite

## Getting started

```bash
npm install
npm run db:push      # create the SQLite database
npm run db:seed      # load the sample catalogue (17 brands, 57 products)
npm run dev          # → http://localhost:3000
```

## Become an admin

1. Sign up on the site with your email.
2. `npm run make-admin you@example.com`
3. Refresh — an **Admin** link appears in the header → open `/admin`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run db:push` | Sync the Prisma schema to the database |
| `npm run db:seed` | (Re)load the sample catalogue |
| `npm run db:reset` | Wipe + reseed the database |
| `npm run make-admin <email>` | Grant a user the admin role |

## Editing content & languages

- Catalogue lives in the database — manage it from `/admin` (or edit `prisma/catalog.json` and run `npm run db:seed`).
- UI text is in `src/dictionaries/{en,ar,ckb}.json` — **English is the source of truth**. The Arabic & Kurdish files were AI-drafted then linguist-reviewed; have a native speaker do a final pass before launch.

## Going live

See **[DEPLOY.md](./DEPLOY.md)**.
