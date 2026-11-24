# Aplicash

Beta: a storefront rideshare drivers link to via a QR code on a card behind
the seat. Passengers scan it, browse a small catalog, and check out (payment
settled with the driver for now — Pix or cash on delivery, no gateway yet).
Each driver earns a commission on orders attributed to their code.

## Setup

Needs a Postgres database — a local install, or a free hosted one (Vercel
Postgres, Neon, Supabase all work).

```bash
cp .env.example .env   # then set DATABASE_URL to your Postgres connection string
npm install
npx prisma migrate dev
npm run db:seed   # demo driver (code DEMO01) + sample products
npm run dev
```

`predev`/`prestart` run `scripts/ensure-env.cjs`, which generates
`ADMIN_USER`/`ADMIN_PASSWORD` into `.env` on first run if missing, and
prints them to the console — **check the terminal output** the first time
you run `npm run dev`. It no-ops on Vercel (`VERCEL` env var present); set
those as real project environment variables there instead.

## Deploying to Vercel

1. Vercel dashboard → New Project → import `lehnerlabs-dev/aplicash`.
2. Storage tab → add a Postgres database (Vercel's own, backed by Neon) to
   the project — this auto-sets `DATABASE_URL`. (Or paste in your own
   Postgres connection string as a project environment variable instead.)
3. Project Settings → Environment Variables → add `ADMIN_USER` and
   `ADMIN_PASSWORD` (pick your own values — nothing generates these on
   Vercel).
4. Deploy. The build runs `prisma migrate deploy` automatically (see
   `package.json`), so the schema is created/updated on every deploy.
5. Add real products at `/admin/products` and drivers at `/admin/drivers`
   on the deployed URL — the local demo seed data is for local dev only
   and isn't run in production.

Open `http://localhost:3000`. Visit `http://localhost:3000/r/DEMO01` to see
the site as a passenger who scanned the demo driver's QR code.

## Admin

`/admin` is protected by HTTP Basic Auth (`src/proxy.ts`) using
`ADMIN_USER`/`ADMIN_PASSWORD` from `.env`. It fails closed: if those aren't
set, `/admin` is locked out entirely rather than left open.

- `/admin/products` — add/edit products, set price and an image URL,
  deactivate or delete
- `/admin/drivers` — add drivers (auto-generates a unique referral code),
  print their QR card from `/admin/drivers/[id]/qr`
- `/admin/orders` — all orders, per-driver visits → orders → conversion →
  commission owed, and order status (pending/confirmed/delivered/cancelled)

## How attribution works

A driver's QR code points at `/r/<code>`, which logs a visit, sets an
httpOnly cookie, and redirects to `/`. Checkout reads that cookie server-side
to attribute the order and commission — the storefront URL itself stays
clean (no `?ref=` query param).

## Stack

Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind + Prisma
on SQLite. No auth system beyond the admin Basic Auth gate; no payment
gateway; cart lives in the browser's `localStorage`.

## Deliberately not built yet

- Real payment (Pix/Mercado Pago) — needs a payment provider account
- Hosting/deployment — SQLite needs a host with a persistent disk, or a
  swap to Postgres for serverless hosting; needs an account decision
- The "driver's own store" marketplace variant (sell their own goods,
  not just Aplicash's catalog) — validate the core funnel first
- Fraud/abuse checks on QR attribution
