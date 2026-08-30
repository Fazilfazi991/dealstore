# Dealstore Meesho project state

Last audited: 2026-08-30
Repository branch: `main`
Starting commit: `6d8bb4b4caee16f364fcd2f479346fccab33833f`

## What exists

- A working Next.js/Vinext storefront with product listing, product detail, cart, COD checkout, Stripe checkout scaffolding, free-shipping logic, and Supabase commerce migrations.
- Fourteen sellable legacy catalogue products plus five locally approved, source-verified replacements (Products 16–20) after the Product 15 safety correction. All fourteen legacy records remain explicitly flagged for source-verification backfill.
- Six separate local image assets for MSH-EXP-011 through MSH-EXP-015. The old combined catalogue boards are no longer referenced.
- A Supabase schema whose public catalogue exposes only products with `status='active'`.
- Asset and commerce tests, plus the new `npm run meesho:validate` commercial-data gate.

## Verification status

- Products 1–14 exist in the storefront, but their original Meesho URLs and dated source evidence are not present in this repository. Under the new policy they require verification backfill; this audit does not retroactively claim they are verified.
- MSH-EXP-015 is confirmed by the supplied imagery and owner instruction as **Maroon Rayon Co-ord Set** (maroon kurta and wide-leg pants), not an Anarkali gown.
- MSH-EXP-015 has no verified source URL, size-wise source price, sizes, seller, stock, rating, returns, or availability. It is therefore a draft and is excluded from the storefront.
- MSH-EXP-016 through MSH-EXP-020 have live source records, verified commercial data, six individual watermark-free images, passed local cross-view QA, and are prepared in the local storefront.

## Rejected and quarantined work

The previous Products 16–20 visual concepts—Emerald Green Embroidered Kurta-Palazzo Set, Blush Floral Midi Dress, Mustard Floral Anarkali Dress, Navy Wrap Maxi Dress, and Wine-Maroon Sequin Party Dress—have no verified commercial source record. They are rejected as catalogue products and must not be published or used in the Meta feed.

## Current blockers

- Product 15: exact Meesho source listing and all commercial fields are missing.
- Products 16–20 are locally complete but still require staged Supabase synchronization, live deployment, and post-deployment URL/checkout verification before Meta feed inclusion.
- Product 17 offers S–XXL with verified size-wise pricing; Product 18 offers S–XXL at ₹551. Their smaller source-listed sizes remain tracked but withheld because measurements are missing.
- Local browser QA confirms Product 17 and 18 cart/checkout pricing and confirms PDP size controls, COD, free-delivery messaging, and add-to-bag access for Products 16, 19, and 20. Deployment and Supabase synchronization remain pending.
- Vercel is not currently proven to be connected to the intended Supabase environment.

## Safety decisions made

- No guessed price, size, source URL, availability, seller, or return field was added to Product 15.
- The previous unverified ₹588 cost and S–XL sizes for Product 15 were removed from active application pricing.
- The Product 15 correction was applied and verified in the linked production Supabase project on 2026-08-30: the record is now **Maroon Rayon Co-ord Set**, `draft`, with zero active variants and zero product images.
- Products 16–20 are integrated into the local website only. They remain absent from Supabase production and the Meta feed.
- No commit, push, or deployment has been performed. The Products 16–20 staging migration remains unapplied pending final synchronization review.

## Next actions

1. Find Product 15’s exact source listing and verify it against all six supplied images.
2. Review and apply the approved Products 16–20 Supabase catalogue synchronization without exposing source costs publicly.
3. Backfill source records for Products 1–14 and downgrade any record that cannot be verified.
4. Produce six individual source-faithful images only for approved products.
5. Run `npm run meesho:validate`, lint, typecheck, tests, production build, and browser QA.
6. Apply the Supabase correction only after reviewing the migration against the linked project and current Supabase guidance.
7. Commit and deploy only an approved, internally consistent batch.
