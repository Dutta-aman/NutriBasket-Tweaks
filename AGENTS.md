# Agent Memory & Project Conventions

## Issue/Discussion Workflow (IMPORTANT)

**Classification:**
- **Problems, bugs, dead code** → GitHub **Issues** (with proposed fixes + acceptance criteria)
- **Addons / improvements / suggestions** → GitHub **Discussions** (Ideas category) — team debates first
- **Accepted suggestion** → published as an **`enhancement`-labeled issue** (linked to the discussion)
- **Implemented** → PR referencing the issue (`Fixes #NN`) → merge closes it

**MANDATORY RULE:** Before creating ANY issue or discussion (or converting a suggestion into an issue), the agent MUST first tell the user as a **recommendation / suggestion** and get confirmation. Never create issues/discussions without asking first.

## Project Context

- **Main working repo:** `Dutta-aman/NutriBasket-Tweaks` (private, Dutta-aman account) — cloned at `/home/india/Store D/opencode/NutriBasket_Tweaks` (branch `main`, SSH via `git@github-dutta` = Dutta-aman's key)
- **Old repo (parked, used later):** `Dutta-aman/NutriBasket` (fork of madhushreemail-stack/NutriBasket) — local dir: `/home/india/Store D/opencode/NutriBasket 4th yr project`
- **Git identity on this machine:**
  - `Dutta-aman` (SSH alias `github-dutta`, key `~/.ssh/id_ed25519_dutta`, email amanduttakolkata@gmail.com → noreply `Dutta-aman@users.noreply.github.com`)
- **gh CLI** is authed as Dutta-aman (for NutriBasket-Tweaks work). GH007 email privacy: push with noreply email.

## Current project direction (QR pivot)

- Project changing: create product QRs (text/JSON/table format) → scan → full nutrition info (kcal, protein, carbs, total sugars, dietary fibre, total fat, saturated fat, cholesterol, sodium) + price + image
- **Data source DECIDED (Discussion #31):** Open Food Facts **INDIA** (`in.openfoodfacts.org`), NOT global. Scan both barcode AND QR. FSSAI has NO public API (FoSCoS captcha/encrypted; paid 3rd-party only) — never pursue FSSAI API. Barcodes contain only a numeric ID; nutrition/FSSAI data comes from DB lookup keyed by GTIN.
- **Seed architecture (Discussion #31, decided 14 Aug 2026):** TWO static SQLite seeds committed to the repo (plain git, no LFS — 5–15 MB fits GitHub limits):
  - `seed/demo.db` — **DONE**: 500 popular Indian products, 172 KB (Parle G, Maggi, Good Day, Balaji, Sprite, Tata Salt, Bisleri; 486/500 full macros; 890-prefix codes; sorted by unique_scans_n)
  - `seed/products.db` — full India seed (~1,800 nutrition-complete products from CSV; deferred)
  - **Server loads seed at startup READ-ONLY via Node 22.13+ built-in `node:sqlite`** (`new DatabaseSync(..., { readOnly: true })` + `PRAGMA mmap_size`) — no native compilation, ~ms open; serve `GET /api/products/:barcode` with gzip. Never write at runtime; `SEED_FILE` env switches seeds; `.node-version` ≥ 22.13 pinned.
  - **Build must NOT fetch OFF data** (500 build-min/month Render budget + OFF forbids bulk API pulls). Seeds generated ONCE locally, committed; regenerate rarely.
  - **DATA PATH = OFF CSV DUMP (search API DEPRECATED — verified 503/401 under load, page_size cap 6, 100-page/10K cap):** `wget -c https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz` (1.19 GiB, S3, ~5 min) → `scripts/make_csv_seed.py <csv.gz> [limit] [out.db]` streams 13 GB, filters `en:india` + energy present (21,188 India rows / 1,803 with energy), sorts by (890-prefix, unique_scans_n desc). Old API script `make_demo_seed.py` retired.
  - **Images:** hotlink `images.openfoodfacts.org/...` (verified no referer check) — never redistribute (CC BY-SA).
  - **License:** OFF data = **ODbL 1.0** — attribution required in README + app ("Contains information from Open Food Facts, made available under the Open Database License (ODbL)") + license URI; seed is a Derivative Database → keep public under ODbL; add LICENSE-ODbL notice file.
  - **Schema fields:** code (STRING, leading zeros matter), product_name, brands, categories, image_url (construct from code+rev for Parquet), energy-kcal_100g, fat_100g, saturated-fat_100g, carbohydrates_100g, sugars_100g, fiber_100g, proteins_100g, salt_100g (CSV has sodium → ×2.5), serving_size, quantity, scans_n/unique_scans_n.
- **AI = future only** (messenger: "good for diet / avoid")
- Demo work exists in `demo/` folder: QR generation scripts, QR→table page, URL-table server
- Scan feedback UX issue: #30 (trigger-based Scan button + success/fail feedback)

## Audit summary (tweaks branch, all filed as issues)

28 audit issues filed (#1-#28): price-₹0 bug, scan validation, URL encoding, fetch timeout, cache leak, deploy workflow, rate limit, CORS fallback, nutrition-0s, 404/502 conflation, NODE_ENV, negative cache, stale prices, scanner race, float totals, res.json guard, JSON 404 middleware, CTA label, transactionId, checkout QR glyph, mobile overflow (scanner frame + cards), dead products.js, VITE_API_URL slash, retry null, fetch ordering, a11y gaps, dead CSS.
