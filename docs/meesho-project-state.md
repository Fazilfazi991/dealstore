# Dealstore Meesho project state

Last audited: 2026-08-31
Repository branch: `main`
Audit commit: `f59492b47b3b97f77e19978e227ef1051689296b`

## What exists

- A working Next.js/Vinext storefront with product listing, product detail, cart, COD checkout, Stripe checkout scaffolding, free-shipping logic, and Supabase commerce migrations.
- Fourteen sellable original catalogue products plus ten approved, source-verified additions (Products 16–25) after the Product 15 safety correction. Products 1, 4, and 7 now have exact source backfills; the remaining eleven original sellable records require verification. Products 21–25 are deployed, production-QA verified, and Meta-feed ready.
- Six separate local image assets for MSH-EXP-011 through MSH-EXP-015. The old combined catalogue boards are no longer referenced.
- A Supabase schema whose public catalogue exposes only products with `status='active'`.
- Asset and commerce tests, plus the new `npm run meesho:validate` commercial-data gate.

## Verification status

- Products 1, 4, and 7 now have exact live Meesho source matches and complete commercial evidence. Product 1's corrected S–6XL flow is live and Meta-ready. Products 4 and 7 have corrected pricing, information cards, product pages, size-selected carts, and COD checkout locally verified; deployment and production QA remain pending.
- Products 2–3, 5–6, and 8–14 exist in the storefront, but their original Meesho URLs and dated source evidence are not present in this repository. Candidate searches through Product 14 are preserved in `data/source-research.csv`; rejected candidates were not promoted. Under the new policy these records still require exact-source backfill.
- MSH-EXP-015 is confirmed by the supplied imagery and owner instruction as **Maroon Rayon Co-ord Set** (maroon kurta and wide-leg pants), not an Anarkali gown.
- MSH-EXP-015 has no verified source URL, size-wise source price, sizes, seller, stock, rating, returns, or availability. It is therefore a draft and is excluded from the storefront.
- A focused 2026-08-31 Meesho search found several maroon rayon kurta/pant listings, but none matched the supplied garment across silhouette, wide-leg bottom, V-neck treatment, sleeve details, included pieces, and colour. No candidate was accepted or copied into the canonical record.
- A complete provenance scan of both preserved source/handoff folders, both ZIP archives, and all three sheets in the handoff XLSX found no Meesho product URL or hidden source record. The handoff's Product 11/12 costs are labelled derived and are not accepted as verification; see `docs/source-provenance-audit.md`.
- MSH-EXP-016 through MSH-EXP-020 have live source records, verified commercial data, six individual watermark-free images, passed local cross-view QA, and live production product pages.
- MSH-EXP-021 through MSH-EXP-025 have current source URLs, size-wise source-plus-₹200 retail pricing, seller/rating/review/return evidence, visually inspected primary source images, and six crop-safe 4:5 images each. All five passed source-match/cross-view QA and are live with 27 approved size variants. Product 22 XXS and Product 24 XXXL/4XL remain withheld for missing measurements. Production QA verified homepage/category placement, every six-image PDP, Product 22 size-M pricing at ₹641, cart, FREE delivery, selected COD checkout, disabled online payment, and zero mobile overflow; no order was submitted.
- On 2026-08-31, all five production product URLs and all thirty public image URLs returned HTTP 200 with the expected page titles, retail prices, and image content types.
- The local Meta feed contains 64 unique size variants across all live, feed-ready verified products, including Products 16–25. Every row uses HTTPS, free shipping, exact size-wise retail pricing, and excludes internal source-cost/profit fields. It has not been uploaded to Meta.
- A read-only production Supabase audit on 2026-08-31 confirmed that Products 16–20 are not yet present in the database. Product 15 is draft with zero active variants and zero images, but still carries the obsolete unverified ₹588 source cost in production.
- Production catalogue tables have RLS enabled and expose grants only to `postgres` and `service_role`; the public catalogue view uses `security_invoker=true`. Privileged commerce functions are executable only by `postgres` and `service_role`. Supabase Security Advisor reports zero errors and zero warnings.

