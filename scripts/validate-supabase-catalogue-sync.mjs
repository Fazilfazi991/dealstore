import { readFile } from "node:fs/promises";

const data = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
const sql = await readFile(new URL("../supabase/migrations/20260830200000_stage_verified_replacement_catalogue.sql", import.meta.url), "utf8");
const errors = [];
const approved = data.records.filter(product => product.approvalStatus === "Approved");

const replacementBlock = sql.match(/insert into verified_replacements values([\s\S]*?);/i)?.[1] || "";
const replacementRows = new Map(
  [...replacementBlock.matchAll(/\('([^']+)','([^']+)','([^']+)','([^']+)',(\d+),/g)]
    .map(match => [match[1], { slug: match[2], name: match[3], category: match[4], sourceCost: Number(match[5]) }]),
);

const variantBlock = sql.match(/insert into verified_replacement_variants values([\s\S]*?);/i)?.[1] || "";
const variantRows = new Map();
for (const match of variantBlock.matchAll(/\('([^']+)','([^']+)',(\d+)\)/g)) {
  const [, sku, size, cost] = match;
  variantRows.set(`${sku}/${size}`, Number(cost));
}

for (const product of approved) {
  const staged = replacementRows.get(product.sku);
  if (!staged) {
    errors.push(`${product.sku}: missing staged product row`);
    continue;
  }
  if (staged.slug !== product.slug) errors.push(`${product.sku}: staged slug mismatch`);
  if (staged.name !== product.productName) errors.push(`${product.sku}: staged name mismatch`);
  const minimumCost = Math.min(...product.availableSizes.map(size => product.sourceCostBySize[size]));
  if (staged.sourceCost !== minimumCost) errors.push(`${product.sku}: staged base cost must equal minimum verified source cost`);
  for (const size of product.availableSizes) {
    const stagedCost = variantRows.get(`${product.sku}/${size}`);
    if (stagedCost !== product.sourceCostBySize[size]) errors.push(`${product.sku}/${size}: staged source cost mismatch`);
  }
  for (const key of variantRows.keys()) {
    const [sku, size] = key.split("/");
    if (sku === product.sku && !product.availableSizes.includes(size)) errors.push(`${product.sku}/${size}: unapproved staged size`);
  }
}

for (const sku of replacementRows.keys()) {
  if (!approved.some(product => product.sku === sku)) errors.push(`${sku}: staged product is not approved`);
}

for (const required of [
  "catalogue-hero", "front-model", "occasion-lifestyle",
  "three-quarter-view", "fabric-detail", "product-info-card",
]) if (!sql.includes(`'${required}'`)) errors.push(`missing staged image ${required}`);

if (!/select v\.id,0,3 from public\.product_variants/i.test(sql)) errors.push("staged inventory must start at zero");
if (!/status='draft'/i.test(sql)) errors.push("replacement products must remain draft");
if (!/source_cost=0[\s\S]*where external_id='MSH-EXP-015'/i.test(sql)) errors.push("Product 15 unverified source cost must be cleared");
if (!/delete from public\.product_images[\s\S]*external_id='MSH-EXP-015'/i.test(sql)) errors.push("Product 15 images must remain quarantined");

console.log(`Supabase sync: ${approved.length} approved products, ${variantRows.size} verified variants, six images per product, zero staged inventory`);
for (const error of errors) console.error(`ERROR ${error}`);
if (errors.length) process.exitCode = 1;
