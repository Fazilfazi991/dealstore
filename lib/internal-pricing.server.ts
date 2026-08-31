import "server-only";
import { calculateSellingPrice } from "@/lib/commerce/pricing";

export const sourceCostsBySku: Record<string, number> = {
  "MSH-ETH-001-S": 269, "MSH-ETH-001-M": 278, "MSH-ETH-001-L": 287,
  "MSH-ETH-001-XL": 302, "MSH-ETH-001-XXL": 302, "MSH-ETH-001-XXXL": 302,
  "MSH-ETH-001-4XL": 302, "MSH-ETH-001-5XL": 302, "MSH-ETH-001-6XL": 302,
  "MSH-ETH-002": 409, "MSH-SET-003": 475,
  "MSH-SET-004-S": 458, "MSH-SET-004-M": 474, "MSH-SET-004-L": 474,
  "MSH-SET-004-XL": 474, "MSH-SET-004-XXL": 474, "MSH-SET-004-XXXL": 474,
  "MSH-GWN-005": 632, "MSH-GWN-006": 490,
  "MSH-WES-007-S": 476, "MSH-WES-007-M": 476, "MSH-WES-007-L": 476,
  "MSH-WES-007-XL": 476, "MSH-WES-007-XXL": 476,
  "MSH-WES-008": 479, "MSH-WES-009": 558, "MSH-WES-010": 637,
  "MSH-EXP-011": 485, "MSH-EXP-012": 588, "MSH-EXP-013": 526, "MSH-EXP-014": 679,
  "MSH-EXP-016-XS": 480, "MSH-EXP-016-S": 490, "MSH-EXP-016-M": 490,
  "MSH-EXP-016-L": 490, "MSH-EXP-016-XL": 490, "MSH-EXP-016-XXL": 490, "MSH-EXP-016-XXXL": 490,
  "MSH-EXP-017-S": 388, "MSH-EXP-017-M": 368, "MSH-EXP-017-L": 388,
  "MSH-EXP-017-XL": 388, "MSH-EXP-017-XXL": 388,
  "MSH-EXP-018-S": 351, "MSH-EXP-018-M": 351, "MSH-EXP-018-L": 351,
  "MSH-EXP-018-XL": 351, "MSH-EXP-018-XXL": 351,
  "MSH-EXP-019-S": 450, "MSH-EXP-019-M": 450, "MSH-EXP-019-L": 450,
  "MSH-EXP-019-XL": 450, "MSH-EXP-019-XXL": 450,
  "MSH-EXP-020-S": 482, "MSH-EXP-020-M": 482, "MSH-EXP-020-L": 482,
  "MSH-EXP-020-XL": 482, "MSH-EXP-020-XXL": 482, "MSH-EXP-020-XXXL": 482,
  "MSH-EXP-021-S": 349, "MSH-EXP-021-M": 371, "MSH-EXP-021-L": 371,
  "MSH-EXP-021-XL": 374, "MSH-EXP-021-XXL": 379, "MSH-EXP-021-XXXL": 379,
  "MSH-EXP-022-XXS": 381, "MSH-EXP-022-S": 476, "MSH-EXP-022-M": 441,
  "MSH-EXP-022-L": 441, "MSH-EXP-022-XL": 476, "MSH-EXP-022-XXL": 476,
  "MSH-EXP-023-XS": 344, "MSH-EXP-023-S": 353, "MSH-EXP-023-M": 353,
  "MSH-EXP-023-L": 353, "MSH-EXP-023-XL": 353,
  "MSH-EXP-024-S": 469, "MSH-EXP-024-M": 469, "MSH-EXP-024-L": 469,
  "MSH-EXP-024-XL": 479, "MSH-EXP-024-XXL": 479, "MSH-EXP-024-XXXL": 489,
  "MSH-EXP-024-4XL": 489,
  "MSH-EXP-025-XS": 403, "MSH-EXP-025-S": 421, "MSH-EXP-025-M": 421,
  "MSH-EXP-025-L": 421, "MSH-EXP-025-XL": 421, "MSH-EXP-025-XXL": 421,
};

export const sellingPriceFor = (sku: string) => {
  const exact = sourceCostsBySku[sku];
  if (exact !== undefined) return calculateSellingPrice(exact);
  const base = Object.keys(sourceCostsBySku).find((candidate) => sku.startsWith(`${candidate}-`));
  if (!base) throw new Error("Invalid source cost");
  return calculateSellingPrice(sourceCostsBySku[base]);
};
