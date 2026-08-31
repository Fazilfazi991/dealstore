import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);

test("Meta dry-run admits only the five live approved replacements", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    "scripts/generate-meta-catalogue.mjs",
    "--base-url=https://dealstore-five.vercel.app",
  ], {
    cwd: new URL("../", import.meta.url),
    env: { ...process.env, MEESHO_VALIDATION_DATE: "2026-08-31" },
  });
  const report = JSON.parse(stdout);
  assert.equal(report.eligibleRows, 28);
  assert.deepEqual(report.blockedProducts, []);
});

test("generated Meta feed has unique variants, free shipping, and no internal costs", async () => {
  const csv = await readFile(new URL("../data/meta-catalogue.csv", import.meta.url), "utf8");
  const [header, ...rows] = csv.trim().split(/\r?\n/);
  assert.equal(rows.length, 28);
  assert.equal(new Set(rows.map(row => row.split(",", 1)[0])).size, 28);
  assert.match(header, /item_group_id/);
  assert.doesNotMatch(header, /source.cost|profit/i);
  for (const row of rows) {
    assert.match(row, /IN:::0\.00 INR/);
    assert.match(row, /https:\/\/dealstore-five\.vercel\.app\/product\//);
  }
});
