# Catalogue changelog

## 2026-08-31

- Completed the daily source check for Products 16–20; all five source pages remained active.
- Recorded review-count changes for MSH-EXP-017 (39 to 40) and MSH-EXP-020 (1192 to 1195); no commercial catalogue action was required.
- Ran the weekly `meesho:validate` catalogue integrity gate: 20 tracked records, 19 sellable website products, no hard validation errors.
- Hardened `meesho:validate` to report invalid, future-dated, and stale monitoring dates. The default stale threshold is one day and can be configured with `MEESHO_STALE_AFTER_DAYS`; deterministic audits can set `MEESHO_VALIDATION_DATE`.
- Re-searched Meesho for the exact MSH-EXP-015 garment. Similar maroon rayon kurta/pant listings were rejected because they conflicted with the supplied co-ord on silhouette, bottom shape, neckline/sleeve treatment, or included pieces. Product 15 remains `Needs Verification`, draft, and excluded.
- Verified the live production pages for Products 16–20 and all thirty public image URLs. Page titles and retail prices matched the canonical catalogue; every checked endpoint returned HTTP 200.
- Marked Products 16–20 `Live` and Meta `Ready`, then generated a local 28-row size-variant feed. No feed upload or Meta mutation was performed.
- Hardened the Meta generator to reject stale/future source checks, invalid Meesho URLs, missing free-shipping evidence, missing sizes, and source-plus-₹200 price violations. Added focused feed tests.
- Completed a read-only production Supabase audit in the authenticated dashboard. Products 16–20 are absent; Product 15 is draft with zero active variants and zero images but retains the obsolete ₹588 source cost.
- Verified RLS/grants, `security_invoker` catalogue projection, privileged function grants, and Security Advisor (zero errors, zero warnings).
- Corrected the unapplied staging migration to clear Product 15's source cost to zero and added `supabase:validate`, which reconciles five approved products, 28 size variants, six image names, draft status, and zero initial inventory against canonical data.

## 2026-08-30

- Corrected MSH-EXP-015 identity to **Maroon Rayon Co-ord Set**.
- Applied the Product 15 safety correction to Supabase project `xlnnijggjornadlfayob`: draft status, inactive variants, and removal of mismatched Anarkali imagery; verified the live result.
- Rejected the prior Products 16–20 AI concept identities as commercial records.
- Added five replacement Meesho listings as **Needs Verification** drafts only.
- Stored captured size-wise pricing and explicit source conflicts.
- Kept Products 15–20 out of the sellable website and Meta feed.
- Added Products 1–14 to canonical tracking as legacy published records with explicit verification-backfill warnings.
- Completed seller and 7-day return capture for replacement candidates 17, 19, and 20.
- Resolved Product 16 sleeve/identity, Product 19 garment/fabric-source hierarchy, and Product 20 colour conflicts through primary-image inspection.
- Marked replacement Products 16–20 ready for watermark-free six-image production; none is yet approved for publication.
- Generated and retained one watermark-free Product 17 catalogue-hero draft after rejecting two iterations that failed the accessory/source-match gate. The draft remains outside `public/` until the six-view set passes final QA.
- Completed all six Product 17 images, passed cross-view QA, promoted them to `public/images/MSH-EXP-017/`, and added variant-aware S–XXL pricing to the local storefront. XS is withheld because the source listing omits its measurements.
- Completed all six Product 18 images, passed cross-view QA, promoted them to `public/images/MSH-EXP-018/`, and added verified S–XXL pricing at ₹551 to the local storefront. XXS source pricing remains tracked but the size is withheld because the source listing omits its measurements.
- Completed all six Product 16 images, passed cross-view QA, promoted them to `public/images/MSH-EXP-016/`, and added verified XS–XXXL size-wise pricing to the local storefront.
- Completed and promoted six-image sets for Products 19 and 20 after cross-view QA. Product 19 is priced at ₹650 for S–XXL; Product 20 is priced at ₹682 for S–XXXL.
- Browser-verified Product 17 at ₹588 for size S through product detail, add-to-bag, cart, and checkout. COD remained selected, shipping remained FREE, and no console errors were emitted.