## Rejected and quarantined work

The previous Products 16–20 visual concepts—Emerald Green Embroidered Kurta-Palazzo Set, Blush Floral Midi Dress, Mustard Floral Anarkali Dress, Navy Wrap Maxi Dress, and Wine-Maroon Sequin Party Dress—have no verified commercial source record. They are rejected as catalogue products and must not be published or used in the Meta feed.

## Current blockers

- Product 15: exact Meesho source listing and all commercial fields are missing.
- Products 16–20 still require staged Supabase synchronization and proof that the deployed storefront is connected to the intended Supabase environment.
- The staged synchronization now explicitly clears Product 15's obsolete source cost to zero. Applying it is a production database write and remains pending approval/execution.
- Product 17 offers S–XXL with verified size-wise pricing; Product 18 offers S–XXL at ₹551. Their smaller source-listed sizes remain tracked but withheld because measurements are missing.
- Local browser QA confirms Product 17 and 18 cart/checkout pricing and confirms PDP size controls, COD, free-delivery messaging, and add-to-bag access for Products 16, 19, and 20. Supabase synchronization remains pending.
- Vercel is not currently proven to be connected to the intended Supabase environment.
- The 2026-08-31 weekly catalogue gate passed with 25 tracked records and 19 sellable website products. It reported warnings—not hard failures—for the remaining unverified original records and the intentionally incomplete Product 15 draft.
- Monitoring-date validation now detects invalid dates, future dates, and approved records older than the configurable daily freshness threshold.
- Products 21–25 passed local browser QA at 320, 360, 375, 390, 430, 768, 1024, 1280, and 1440 widths and passed production QA on `dealstore-five.vercel.app`. The 360–375px header overflow remains corrected, all six PDP assets render without broken images, category placement is correct, Product 22 size-M cart pricing remains ₹641, delivery remains FREE, COD remains selected, and online payment remains disabled. No order was submitted. Vercel reported no runtime errors during the verification window.
- Final local release gates after storefront synchronization: tracked-source ESLint 0 errors (2 ignored generated-file warnings), TypeScript pass, 22/22 tests pass, `meesho:validate` pass with 25 tracked/24 sellable and only known legacy/Product 15 warnings, Vinext production build pass, and `git diff --check` pass.

## Safety decisions made

- No guessed price, size, source URL, availability, seller, or return field was added to Product 15.
- The previous unverified ₹588 cost and S–XL sizes for Product 15 were removed from active application pricing.
- The Product 15 correction was applied and verified in the linked production Supabase project on 2026-08-30: the record is now **Maroon Rayon Co-ord Set**, `draft`, with zero active variants and zero product images.
- The 2026-08-31 read-only audit found that the earlier production correction did not clear Product 15's obsolete source cost. The unapplied staging migration has been corrected to set it to zero.
- Products 16–20 are live in the deployed static storefront but remain absent from Supabase production. Their validated feed rows exist locally and have not been uploaded to Meta.
- The Products 16–20 staging migration remains unapplied pending explicit production synchronization approval; committing this reviewed migration does not apply it to Supabase or publish the Meta feed.

## Next actions

1. Find Product 15’s exact source listing and verify it against all six supplied images.
2. Keep Products 21–25 under daily source monitoring; their production and Meta-readiness gates are complete, but the feed has not been uploaded.
3. Continue exact-source backfill for Products 2–3, 5–6, and 8–15; Products 1, 4, and 7 are verified.
4. Review and apply the approved Product 1 and Products 16–20 Supabase catalogue synchronization without exposing source costs publicly.
5. Keep `meesho:validate`, Meta-feed tests, lint, typecheck, tests, production build, and browser QA green.
6. Apply the Supabase correction only after reviewing the migration against the linked project and current Supabase guidance.
7. Commit and deploy only an approved, internally consistent batch.
