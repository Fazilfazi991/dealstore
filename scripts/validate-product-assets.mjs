import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";

const expectedNames = [
  "01-catalogue-hero.png",
  "02-front-model.png",
  "03-occasion-lifestyle.png",
  "04-three-quarter-view.png",
  "05-fabric-detail.png",
  "06-product-info-card.png",
];
const throughIndex = process.argv.indexOf("--through");
const through = throughIndex === -1 ? 20 : Number(process.argv[throughIndex + 1]);
const productSource = await readFile(join(process.cwd(), "lib", "products.ts"), "utf8");
const failures = [];
const results = [];

function pngDimensions(buffer) {
  if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

for (let position = 11; position <= through; position += 1) {
  const sku = `MSH-EXP-${String(position).padStart(3, "0")}`;
  const folder = join(process.cwd(), "public", "images", sku);
  const result = { position, sku, images: 0, status: "PASS" };

  if (!productSource.includes(`id:"${sku}"`)) failures.push(`${sku}: missing product record`);
  if (!productSource.includes(`images:imageSet("${sku}")`)) failures.push(`${sku}: product record does not use the six-image set`);

  try {
    const files = (await readdir(folder)).filter((file) => file.toLowerCase().endsWith(".png")).sort();
    result.images = files.length;
    if (files.join("|") !== expectedNames.join("|")) failures.push(`${sku}: expected exactly ${expectedNames.join(", ")}`);
    if (files.some((file) => /(board|contact|collage|composite|six.views|showcase)/i.test(file))) failures.push(`${sku}: composite-style filename remains public`);

    for (const file of files) {
      const path = join(folder, file);
      const info = await stat(path);
      const dimensions = pngDimensions(await readFile(path));
      if (!info.size || !dimensions?.width || !dimensions?.height) failures.push(`${sku}/${file}: invalid PNG`);
      if (dimensions && dimensions.width > dimensions.height * 2) failures.push(`${sku}/${file}: unusually wide image may be a contact sheet`);
    }
  } catch {
    failures.push(`${sku}: missing image folder`);
  }

  if (failures.some((failure) => failure.startsWith(sku))) result.status = "FAIL";
  results.push(result);
}

console.log(JSON.stringify({ through, products: results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
