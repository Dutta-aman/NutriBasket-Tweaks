# NutriBasket

NutriBasket — scan product barcodes or QR codes to get nutrition info (calories, protein, carbs, fat) for Indian products.

A final-year student project: point your phone camera at any packaged product, and NutriBasket returns its nutrition facts, lets you enter the price, and builds a nutrition-aware basket for checkout (prices in INR).

## Features

- **Camera barcode + QR scanning** — live feed decoded with ZXing (`@zxing/browser`), with success/failure feedback and a retry option; handles camera permission denial, missing camera, and busy camera gracefully. QR codes are decoded and the embedded GTIN (bare digits, URL, JSON, or GS1 format) is extracted so the product's nutrition info can be shown; payment QR codes (UPI/PayTM/GPay) are detected and rejected with "Payment not available in app"
- **GTIN check-digit validation** — every barcode is validated client-side and re-validated by the server before a lookup is attempted
- **Manual barcode entry** — a numeric fallback form for when scanning fails (poor lighting, damaged barcode, no camera)
- **Price entry** — Open Food Facts carries no price data, so the user enters the INR price; prices are remembered for the session
- **Basket** — quantity controls, remove items, per-item nutrition, running totals for calories, protein, carbs, and fat, plus the total bill
- **Checkout (demo payment flow)** — order summary with a simulated UPI payment screen
- **Payment success receipt** — receipt page with a generated transaction ID
- **Seeded offline lookup + live fallback** — 500 popular Indian products are served from a bundled SQLite seed (no network call); anything else falls back to the Open Food Facts India database
- **Rate limiting** — the product API allows 60 requests per minute per IP

## Tech Stack

| Layer | Choice |
| --- | --- |
| Frontend | React 19 + Vite 8 (JSX, plain CSS, no TypeScript) |
| Barcode decoding | `@zxing/browser` |
| Backend | Express on Node.js (ESM) |
| Seed database | `node:sqlite` built-in module — Node >= 22.5, no native compilation |
| Hosting | Vercel (frontend, static) + Render (backend, free tier) |

## Architecture

```
┌───────────────┐   GET /api/products/:barcode   ┌───────────────────┐
│    Browser    │ ──────────────────────────────▶ │  Render backend   │
│ (React + Vite │ ◀────────────────────────────── │   Express API     │
│  on Vercel)   │         JSON response          └─────────┬─────────┘
└───────────────┘                                          │
                                    ┌───────────────────────┴──────────────┐
                                    ▼                                      ▼
                          ┌──────────────────┐    miss          ┌───────────────────────┐
                          │  seed/demo.db    │ ───────────────▶ │  Open Food Facts      │
                          │  SQLite, 500     │                  │  in.openfoodfacts.org │
                          │  products        │                  └───────────────────────┘
                          └──────────────────┘
```

The frontend is a static Vite build served by Vercel. When a barcode is scanned or typed in, the app calls `GET /api/products/:barcode` on the Render-hosted Express API. The server first looks the code up in the bundled SQLite seed database — no network involved, so the most common products answer fast. If the code is not in the seed, the server queries the Open Food Facts India mirror (`in.openfoodfacts.org`), normalizes the response, and caches it in memory for 24 hours.

## Live Deployments

| Target | URL |
| --- | --- |
| Frontend | https://nutribasket-tweaks.vercel.app |
| Backend API | https://nutribasket-api.onrender.com (health check at `/health`) |

## Getting Started

Prerequisites: **Node >= 22.5** (for `node:sqlite`) and npm.

### 1. Clone and install

```bash
git clone <repo-url>
cd NutriBasket_Tweaks
npm install          # frontend dependencies (root)
cd server
npm install          # backend dependencies
cd ..
```

### 2. Backend (port 3001)

```bash
cd server
cp .env.example .env   # adjust PORT / CLIENT_ORIGIN / OFF_BASE_URL as needed
npm run dev            # or: node index.js
```

Verify: `curl http://localhost:3001/health` → `{"status":"ok"}`

The server's `.env.example`:

```bash
PORT=3001
CLIENT_ORIGIN=https://nutribasket-tweaks.vercel.app
OFF_BASE_URL=https://world.openfoodfacts.org
```

### 3. Frontend (port 5173)

```bash
npm run dev
```

Open http://localhost:5173. In development, leave `VITE_API_URL` empty — the Vite dev server proxies `/api` requests to `http://localhost:3001`, so no `.env` file is needed locally (the root `.env.example` documents this). Set `VITE_API_URL` only when pointing the frontend at a deployed backend.

Note: the camera (`getUserMedia`) requires a secure context — `https://` or `http://localhost`. Testing on a physical phone needs the deployed site or a tunnel (e.g. ngrok).

## Environment Variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Frontend (Vercel) | Base URL of the backend; empty in dev (Vite proxy), set to the Render URL in production |
| `CLIENT_ORIGIN` | Backend (Render) | Comma-separated list of allowed CORS origins |
| `PORT` | Backend (Render) | Server port, default `3001` |
| `SEED_FILE` | Backend (Render, optional) | Path to the SQLite seed; defaults to `seed/demo.db` |
| `OFF_BASE_URL` | Backend (Render, optional) | Open Food Facts API base; defaults to `https://in.openfoodfacts.org` |

