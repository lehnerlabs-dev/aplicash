# Aplicash

Beta: a storefront rideshare drivers link to via a QR code on a card behind
the seat. Passengers scan it, browse a small catalog, and check out (payment
settled with the driver for now — Pix or cash on delivery, no gateway yet).
Each driver earns a commission on orders attributed to their code.

## Setup

```bash
npm install
npx prisma migrate dev
npm run db:seed   # demo driver (code DEMO01) + sample products
npm run dev
```

`predev`/`prebuild`/`prestart` run `scripts/ensure-env.cjs` automatically,
which:
- pins `DATABASE_URL` to an absolute path (works around a Prisma CLI vs.
  runtime-client path resolution mismatch for relative sqlite URLs)
- generates `ADMIN_USER`/`ADMIN_PASSWORD` on first run if missing, and
  prints them to the console — **check the terminal output** the first time
  you run `npm run dev`

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
