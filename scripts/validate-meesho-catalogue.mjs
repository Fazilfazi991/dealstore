import { readFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const data = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
const trackedProducts = [...(data.legacyRecords || []), ...data.records];
const errors = [];
const warnings = [];
const seen = new Set();
const requiredImages = ["01-catalogue-hero.png","02-front-model.png","03-occasion-lifestyle.png","04-three-quarter-view.png","05-fabric-detail.png","06-product-info-card.png"];
const validationDate = process.env.MEESHO_VALIDATION_DATE || new Date().toISOString().slice(0, 10);
const staleAfterDays = Number.parseInt(process.env.MEESHO_STALE_AFTER_DAYS || "1", 10);

function ageInDays(date) {
  const checked = Date.parse(`${date}T00:00:00Z`);
  const validating = Date.parse(`${validationDate}T00:00:00Z`);
  return Number.isFinite(checked) && Number.isFinite(validating)
    ? Math.floor((validating - checked) / 86_400_000)
    : null;
}

for (const product of trackedProducts) {
  if (seen.has(product.sku)) errors.push(`${product.sku}: duplicate SKU`);
  seen.add(product.sku);
  if (!product.productName) errors.push(`${product.sku}: missing name`);
  if (!product.description) errors.push(`${product.sku}: missing description`);
  if (!product.availableSizes.length) warnings.push(`${product.sku}: missing verified sizes`);
  if (!product.meeshoSourceUrl) warnings.push(`${product.sku}: missing source URL`);
  if (!Object.keys(product.sourceCostBySize || {}).length) warnings.push(`${product.sku}: missing verified size-wise source prices`);
  for (const [size, cost] of Object.entries(product.sourceCostBySize || {})) {
    if (product.retailPriceBySize?.[size] !== cost + data.profitInr) errors.push(`${product.sku}/${size}: retail price must equal source + ₹${data.profitInr}`);
  }
  if (product.approvalStatus === "Approved") {
    if (!product.sourceVerificationDate || !product.lastCheckedDate) errors.push(`${product.sku}: approved record is unverified or stale`);
    if (product.lastCheckedDate) {
      const checkedAge = ageInDays(product.lastCheckedDate);
      if (checkedAge === null) errors.push(`${product.sku}: invalid last-checked date ${product.lastCheckedDate}`);
      else if (checkedAge < 0) errors.push(`${product.sku}: last-checked date is in the future`);
      else if (checkedAge > staleAfterDays) warnings.push(`${product.sku}: monitoring is stale by ${checkedAge} days (limit ${staleAfterDays})`);
    }
    for (const image of requiredImages) {
      try { await access(`${root}public/images/${product.sku}/${image}`); }
      catch { errors.push(`${product.sku}: missing ${image}`); }
    }
  }
  if (/board|collage|contact.sheet|composite/i.test(JSON.stringify(product))) errors.push(`${product.sku}: collage/contact-sheet reference detected`);
  if (product.websiteStatus.startsWith("Legacy published") && product.approvalStatus !== "Approved") warnings.push(`${product.sku}: legacy storefront record requires verification backfill`);
  else if (!product.websiteStatus.startsWith("Draft") && product.approvalStatus !== "Approved") errors.push(`${product.sku}: unapproved product cannot be published`);
}

const websiteSource = await readFile(new URL("../lib/products.ts", import.meta.url), "utf8");
const websiteSkus = [...websiteSource.matchAll(/id:"(MSH-[A-Z]+-\d{3})"/g)].map(match => match[1]);
if (websiteSkus.length !== new Set(websiteSkus).size) errors.push("Website catalogue contains duplicate SKUs");
if (websiteSkus.includes("MSH-EXP-015")) errors.push("Product 15 must remain excluded until source verification");

for (const sku of websiteSkus) if (!trackedProducts.some(product => product.sku === sku)) errors.push(`${sku}: website product missing from canonical data`);
console.log(`Meesho catalogue: ${trackedProducts.length} tracked records; ${websiteSkus.length} sellable website products`);
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
if (errors.length) process.exitCode = 1;
