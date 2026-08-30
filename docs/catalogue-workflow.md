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

## Meta feed gate

`data/meta-catalogue.csv` intentionally contains only its header until a product has an HTTPS product URL, publicly accessible images, verified source and stock data, confirmed returns information, and `Approved` status. Internal cost and profit fields must never be exported.

Run `npm run meta:generate -- --base-url=https://your-live-domain.example` for a dry-run gate report. Add `--write` only after each product is marked `Live` and its `metaFeedStatus` is `Ready`. The generator emits one row per size so size-wise retail prices remain exact.

## Monitoring

The active Dealstore monitoring heartbeat checks live sources daily and performs the integrity audit each Monday. Changes belong in `data/price-history.csv` and `data/stock-history.csv`. Production writes, publishing, commits, and deployments require a separately approved batch.
