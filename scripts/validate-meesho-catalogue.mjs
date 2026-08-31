import { readFile, access } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const productsFile = process.env.MEESHO_PRODUCTS_FILE
  ? pathToFileURL(process.env.MEESHO_PRODUCTS_FILE)
  : new URL("../data/products.json", import.meta.url);
const data = JSON.parse(await readFile(productsFile, "utf8"));
const trackedProducts = [...(data.legacyRecords || []), ...data.records];
const errors = [];
const warnings = [];
const seen = new Set();
const requiredImages = ["01-catalogue-hero.png","02-front-model.png","03-occasion-lifestyle.png","04-three-quarter-view.png","05-fabric-detail.png","06-product-info-card.png"];
const validationDate = process.env.MEESHO_VALIDATION_DATE || new Date().toISOString().slice(0, 10);
const staleAfterDays = Number.parseInt(process.env.MEESHO_STALE_AFTER_DAYS || "1", 10);
const approvedRequiredFields = [
  "slug", "category", "occasion", "fabric", "colour", "sleeveType", "pattern",
  "length", "includedPieces", "stockStatus", "sellerName", "rating", "reviewCount",
  "returnEligibility", "sourceVerificationDate", "lastCheckedDate", "imageStatus",
  "websiteStatus", "metaFeedStatus", "sourceDataStatus",
];

function ageInDays(date) {
  const checked = Date.parse(`${date}T00:00:00Z`);
  const validating = Date.parse(`${validationDate}T00:00:00Z`);
  return Number.isFinite(checked) && Number.isFinite(validating)
    ? Math.floor((validating - checked) / 86_400_000)
    : null;
}

function parseCsvLine(line) {
  const fields = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) {
      fields.push(field);
      field = "";
    } else field += character;
  }
  fields.push(field);
  return fields;
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
    for (const field of approvedRequiredFields) {
      if (product[field] === undefined || product[field] === null || product[field] === "") errors.push(`${product.sku}: approved record missing ${field}`);
    }
    if (!/^https:\/\/(?:www\.)?meesho\.com\/.+\/p\/[a-z0-9]+\/?$/i.test(product.meeshoSourceUrl || "")) errors.push(`${product.sku}: approved record requires an exact HTTPS Meesho product URL`);
    if (product.profitValue !== data.profitInr) errors.push(`${product.sku}: profit value must equal ₹${data.profitInr}`);
    if (product.shippingStatus !== "Free") errors.push(`${product.sku}: shipping must remain free`);
    if (product.sourceDataStatus !== "Verified") errors.push(`${product.sku}: approved source data must be Verified`);
    if (!Number.isFinite(product.rating) || product.rating < 0 || product.rating > 5) errors.push(`${product.sku}: invalid rating`);
    if (!Number.isInteger(product.reviewCount) || product.reviewCount < 0) errors.push(`${product.sku}: invalid review count`);
    for (const size of product.availableSizes) {
      const sourceCost = product.sourceCostBySize?.[size];
      const retailPrice = product.retailPriceBySize?.[size];
      if (!Number.isInteger(sourceCost) || sourceCost <= 0) errors.push(`${product.sku}/${size}: missing positive verified source cost`);
      if (retailPrice !== sourceCost + data.profitInr) errors.push(`${product.sku}/${size}: available retail price must equal source + ₹${data.profitInr}`);
    }
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

const researchFile = process.env.MEESHO_RESEARCH_FILE
  ? pathToFileURL(process.env.MEESHO_RESEARCH_FILE)
  : new URL("../data/source-research.csv", import.meta.url);
const researchText = await readFile(researchFile, "utf8");
const researchLines = researchText.trim().split(/\r?\n/);
const researchHeader = researchLines.shift();
if (researchHeader !== "sku,checked_at,candidate_url,outcome,identity_evidence,rejection_reason,next_action") errors.push("Source research log has an invalid header");
const allowedResearchOutcomes = new Set(["Rejected", "Needs review", "Accepted"]);
for (const [index, line] of researchLines.entries()) {
  const [sku, checkedAt, candidateUrl, outcome, identityEvidence, rejectionReason, nextAction, ...extra] = parseCsvLine(line);
  const label = `Source research row ${index + 2}`;
  const product = trackedProducts.find(candidate => candidate.sku === sku);
  if (!product) errors.push(`${label}: unknown SKU ${sku}`);
  if (!Number.isFinite(Date.parse(checkedAt))) errors.push(`${label}: invalid checked_at`);
  if (candidateUrl && !/^https:\/\/(?:www\.)?meesho\.com\/.+\/p\/[a-z0-9]+\/?$/i.test(candidateUrl)) errors.push(`${label}: invalid candidate URL`);
  if (!allowedResearchOutcomes.has(outcome)) errors.push(`${label}: invalid outcome ${outcome}`);
  if (!identityEvidence || !nextAction || extra.length) errors.push(`${label}: incomplete or malformed evidence fields`);
  if (outcome === "Rejected" && !rejectionReason) errors.push(`${label}: rejected candidate requires a reason`);
  if (outcome === "Accepted" && (!product || product.meeshoSourceUrl !== candidateUrl || product.approvalStatus !== "Approved")) errors.push(`${label}: accepted candidate must match an approved canonical source`);
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
