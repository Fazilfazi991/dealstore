# Dealstore Meesho project state

Last audited: 2026-08-31
Repository branch: `main`
Audit basis commit: `b8f4efc` (`main`)

## What exists

- A working Next.js/Vinext storefront with product listing, product detail, cart, COD checkout, Stripe checkout scaffolding, free-shipping logic, and Supabase commerce migrations.
- Twenty-six tracked records: seventeen approved, source-verified and production-QA-verified products; seven legacy-published originals that still require exact-source backfill; Product 15 as a quarantined identity-corrected draft; and Product 26 as a source-verified image-production draft. The website currently exposes twenty-four sellable products because Products 15 and 26 remain excluded.
- Six separate local image assets for MSH-EXP-011 through MSH-EXP-015. The old combined catalogue boards are no longer referenced.
- A Supabase schema whose public catalogue exposes only products with `status='active'`.
- Asset and commerce tests, plus the new `npm run meesho:validate` commercial-data gate.

## Verification status

- Original Products 1, 2, 3, 4, 7, 8, and 10 now have exact live Meesho source matches, complete commercial evidence, corrected source-plus-₹200 size pricing, production PDP/cart/COD QA, `Live` website status, and `Ready` local Meta status.
- Original Products 5, 6, 9, 11, 12, 13, and 14 remain legacy-published and require exact-source backfill. Candidate searches are preserved in `data/source-research.csv`; every inspected non-match or unavailable candidate remains rejected and was not copied into canonical data.
- MSH-EXP-015 is confirmed by the supplied imagery and owner instruction as **Maroon Rayon Co-ord Set** (maroon kurta and wide-leg pants), not an Anarkali gown.
- MSH-EXP-015 has no verified source URL, size-wise source price, sizes, seller, stock, rating, returns, or availability. It is therefore a draft and is excluded from the storefront.
- A focused 2026-08-31 Meesho search found several maroon rayon kurta/pant listings, but none matched the supplied garment across silhouette, wide-leg bottom, V-neck treatment, sleeve details, included pieces, and colour. No candidate was accepted or copied into the canonical record.
- A complete provenance scan of both preserved source/handoff folders, both ZIP archives, and all three sheets in the handoff XLSX found no Meesho product URL or hidden source record. The handoff's Product 11/12 costs are labelled derived and are not accepted as verification; see `docs/source-provenance-audit.md`.
- MSH-EXP-016 through MSH-EXP-020 have live source records, verified commercial data, six individual watermark-free images, passed local cross-view QA, and live production product pages.
- MSH-EXP-021 through MSH-EXP-025 have current source URLs, size-wise source-plus-₹200 retail pricing, seller/rating/review/return evidence, visually inspected primary source images, and six crop-safe 4:5 images each. All five passed source-match/cross-view QA and are live with 27 approved size variants. Product 22 XXS and Product 24 XXXL/4XL remain withheld for missing measurements. Production QA verified homepage/category placement, every six-image PDP, Product 22 size-M pricing at ₹641, cart, FREE delivery, selected COD checkout, disabled online payment, and zero mobile overflow; no order was submitted.
- MSH-EXP-026 is a quarantined source-verified draft: a black-and-beige diamond-print rayon kurta-pant set at ₹416 source and ₹616 retail for measured S/M variants. L–XXXL remain withheld because source measurements are missing. Source photos confirm the garment but contain a supplier watermark, so no source photo is publishable and the product remains blocked until six clean individual images pass exact-garment QA.
- On 2026-08-31, all five production product URLs and all thirty public image URLs returned HTTP 200 with the expected page titles, retail prices, and image content types.
- The local Meta feed contains 98 unique size variants across the seventeen live, feed-ready verified products: originals 1, 2, 3, 4, 7, 8 and 10 plus Products 16–25. No verified live product is blocked from feed generation. Every row uses HTTPS, free shipping, exact size-wise retail pricing, and excludes internal source-cost/profit fields. It has not been uploaded to Meta.
- A read-only production Supabase audit on 2026-08-31 confirmed that Products 16–20 are not yet present in the database. Product 15 is draft with zero active variants and zero images, but still carries the obsolete unverified ₹588 source cost in production.
- Production catalogue tables have RLS enabled and expose grants only to `postgres` and `service_role`; the public catalogue view uses `security_invoker=true`. Privileged commerce functions are executable only by `postgres` and `service_role`. Supabase Security Advisor reports zero errors and zero warnings.

## Rejected and quarantined work

The previous Products 16–20 visual concepts—Emerald Green Embroidered Kurta-Palazzo Set, Blush Floral Midi Dress, Mustard Floral Anarkali Dress, Navy Wrap Maxi Dress, and Wine-Maroon Sequin Party Dress—have no verified commercial source record. They are rejected as catalogue products and must not be published or used in the Meta feed.

## Current blockers