## API

| Endpoint | Description | Responses |
| --- | --- | --- |
| `GET /` | Service info + data license attribution | `200` |
| `GET /health` | Health check (used by Render) | `200` |
| `GET /api/products/:barcode` | Nutrition lookup by GTIN (8–14 digits, valid check digit) | `200`, `400`, `404`, `429`, `502` |

Error semantics:

- `400 invalid_barcode` — malformed code or failed check digit
- `404 product_not_found` — not in the seed or Open Food Facts
- `429 rate_limited` — more than 60 requests per minute from one IP
- `502 upstream_error` — Open Food Facts unreachable

Example — Parle-G:

```bash
curl https://nutribasket-api.onrender.com/api/products/8901719134852
```

```json
{
  "name": "Parle G biscuit",
  "brand": "Parle",
  "barcode": "8901719134852",
  "calories": 3.4,
  "protein": 6.9,
  "carbs": 77.3,
  "fat": 13,
  "source": "seed",
  "image_url": "https://images.openfoodfacts.org/images/products/890/171/913/4852/front_en.3.400.jpg"
}
```

## Seed Database

`seed/demo.db` is a static SQLite database of **500 popular Indian products** (Parle-G, Maggi, Good Day, Sprite, Tata Salt, Bisleri and more), generated from the Open Food Facts CSV dump and committed to the repo. The server opens it read-only through Node's built-in `node:sqlite` (`DatabaseSync`), so the most-scanned barcodes are answered with no network call and no Open Food Facts API usage — important on Render's free tier.

To rebuild it (e.g. with a newer dump):

```bash
# download the OFF product dump once (~1.2 GB compressed)
wget -c https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz

# usage: python3 scripts/make_csv_seed.py <csv.gz> [limit] [out.db]
python3 scripts/make_csv_seed.py en.openfoodfacts.org.products.csv.gz 500 seed/demo.db
```

`scripts/make_csv_seed.py` streams the gzipped dump in one pass (~5 minutes), keeps rows tagged `en:india` that have energy data, sorts by most-scanned first, and writes up to `limit` rows (default 500) into `out.db` (default `seed/demo.db`).

## Screens

- **Home** — overview with stat cards (products, bill, calories, protein, carbs, fat) and quick links to Scan / Basket / Checkout
- **Scan Product** — camera scanner for barcodes and product QR codes, with manual barcode entry fallback, success/failure feedback
- **Product Info** — product photo, nutrition grid, price entry, Add to Basket
- **Basket** — quantity controls, per-item nutrition, running totals
- **Checkout** — order summary with a simulated UPI payment screen
- **Payment Success** — receipt with a generated transaction ID

## Project Structure

```
NutriBasket_Tweaks/
├── src/                      # React frontend (Vite)
│   ├── App.jsx               # screen routing, scan flow, basket state
│   ├── components/           # BarcodeScanner (ZXing), ErrorBoundary, layout
│   ├── lib/                  # api.js (fetch client), barcode.js (GTIN check)
│   ├── screens/              # Home, ScanProduct, ProductInfo, Basket, ...
│   └── styles/               # plain CSS, emerald theme
├── server/                   # Express backend
│   ├── index.js              # routes, rate limiting, GTIN validation
│   └── lib/                  # seed.js (node:sqlite), off.js (OFF client), cache.js
├── seed/
│   └── demo.db               # 500-product SQLite seed (read-only at runtime)
├── scripts/
│   └── make_csv_seed.py      # builds demo.db from the OFF CSV dump
├── .github/workflows/
│   └── render-deploy.yml     # auto-deploy to Render on push
├── render.yaml               # Render Blueprint (rootDir: server)
├── vercel.json               # Vercel framework config (vite)
└── package.json              # frontend project (root)
```

## Data & License

Nutrition data comes from **Open Food Facts**, © Open Food Facts contributors, and is licensed under the [Open Database License 1.0 (ODbL)](https://opendatacommons.org/licenses/odbl/1-0/) — full license text in [LICENSE-ODbL](./LICENSE-ODbL). The bundled seed database is a snapshot of that data and carries the same license; the API root response includes the `data_license` attribution.

**FSSAI advisory:** FSSAI recommends that packaged food labels carry a QR code encoding the product's GTIN, batch number, and expiry date. QR scanning as used here (GTIN extraction → nutrition lookup) is aligned with that direction, but the nutrition facts panel on the physical label remains the authoritative source. Payment QR codes (UPI/PayTM/GPay) are not supported and are rejected with a clear message.

## Limitations & Roadmap

- **Seed coverage** — the demo seed holds 500 products; the full Indian catalogue on Open Food Facts is ~22,000 products, of which only ~1,800 have complete nutrition data. Shipping the full nutrition-complete set as a second seed is planned.
- **Cold starts** — Render's free tier sleeps after ~15 minutes of inactivity; the first request after an idle period can take ~30 seconds to wake the service.
- **No accounts** — prices and baskets live only in the current browser session; there are no users and no persistence.
- **Demo payments** — checkout shows a simulated UPI screen and a generated transaction ID; no real money moves.
- **Roadmap ideas** — full India seed, automated tests, basket/scan-history persistence, real payment integration, AI-based nutrition guidance.