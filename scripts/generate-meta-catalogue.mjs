import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const args = new Set(process.argv.slice(2));
const baseArg = process.argv.find(value => value.startsWith("--base-url="));
const baseUrl = baseArg?.slice("--base-url=".length).replace(/\/$/, "") || "";
const write = args.has("--write");
const data = JSON.parse(await readFile(join(process.cwd(), "data", "products.json"), "utf8"));
const requiredImages = ["01-catalogue-hero.png","02-front-model.png","03-occasion-lifestyle.png","04-three-quarter-view.png","05-fabric-detail.png","06-product-info-card.png"];
const headers = ["id","item_group_id","title","description","availability","condition","price","currency","link","image_link","additional_image_link","brand","google_product_category","product_type","color","material","size","shipping","source_url","verification_date"];
const rows = [];
const blocked = [];

const csv = value => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"','""')}"` : text;
};

if (write && !baseUrl.startsWith("https://")) throw new Error("--write requires an HTTPS --base-url");

for (const product of data.records) {
  if (product.approvalStatus !== "Approved") continue;
  const reasons = [];
  if (!product.websiteStatus?.startsWith("Live")) reasons.push("website URL is not marked live");
  if (product.metaFeedStatus !== "Ready") reasons.push("Meta status is not Ready");
  if (product.stockStatus !== "Active at last check") reasons.push("source availability is not active");
  if (!product.returnEligibility) reasons.push("returns evidence is missing");
  if (!product.sourceVerificationDate) reasons.push("verification date is missing");
  for (const image of requiredImages) {
    try { await access(join(process.cwd(), "public", "images", product.sku, image)); }
    catch { reasons.push(`missing ${image}`); }
  }
  if (!baseUrl) reasons.push("HTTPS base URL was not supplied");
  if (reasons.length) { blocked.push({ sku: product.sku, reasons }); continue; }

  for (const size of product.availableSizes) {
    const retail = product.retailPriceBySize?.[size];
    if (!Number.isInteger(retail)) { blocked.push({ sku: `${product.sku}-${size}`, reasons: ["size price is missing"] }); continue; }
    const productUrl = `${baseUrl}/product/${product.slug}`;
    const images = requiredImages.map(name => `${baseUrl}/images/${product.sku}/${name}`);
    rows.push({
      id: `${product.sku}-${size}`, item_group_id: product.sku, title: product.productName,
      description: product.description, availability: "in stock", condition: "new",
      price: `${retail}.00 INR`, currency: "INR", link: productUrl,
      image_link: images[0], additional_image_link: images.slice(1).join(","), brand: "Dealstore",
      google_product_category: "Apparel & Accessories > Clothing > Dresses",
      product_type: product.category, color: product.colour, material: product.fabric, size,
      shipping: "IN:::0.00 INR", source_url: product.meeshoSourceUrl,
      verification_date: product.sourceVerificationDate
    });
  }
}

const report = { mode: write ? "write" : "dry-run", eligibleRows: rows.length, blockedProducts: blocked };
if (write) {
  const output = [headers.join(","), ...rows.map(row => headers.map(header => csv(row[header])).join(","))].join("\n") + "\n";
  await writeFile(join(process.cwd(), "data", "meta-catalogue.csv"), output, "utf8");
}
console.log(JSON.stringify(report, null, 2));
if (write && blocked.length) process.exitCode = 1;
