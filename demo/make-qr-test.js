import QRCode from "qrcode";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../seed/demo.db");
const OUT_DIR = path.join(__dirname, "../qr_test");

const db = new DatabaseSync(DB_PATH, { readOnly: true });
const rows = db
  .prepare(
    "SELECT barcode, product_name FROM products ORDER BY unique_scans_n DESC LIMIT 10"
  )
  .all();

const APP_URL = process.env.APP_URL || "https://nutribasket-tweaks.vercel.app";

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const row of rows) {
  const name = row.product_name
    .replace(/[^\w\- ]+/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();
  const file = path.join(OUT_DIR, `${name}_${row.barcode}.png`);
  const payload = `${APP_URL}/?product=${row.barcode}`;
  await QRCode.toFile(file, payload, {
    width: 400,
    margin: 2,
    errorCorrectionLevel: "M",
  });
  console.log(`${row.barcode}  ${name}.png  ->  ${payload}`);
}

console.log(`\nWrote ${rows.length} QR codes to qr_test/`);