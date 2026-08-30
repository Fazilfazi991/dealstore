# Dealstore commerce backend

## Local setup

1. Copy `.env.example` to `.env.local`. Never commit that file.
2. Install the current Supabase CLI, run `supabase start`, then `supabase db reset`. This applies both migrations and the deterministic 10-product seed.
3. Replace the seed's 20-units-per-variant development inventory before any production launch.
4. Run `npm run catalogue:validate -- catalogue/import-template.json`, then the same command with your real file. Commit only after a clean preview with `npm run catalogue:import -- <file>`.
5. Run lint, TypeScript, tests, and both supported production builds.

Required production secrets are `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`. `NEXT_PUBLIC_SITE_URL` is the canonical deployed origin. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is reserved for future client-side Stripe UI. Online payment remains hidden unless both server Stripe secrets exist.

## Database and catalogue

The schema contains categories, products, ordered product images, variants, variant inventory, inventory movements, customers, address support, orders, immutable order items, and processed Stripe events. `source_cost` is stored only on the protected products table; `selling_price` is generated as `source_cost + 200`. The server reads `public_catalogue`, whose projection never contains source cost or supplier data. The repository's TypeScript catalogue remains a development fallback and migration reference, not the production source of truth.

`import_catalogue(jsonb, boolean)` is an atomic service-role-only RPC. It normalizes slugs, validates costs/sizes/images, serializes concurrent imports, upserts catalogue records, deactivates removed variants, creates inventory, and records opening movements. The CLI defaults to a dry run and reports valid/invalid rows, duplicates, and projected product/variant/image counts. JSON is currently the supported interchange format.

SKU format is the stable external product code plus normalized size, for example `MSH-ETH-001-M`. Keep external product codes short and immutable.

## Checkout, orders, and inventory

The browser may cache cart presentation data, but submits only SKU and quantity. `create_order` reloads active products/variants, locks inventory, calculates trusted prices, snapshots order lines, sets delivery to ₹0, and reserves inventory in one PostgreSQL transaction. Idempotency keys prevent duplicate order rows. Guest confirmation requires both a non-sequential `DS-YYYYMMDD-XXXXXX` order number and a random token held in an HttpOnly cookie; public roles cannot read orders or customers.

COD starts as `order_status=confirmed`, `payment_status=unpaid`. Online checkout starts `pending/pending`. Fulfilment can move through confirmed → processing → packed → shipped → delivered, with cancelled and returned as terminal operational states. Payment state is independent: pending, unpaid, processing, paid, failed, refunded, or partially refunded.

Reservations increase `reserved_quantity`; every opening, reservation, cancellation, order, and return adjustment belongs in `inventory_movements`. `abandon_stripe_order` releases a reservation if Stripe session creation fails. Operations must define when a confirmed reservation becomes a physical stock deduction before fulfilment automation is enabled.

## Stripe and notifications

Stripe Checkout is created server-side from the trusted order total. The order number is placed in metadata. `/api/webhooks/stripe` reads the raw request body, verifies the signature, accepts only the three implemented events, and calls the idempotent `apply_stripe_event` RPC. Browser return URLs never mark an order paid. Configure the webhook for `checkout.session.completed`, `payment_intent.payment_failed`, and `charge.refunded`; use Stripe test mode until business approval.

`lib/commerce/notifications.server.ts` is the provider-neutral notification boundary. It intentionally does not claim delivery until an email/SMS provider is configured.

## Production checklist

- Review and apply migrations to a Supabase staging branch first; run database advisors and RLS tests.
- Confirm the Data API exposes no base commerce tables to `anon` or `authenticated`.
- Replace seed inventory with verified actual stock.
- Configure Vercel server secrets and canonical URL.
- Register the Stripe test webhook and verify retries.
- Approve final shipping, returns, privacy, and terms wording.
- Complete a real staging COD order and inspect order, item, customer, inventory, movement, totals, and statuses.

> Fulfilment TODO: verify that the selected COD workflow can collect the final Dealstore selling price shown on each order. Never expose supplier identity or supplier-side pricing.
