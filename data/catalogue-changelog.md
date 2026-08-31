# Catalogue changelog

## 2026-08-31 — Product 1 source backfill verified

- Matched MSH-ETH-001 to the live Meesho listing `/p/89ulhd` by direct source-image comparison. The black/red yoke, circular medallion, contrast trim, four tassels, motif repeat, three-quarter sleeves, and straight silhouette match the stored six-image set.
- Captured the live seller, ratings/reviews, 7-day returns, availability, and size-wise source costs: S ₹269, M ₹278, L ₹287, and XL–6XL ₹302.
- Removed unsupported XS and recalculated retail prices as source + ₹200: S ₹469, M ₹478, L ₹487, and XL–6XL ₹502. Shipping remains free.
- Replaced the stale product-info card that claimed ₹494 and ₹50 shipping with a verified `From ₹469` / `FREE Delivery` card. All six images passed source-match and cross-view QA.
- Promoted Product 1 to `Approved`; its Meta row remains blocked until the corrected storefront deployment is live-verified.
- Verified the deployed Product 1 page at `dealstore-five.vercel.app`: S–6XL rendered with the exact size-wise prices, size L added to the bag at ₹487, delivery remained FREE, and COD checkout retained the correct ₹487 line item. Product 1 is now Meta `Ready`.

## 2026-08-31 — Product 15 source search expanded

- Reconfirmed the stored Product 15 identity from its six-image set: a solid wine/maroon two-piece rayon set with an embellished V-neck, three-quarter sleeves, knee-length A-line kurta, and matching plain wide-leg pants; no dupatta.
- Inspected the two closest Meesho text matches in Chrome. Both live pages report out of stock and expose no current source imagery, size-wise pricing, or availability evidence, so neither can verify the canonical garment.
- Rejected three further candidates whose printed hems, floral print, straight fit, purple colour, long sleeves, or pocket-pant construction conflict with the stored garment.
- MSH-EXP-015 remains `Needs Verification`, draft, unpriced, and excluded from the website and Meta feed.

## 2026-08-31 — Product 14 source search logged

- Compared MSH-EXP-014's stored black Anarkali with restrained vertical bodice sequins and lightly dotted dupatta against three live Meesho candidates in Chrome.
- Rejected candidates with full-skirt white floral embroidery; gold vine waist embroidery and square neck; and a heavily floral sequined dupatta with ornate sleeve cuffs.
- Product 14 remains `Needs Verification`; its legacy commercial fields were not promoted.

## 2026-08-31 — Product 13 source search logged

- Compared MSH-EXP-013's stored dark green/navy shirt-collar checked maxi dress with three Meesho candidates.
- Chrome confirmed the closest navy checked candidate is out of stock and exposes no live source imagery; its indexed crepe/navy attributes also conflict. Rejected a plus-size navy round-neck kurti and a sleeveless light-green gingham dress on explicit identity differences.
- Product 13 remains `Needs Verification`; no source URL or commercial field was promoted.

## 2026-08-31 — Product 12 source search logged

- Compared MSH-EXP-012's stored floor-length maroon/rust botanical gown against the verified MSH-EXP-017 source and three additional Meesho candidates.
- Rejected two removed listings; rejected the live polycotton Kalamkari candidate after Chrome source-image inspection showed a white-base short dress with leggings; rejected Product 17's source because its white line-art print is a different garment.
- Product 12 remains `Needs Verification`; the handoff-derived ₹588 value was not promoted.

## 2026-08-31 — Product 11 source search logged

- Compared the stored MSH-EXP-011 two-piece sky-blue matching kurta/pant imagery with live Meesho candidates. Rejected a removed page, a three-piece aqua/white set with dupatta, and a blue kurti with white trousers.
- Added `data/source-research.csv` as a durable candidate/rejection trail and extended `meesho:validate` so an accepted candidate must be the approved canonical source.
- Product 11 remains `Needs Verification`; its legacy ₹485 claim was not promoted.

## 2026-08-31 — Legacy handoff provenance audited

- Inspected both preserved folders and ZIP archives plus the three-sheet Products 11–20 workbook. No Meesho product URL or hidden source record exists in those materials.
- Classified the handoff's Product 11/12 costs as unverified derived values, exactly as labelled in the workbook, and retained Products 1–15 in verification status.
- Recorded archive hashes, evidence hierarchy, and rejection rationale in `docs/source-provenance-audit.md` so historical concepts and contact sheets cannot be promoted as commercial proof.

## 2026-08-31 — Approved-record evidence gate hardened

- Required every approved record to carry the complete commercial evidence contract: exact HTTPS Meesho URL, garment attributes, seller, rating/reviews, returns, stock, dated verification, free shipping, source status, and positive size-wise source-plus-₹200 pricing for every sellable size.
- Rechecked the exact live listings for MSH-EXP-017 and MSH-EXP-018 after the stronger gate exposed missing fields. Recorded Product 17's source-listed `Regular` sleeve styling and Product 18's size-dependent top/palazzo lengths (20–24 in / 36–38 in); no value was inferred from imagery.
- Added a regression test proving an approved record fails when seller, returns, or an available size's source cost is missing.

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
