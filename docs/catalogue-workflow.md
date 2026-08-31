# Catalogue approval and publishing workflow

## Status flow

`Draft` → `Needs Verification` → `Approved` → `Active`

Exceptions use `Price changed`, `Stock changed`, `Temporarily unavailable`, `Source removed`, `Rejected`, or `Archived`. A monitor may change review status and append history, but it must never silently remove or publish a product.

## Approval checklist

1. Open the exact Meesho URL and confirm product identity against source images.
2. Capture size-wise source price, availability, seller, rating, review count, returns, fabric, colour, sleeves, pattern, length, and included pieces.
3. Calculate each retail price as that size's source cost plus ₹200. Shipping remains free.
4. Produce six separate images under `public/images/<SKU>/`; no collages or invented garment details.
5. Run source-match image QA and update `data/image-status.csv`.
6. Change approval status only after all evidence is present and current.
7. Run `npm run meesho:validate`, lint, TypeScript, tests, build, and browser QA.
8. Sync the approved record to the website and Supabase, then generate its Meta row.

Before any Supabase catalogue synchronization, run `npm run supabase:validate`. It compares the staged migration with canonical approved products, exact size-wise source costs, the six-image contract, draft status, zero initial inventory, and the Product 15 quarantine rules. A passing result validates the migration file; it does not authorize applying it to production.

## Meta feed gate

`data/meta-catalogue.csv` contains only products that have an HTTPS product URL, six publicly accessible images, verified and fresh source/stock data, confirmed returns information, exact size-wise source-plus-₹200 pricing, `Approved` status, `Live` website status, and `Ready` Meta status. Internal cost and profit fields must never be exported.

Run `npm run meta:generate -- --base-url=https://your-live-domain.example` for a dry-run gate report. Add `--write` only after each product is marked `Live` and its `metaFeedStatus` is `Ready`. The generator emits one row per size so size-wise retail prices remain exact.

The generator blocks invalid, future-dated, or stale source checks. Freshness defaults to one day and can be configured with `MEESHO_STALE_AFTER_DAYS`; `MEESHO_VALIDATION_DATE` is available for deterministic audits and tests. A generated local feed is not an authorization to upload it to Meta.

## Monitoring

The active Dealstore monitoring heartbeat checks live sources daily and performs the integrity audit each Monday. Changes belong in `data/price-history.csv` and `data/stock-history.csv`. Production writes, publishing, commits, and deployments require a separately approved batch.
