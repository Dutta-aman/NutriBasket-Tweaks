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
- **Two git accounts on this machine:**
  - `CopyPasteEngineer-404` (default: `git@github.com`, key `~/.ssh/id_ed25519`, email amanduttakolkata13@gmail.com, gh CLI auth)
  - `Dutta-aman` (SSH alias `github-dutta`, key `~/.ssh/id_ed25519_dutta`, email amanduttakolkata@gmail.com → noreply `Dutta-aman@users.noreply.github.com`)
- **gh CLI** is authed as Dutta-aman (for NutriBasket-Tweaks work). GH007 email privacy: push with noreply email.

## Current project direction (QR pivot)

- Project changing: create product QRs (text/JSON/table format) → scan → full nutrition info (kcal, protein, carbs, total sugars, dietary fibre, total fat, saturated fat, cholesterol, sodium) + price + image
- **Data source DECIDED (Discussion #31):** Open Food Facts **INDIA** (`in.openfoodfacts.org`), NOT global. Hybrid: local SQLite seeded from OFF India (~22K products) → live OFF IN API fallback → manual demo product entries. Scan both barcode AND QR. FSSAI has NO public API (FoSCoS captcha/encrypted; paid 3rd-party only) — never pursue FSSAI API. Barcodes contain only a numeric ID; nutrition/FSSAI data comes from DB lookup keyed by GTIN.
- **AI = future only** (messenger: "good for diet / avoid")
- Demo work exists in `demo/` folder: QR generation scripts, QR→table page, URL-table server
- Scan feedback UX issue: #30 (trigger-based Scan button + success/fail feedback)

## Audit summary (tweaks branch, all filed as issues)

28 audit issues filed (#1-#28): price-₹0 bug, scan validation, URL encoding, fetch timeout, cache leak, deploy workflow, rate limit, CORS fallback, nutrition-0s, 404/502 conflation, NODE_ENV, negative cache, stale prices, scanner race, float totals, res.json guard, JSON 404 middleware, CTA label, transactionId, checkout QR glyph, mobile overflow (scanner frame + cards), dead products.js, VITE_API_URL slash, retry null, fetch ordering, a11y gaps, dead CSS.
