# Dealstore commerce foundation

## Local setup

1. Copy `.env.example` to `.env.local` and fill the server-only Supabase keys.
2. Start Supabase, then run `supabase db reset` to apply the migration and deterministic seed.
3. For Stripe, set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_SITE_URL`. Point Stripe webhooks to `/api/webhooks/stripe`.
4. Run `npm test`. Validate future catalogue batches with `npm run catalogue:validate -- catalogue/import-template.json`.

The service-role key, product source costs, order access-token hashes, customer data, and inventory are never exposed to browser code. The checkout RPC locks inventory rows, recalculates prices from PostgreSQL, snapshots order lines, reserves stock, and deduplicates requests with an idempotency key.

## Status model

- COD: `unpaid` + `confirmed` after atomic creation.
- Stripe: `pending` until the signed `checkout.session.completed` webhook moves it to `paid` + `confirmed`.
- Failed payments become `failed`; refunded charges become `refunded`.
- Fulfilment proceeds independently through `processing`, `packed`, `shipped`, and `delivered`.

`lib/commerce/notifications.server.ts` is the provider-neutral confirmation boundary. It intentionally records a pending delivery until an email/SMS provider is selected.
