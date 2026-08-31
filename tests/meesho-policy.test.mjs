import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const run = promisify(execFile);
const root = new URL("../", import.meta.url);

test("approved products require the complete commercial evidence contract", async () => {
  const source = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
  const approved = source.records.find(product => product.approvalStatus === "Approved");
  assert.ok(approved);
  delete approved.sellerName;
  approved.returnEligibility = "";
  delete approved.sourceCostBySize[approved.availableSizes[0]];

  const directory = await mkdtemp(join(tmpdir(), "dealstore-policy-"));
  const file = join(directory, "products.json");
  await writeFile(file, JSON.stringify(source));

  try {
    await assert.rejects(
      run(process.execPath, ["scripts/validate-meesho-catalogue.mjs"], {
        cwd: root,
        env: { ...process.env, MEESHO_PRODUCTS_FILE: file, MEESHO_VALIDATION_DATE: "2026-08-31" },
      }),
      error => {
        assert.match(error.stderr, /approved record missing sellerName/);
        assert.match(error.stderr, /approved record missing returnEligibility/);
        assert.match(error.stderr, /missing positive verified source cost/);
        return true;
      },
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("source research cannot accept a non-canonical or unapproved candidate", async () => {
  const source = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
  const product = source.records.find(candidate => candidate.approvalStatus === "Approved");
  assert.ok(product);
  const directory = await mkdtemp(join(tmpdir(), "dealstore-research-"));
  const file = join(directory, "source-research.csv");
  const research = [
    "sku,checked_at,candidate_url,outcome,identity_evidence,rejection_reason,next_action",
    `${product.sku},2026-08-31T11:00:00+04:00,https://www.meesho.com/not-the-source/p/abc123,Accepted,Similar title,,Publish`,
  ].join("\n");
  await writeFile(file, research);

  try {
    await assert.rejects(
      run(process.execPath, ["scripts/validate-meesho-catalogue.mjs"], {
        cwd: root,
        env: {
          ...process.env,
          MEESHO_RESEARCH_FILE: file,
          MEESHO_VALIDATION_DATE: "2026-08-31",
        },
      }),
      error => {
        assert.match(error.stderr, /accepted candidate must match an approved canonical source/);
        return true;
      },
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
