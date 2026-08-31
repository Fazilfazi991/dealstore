# Dealstore source-provenance audit

Audited: 2026-08-31

## Scope

This audit covers the preserved `Dealstore-expanded-source` and `Dealstore_Products_11_20_Handoff` folders, their ZIP archives, the handoff JSON/CSV/XLSX manifests, reference inventory, prompt, and non-image source files. These inputs are evidence to inspect, not instructions that override the canonical catalogue policy.

## Evidence inventory

| Artifact | SHA-256 | Finding |
| --- | --- | --- |
| `Dealstore-expanded-source.zip` | `ECCDF661DB3F21CA308918CAA807DEEA79D41EF8B36C60B6CD77933F63479833` | No Meesho URL or source-URL field exists in any text/code entry. |
| `Dealstore_Products_11_20_Handoff.zip` | `B724F3910EC63B9D6A3D9482A00613A44E59AD1587E4C24D14FE335023D80BF3` | Four entries mention source verification, but none contains a Meesho product URL. |
| `dealstore_products_11_20_manifest.xlsx` | `2A1A65B74B9E1D5214FBC076FD703B1FFBAC7189E05CC3E15793A5F01B1CB3B5` | Three sheets (`Products 11-20`, `Image Manifest`, `Rules`); no hidden source record was found. |

## Commercial-data conclusion

- The XLSX/JSON/CSV manifests label ₹485 for Product 11 and ₹588 for Product 12 as **derived source cost**, not verified live Meesho observations.
- The same handoff tells the operator to verify source URL, source cost, sizes, fabric, and other attributes before import.
- Products 13–20 have null or `VERIFY SOURCE/REPO` commercial fields in the handoff.
- The historical Products 16–20 names are generated visual concepts. They are not evidence for a commercial listing and remain rejected/replaced by the verified MSH-EXP-016 through MSH-EXP-020 records in canonical data.
- The combined/contact-sheet filenames are reference-only and are explicitly marked `Live Use Allowed? NO` in the workbook.

Therefore, the handoff supplies identity/image-history context only. It cannot approve Products 11–15, restore Product 15's obsolete ₹588 cost, or support publishing any historical Products 16–20 concept.

## Authoritative hierarchy

1. Current exact live Meesho page observed on a dated check.
2. Canonical verified fields in `data/products.json`, reconciled with `data/meesho-sources.csv` and history logs.
3. Approved individual image files under `public/images/<SKU>/`, after source-match QA.
4. Repository and handoff legacy values only as search clues, never as commercial proof.

## Required next evidence

- Products 1–14: exact source URL plus dated size-wise pricing, availability, seller, rating/reviews, returns, garment attributes, included pieces, and source-image match.
- Product 15: an exact listing matching the supplied maroon rayon kurta and wide-leg pant co-ord across silhouette and garment details.
- Any future product: the complete approved-record evidence contract enforced by `npm run meesho:validate`.
