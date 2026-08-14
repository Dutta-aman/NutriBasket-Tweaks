#!/usr/bin/env python3
"""Generate seed/demo.db from the OFF CSV dump (dependable bulk path).

The search API proved unreliable (503/401 under load, page_size cap of 6),
so we use the sanctioned bulk download instead:
  https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz

Pipeline (one streaming pass over the gz, ~13 GB decompressed, ~5 min):
1. Read header to map column names (CSV has a header line, 211 columns).
2. Keep rows where countries_tags contains "en:india" AND nutrition present
   (energy-kcal_100g not empty).
3. Sort by (890-prefix, unique_scans_n desc) so the most-scanned Indian
   products come first; take LIMIT rows for the demo seed.

Usage: python3 scripts/make_csv_seed.py <path-to.csv.gz> [limit] [out.db]
"""

import gzip
import os
import sqlite3
import sys

HEADER_ROWS = 1
SCHEMA = """CREATE TABLE products (
  barcode TEXT PRIMARY KEY,
  product_name TEXT,
  brands TEXT,
  categories TEXT,
  image_url TEXT,
  energy_kcal REAL,
  fat REAL,
  satfat REAL,
  carbs REAL,
  sugars REAL,
  fiber REAL,
  proteins REAL,
  salt REAL,
  serving_size TEXT,
  quantity TEXT,
  unique_scans_n INTEGER
);"""

COLS = {
    "code": 0,
    "product_name": 1,
    "brands": 2,
    "categories": 3,
    "image_url": 4,
    "energy_kcal": 5,
    "fat": 6,
    "satfat": 7,
    "carbs": 8,
    "sugars": 9,
    "fiber": 10,
    "proteins": 11,
    "salt": 12,
    "serving_size": 13,
    "quantity": 14,
    "unique_scans_n": 15,
}


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "en.openfoodfacts.org.products.csv.gz"
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 500
    out = sys.argv[3] if len(sys.argv) > 3 else "seed/demo.db"

    field_idx = {}
    india_rows = []
    total = 0
    with gzip.open(src, "rt", encoding="utf-8", errors="replace", newline="") as f:
        header = f.readline().rstrip("\n").split("\t")
        pos_fallback = {
            "code": 0, "product_name": 10, "brands": 18, "categories": 21,
            "countries_tags": 40, "image_url": 82, "energy_kcal": 89, "fat": 92,
            "satfat": 93, "carbs": 129, "sugars": 130, "fiber": 146,
            "proteins": 150, "salt": 154, "serving_size": 50, "quantity": 13,
            "unique_scans_n": 75,
        }
        for name in COLS:
            if name in header:
                field_idx[name] = header.index(name)
            else:
                field_idx[name] = pos_fallback[name]
        field_idx["countries_tags"] = (
            header.index("countries_tags") if "countries_tags" in header
            else pos_fallback["countries_tags"]
        )

        for lineno, line in enumerate(f, start=2):
            parts = line.rstrip("\n").split("\t")
            if len(parts) != len(header):
                continue  # ragged row (embedded newline in a field)
            tags = parts[field_idx["countries_tags"]] if "countries_tags" in field_idx else ""
            if "en:india" not in tags.split(","):
                continue
            energy = num(parts[field_idx["energy_kcal"]])
            if energy is None:
                continue
            scans_raw = parts[field_idx["unique_scans_n"]].strip()
            scans = int(scans_raw) if scans_raw.isdigit() else None
            total += 1
            india_rows.append(
                (
                    parts[field_idx["code"]],
                    parts[field_idx["product_name"]],
                    parts[field_idx["brands"]],
                    parts[field_idx["categories"]],
                    parts[field_idx["image_url"]],
                    energy,
                    num(parts[field_idx["fat"]]),
                    num(parts[field_idx["satfat"]]),
                    num(parts[field_idx["carbs"]]),
                    num(parts[field_idx["sugars"]]),
                    num(parts[field_idx["fiber"]]),
                    num(parts[field_idx["proteins"]]),
                    num(parts[field_idx["salt"]]),
                    parts[field_idx["serving_size"]],
                    parts[field_idx["quantity"]],
                    scans,
                )
            )
            if lineno % 2_000_000 == 0:
                print(f"  scanned {lineno} rows, {total} India+nutrition so far", file=sys.stderr)

    print(f"  total India products with nutrition: {total}", file=sys.stderr)
    india_rows.sort(key=lambda r: (r[0].startswith("890"), r[15] or 0), reverse=True)
    rows = india_rows[:limit]

    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    conn = sqlite3.connect(out)
    conn.execute(SCHEMA)
    conn.executemany("INSERT INTO products VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", rows)
    conn.execute("CREATE INDEX idx_products_brand ON products(brands)")
    conn.commit()
    conn.close()

    print(f"  wrote {out}: {len(rows)} products ({limit} requested), {os.path.getsize(out) / 1024:.0f} KB")


if __name__ == "__main__":
    main()