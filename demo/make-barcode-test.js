import bwipjs from "bwip-js";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../seed/demo.db");
const OUT_DIR = path.join(__dirname, "../barcode_test");

const db = new DatabaseSync(DB_PATH, { readOnly: true });
const rows = db
  .prepare(
    "SELECT barcode, product_name FROM products ORDER BY unique_scans_n DESC LIMIT 10"
  )
  .all();

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const row of rows) {
  const name = row.product_name
    .replace(/[^\w\- ]+/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();
  const file = path.join(OUT_DIR, `${name}_${row.barcode}.png`);
  const png = await bwipjs.toBuffer({
    bcid: "ean13",
    text: row.barcode,
    scale: 3,
    height: 15,
    includetext: true,
    textxalign: "center",
    backgroundcolor: "FFFFFF",
    paddingwidth: 8,
    paddingheight: 8,
  });
  fs.writeFileSync(file, png);
  console.log(`${row.barcode}  ${name}.png`);
}

console.log(`\nWrote ${rows.length} EAN-13 barcodes to barcode_test/`);