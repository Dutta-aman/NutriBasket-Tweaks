import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const SEED_FILE = process.env.SEED_FILE || path.join(import.meta.dirname, "../../seed/demo.db");
let db = null;

try {
  if (fs.existsSync(SEED_FILE)) {
    db = new DatabaseSync(SEED_FILE, { readOnly: true });
    db.exec("PRAGMA mmap_size = 268435456");
    console.log(`Seed database loaded: ${SEED_FILE}`);
  } else {
    console.warn(`Seed database not found at ${SEED_FILE} — falling back to live lookup only`);
  }
} catch (err) {
  console.warn(`Failed to load seed database: ${err.message} — falling back to live lookup only`);
  db = null;
}

export function findInSeed(barcode) {
  if (!db) return null;
  const row = db.prepare("SELECT * FROM products WHERE barcode = ?").get(barcode);
  if (!row) return null;
  return {
    name: row.product_name,
    brand: row.brands,
    barcode: row.barcode,
    calories: row.energy_kcal ?? null,
    protein: row.proteins ?? null,
    carbs: row.carbs ?? null,
    fat: row.fat ?? null,
    source: "seed",
    image_url: row.image_url ?? null,
  };
}