- Product 15: exact Meesho source listing and all commercial fields are missing.
- Products 1, 10 and 16–20 still have reviewed Supabase synchronization migrations that are not proven applied to production. The deployed storefront passes production QA using the repository catalogue, but that does not prove the intended Supabase rows are synchronized.
- The staged synchronization now explicitly clears Product 15's obsolete source cost to zero. Applying it is a production database write and remains pending approval/execution.
- Product 17 offers S–XXL with verified size-wise pricing; Product 18 offers S–XXL at ₹551. Their smaller source-listed sizes remain tracked but withheld because measurements are missing.
- Local browser QA confirms Product 17 and 18 cart/checkout pricing and confirms PDP size controls, COD, free-delivery messaging, and add-to-bag access for Products 16, 19, and 20. Supabase synchronization remains pending.
- Vercel is not currently proven to be connected to the intended Supabase environment.
- The 2026-08-31 catalogue gate passes with 26 tracked records and 24 sellable website products. It reports warnings—not hard failures—for the seven remaining unverified legacy originals and the intentionally incomplete Product 15 draft; Product 26 remains a non-sellable image-production draft.
- Monitoring-date validation now detects invalid dates, future dates, and approved records older than the configurable daily freshness threshold.
- Products 21–25 passed local browser QA at 320, 360, 375, 390, 430, 768, 1024, 1280, and 1440 widths and passed production QA on `dealstore-five.vercel.app`. The 360–375px header overflow remains corrected, all six PDP assets render without broken images, category placement is correct, Product 22 size-M cart pricing remains ₹641, delivery remains FREE, COD remains selected, and online payment remains disabled. No order was submitted. Vercel reported no runtime errors during the verification window.
- Product 2 production QA verified all eight size choices, size M switching the live CTA to ₹415, add-to-bag retaining size M and ₹415 in cart, FREE delivery, all six public images, and zero captured client warnings/errors. It is now Live and Meta Ready locally; no Meta upload was performed.
- Products 4 and 7 production QA verified their six-image PDPs, size M selection and cart pricing at ₹674 and ₹676 respectively, FREE delivery, selected COD checkout, and zero captured client warnings/errors. All twelve public image URLs returned HTTP 200. Both are now Live and Meta Ready locally; no Meta upload was performed.
- Product 3 is matched to the exact live Meesho gallery: the same sleeveless peach motif rayon kurta with square neckline and plain white palazzos. Live S–XXL selectors are ₹275, so retail is ₹475 with free delivery. Seller, ratings, reviews and returns were captured; conflicting Meesho neck/dupatta metadata is documented. Only measurement-supported S–XXL are published. Production QA verified size M at ₹475 through cart and selected COD checkout, FREE delivery, all six public images, and zero client warnings/errors. Its corrected information card says ₹475, Sizes S–XXL and FREE delivery. It is Live and Meta Ready locally; no Meta upload was performed.
- Latest local release gates after Product 10 promotion: tracked-source ESLint 0 errors (2 ignored generated-file warnings), TypeScript pass, 24/24 tests pass, `meesho:validate` pass with 25 tracked/24 sellable and only known legacy/Product 15 warnings, asset validation pass through Product 20, and Vinext production build pass.

## Safety decisions made

- No guessed price, size, source URL, availability, seller, or return field was added to Product 15.
- The previous unverified ₹588 cost and S–XL sizes for Product 15 were removed from active application pricing.
- The Product 15 correction was applied and verified in the linked production Supabase project on 2026-08-30: the record is now **Maroon Rayon Co-ord Set**, `draft`, with zero active variants and zero product images.
- The 2026-08-31 read-only audit found that the earlier production correction did not clear Product 15's obsolete source cost. The unapplied staging migration has been corrected to set it to zero.
- Products 16–20 are live in the deployed static storefront but remain absent from Supabase production. Their validated feed rows exist locally and have not been uploaded to Meta.
- The Products 16–20 staging migration remains unapplied pending explicit production synchronization approval; committing this reviewed migration does not apply it to Supabase or publish the Meta feed.
- Instagram product posts are retained when stock changes. The approved operating policy is to edit the caption to `OUT OF STOCK` or `TEMPORARILY UNAVAILABLE`, preserve engagement/history, and restore verified purchase copy when stock returns; stock status alone is never a deletion reason.

## Next actions

1. Find Product 15’s exact source listing and verify it against all six supplied images.
2. Continue exact-source backfill for Products 5, 6, 9, and 11–14; never promote a similar garment or unavailable listing as canonical evidence.
3. Keep all seventeen verified products under daily source monitoring; their production and Meta-readiness gates are complete, but the feed has not been uploaded.
4. Produce and QA six separate watermark-free Product 26 images before considering approval, website sync or Meta inclusion.
5. Review and apply the approved Product 1, Product 10, and Products 16–20 Supabase catalogue synchronization without exposing source costs publicly.
6. Keep `meesho:validate`, Meta-feed tests, lint, typecheck, tests, production build, and browser QA green.
7. Apply the Supabase correction only after reviewing the migration against the linked project and current Supabase guidance.
8. Commit and deploy only an approved, internally consistent batch.
