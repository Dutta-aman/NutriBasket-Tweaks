![NutriBasket Banner](assets/banner.svg)

# NutriBasket

> Fork project from [madhushreemail-stack/NutriBasket](https://github.com/madhushreemail-stack/NutriBasket)

NutriBasket is a grocery and nutrition assistant web app: scan a product's barcode or QR code with your phone camera, retrieve its nutrition information (calories, protein, carbs, fat) from the Open Food Facts database, enter the price, and build a nutrition-aware basket for checkout (prices in INR).

The app runs on branch `tweaks`. History: 11 original commits (upstream UI work by madhushreeG7 plus fork documentation commits by Dutta-aman), followed by commit `b209376` ("Add Express backend with Open Food Facts lookup (server/)") which added `server/` and `render.yaml`. The frontend work described under "Phase A" and "Phase B" below is committed on this branch. Remotes: `origin` = Dutta-aman/NutriBasket, `upstream` = madhushreemail-stack/NutriBasket.

---

## Features

- **Real barcode / QR camera scanning** — live camera feed decoded with ZXing (`@zxing/browser`), with graceful handling of permission denial, missing camera, busy camera, and generic errors (plus retry)
- **Manual barcode entry fallback** — a numeric entry form (validated client-side by GTIN check digit, re-validated by the server) for cases where scanning fails (poor lighting, damaged barcode, etc.)
- **Open Food Facts nutrition lookup** — the Express backend queries the public Open Food Facts API (no API key required) and returns a clean, normalized response
- **Product photos** — product image displayed when Open Food Facts provides one (shopping-cart placeholder otherwise)
- **User-entered session prices (INR)** — Open Food Facts carries no price data (barcodes encode product identity, not price), so the app asks the user for the price; prices are remembered per session and injected into basket items
- **Nutrition-aware basket** — quantity controls, remove items, per-item nutrition, running totals for calories, protein, carbs, and fat, plus total bill
- **Checkout + simulated UPI payment screen** — order summary and a UPI-style QR payment placeholder ("Use any UPI app")
- **Receipt screen** — payment success page with a generated transaction ID

---

## Tech Stack

### Frontend

| Layer | Choice |
| --- | --- |
| Framework | React 19 + Vite 8 (plain JavaScript, no TypeScript) |
| Barcode decoding | `@zxing/browser` ^0.2.1 (bundles its own types; `@zxing/library` as peer) |
| Routing | Hand-rolled `useState` screen switching in `src/App.jsx` (no router library) |
| State | `useState` / prop drilling in `src/App.jsx` (no state library) |
| Styling | Plain CSS, emerald "premium" theme (`src/styles/*.css`) |
| Linting | Oxlint |
| Tests | None yet (no test script) |

### Backend

| Layer | Choice |
| --- | --- |
| Runtime | Node.js 18+ (ESM, `"type": "module"`) |
| Framework | Express ^4.21.2 |
| Middleware | cors ^2.8.5, helmet ^8.0.0, dotenv ^16.4.5 |
| Data source | Open Food Facts API v2 (`https://world.openfoodfacts.org/api/v2/product/{code}.json`) |
| Cache | In-memory `Map` with 24-hour TTL |
| Database | None (prices and baskets are session-only) |

### Deployment

| Property | Value |
| --- | --- |
| Frontend host | Vercel (project `nutri-basket`, `vercel.json` with `{"framework":"vite"}`) |
| Backend host | Render (service `nutribasket-api`, free plan, region Oregon, branch `tweaks`, rootDir `server`, auto-deploy on commit, health check `/health`) |
| Environment | `VITE_API_URL` set as Vercel production env var; `CLIENT_ORIGIN` set as Render env var |

---

## Live Deployment

| Target | URL |
| --- | --- |
| Frontend (production alias) | https://nutri-basket-six.vercel.app |
| Backend API | https://nutribasket-api.onrender.com |

- The frontend reads `VITE_API_URL` at build time; in production it is set to `https://nutribasket-api.onrender.com`, so all `/api/products/:barcode` calls go to Render.
- The backend runs on the Render **free tier**, which spins down after ~15 minutes of inactivity. **The first request after an idle period can take ~40 seconds** (cold start); subsequent requests are fast.
- The Render Blueprint (`render.yaml`) defines the service. This fork's dev-channel service is wired to the `tweaks` branch; because it was created via the Render CLI (no GitHub webhook registered), auto-deploys are driven by a GitHub Action (`.github/workflows/render-deploy.yml`) that calls the Render API trigger endpoint with `commitId: ${{ github.sha }}` on every push to `main` or `tweaks`. Per-repo config lives in repo settings: the `RENDER_API_KEY` secret (long-lived Render API key) and the `RENDER_SERVICE_ID` variable (the `srv-...` service id). See "Deployment Model" below.
- Browsing the API root (`https://nutribasket-api.onrender.com/`) returns service info JSON — `GET /`, `/health`, and `/api/products/:barcode` all respond 200.

## Deployment Model

Two tracks plus self-service:

| Track | Code source | Owner | Auto-deploy mechanism |
| --- | --- | --- | --- |
| **Dev channel** | this fork's `tweaks` (and `main`) | fork owner | GitHub Action → Render API (`RENDER_API_KEY` secret + `RENDER_SERVICE_ID` variable) |
| **Canonical (the project's shared deployment)** | upstream repo `main` (after PR merge) | upstream repo owner | Render dashboard connection (native GitHub webhook) — recommended; or the same Action route |

- **Fork → upstream:** a PR merged into upstream `main` triggers the canonical deployment, so the whole team uses that URL.
- **Upstream → fork:** a PR merged into this fork's branch triggers this fork's Action and deploys the dev channel.
- **PRs themselves never deploy** — only merges (pushes) do.
- **Webhook vs Action:** pick one per repo. Connecting the repo in the Render dashboard registers the webhook (native auto-deploy, no secrets needed). The Action route is for CLI-created services: set `RENDER_API_KEY` (Render account → API Keys → long-lived key) and `RENDER_SERVICE_ID` (the `srv-...` id) under Settings → Secrets and variables → Actions. If both are configured the repo deploys twice per push (harmless); if the Action is unconfigured it fails loudly and the webhook still deploys.

**Deploy your own instance (anyone using the project):**

1. Create a free Render account.
2. Render dashboard → New → Blueprint → connect your repo fork (the committed `render.yaml` defines everything: `rootDir: server`, Node runtime, free plan, build `npm install`, start `npm start`, health check `/health`). Set the `CLIENT_ORIGIN` env var to your frontend URL. Connecting via the dashboard registers the webhook, so every push to `main` auto-deploys.
3. For the frontend: create a Vercel project from the repo (framework Vite) and set the `VITE_API_URL` env var to your Render service URL.
4. If you created the Render service via CLI instead of the dashboard, configure the two Actions settings described above.

---

## Previous State of the Repo (before the recent work, at commit `1cbfc9e`)

The repo started as a stock Vite React template with 29 tracked files, `react` ^19.2.7, `react-dom` ^19.2.7, `lucide-react` ^1.25.0, and devDeps `vite` ^8.1.1, `@vitejs/plugin-react`, `oxlint`, `@types/react`, `@types/react-dom`. Scripts: `dev`, `build`, `lint`, `preview` (no test script).

**Screens and navigation**

- 7 screens with hand-rolled `useState` routing in `src/App.jsx` (`page: welcome/home/scan/product/basket/checkout/success`), a `basket` array, and a `selectedProduct` id
- No router library, no state library, no `fetch` anywhere, no persistence (the basket was lost on refresh)

**Data**

- 5 hardcoded products in `src/data/products.js` (Amul Milk ₹35, Brown Bread ₹45, Apple ₹30, Eggs ₹80, Orange Juice ₹120) with fake barcodes `890100000001`–`890100000005` and fields `id/barcode/name/brand/price/calories/protein/carbs/fat`
- The `barcode` field was never used anywhere

**Simulated behavior**

- `ScanProduct.jsx` was a FAKE scanner: a decorative CSS frame (corner brackets + animated scan line) and a `simulateScan()` that picked a random product with `Math.random()` and passed `product.id`
- `ProductInfo.jsx` looked products up by `id` synchronously; the shopping cart was a hardcoded emoji (no product images anywhere)
- `Checkout.jsx` showed a fake QR payment placeholder (a "▦" glyph in a white box, "Use any UPI app")
- `PaymentSuccess.jsx` generated a random transaction id (`"NB"` + `Math.random()*100000000`)
- `Welcome.jsx` showed a live clock and en-IN date, brand, and feature cards; `Home.jsx` showed a FreshMart Store session box, 6 stat cards (Products, Bill, Calories, Protein, Carbs, Fat), and Scan/Basket/Checkout buttons

**Known bugs and issues**

1. **Dead Home Checkout button** — `App.jsx` never passed `onCheckout` to `Home`, so the button did nothing
2. **Theme inconsistency** — `basket.css`, `checkout.css`, and `payment.css` used a blue scheme (linear-gradient `#0f172a`/`#1e293b`/`#2563eb`, `#2563eb` accents, `#22c55e` buttons) against the emerald "premium" theme in `global.css` (`--primary: #10B981`, `--background: #022C22`, `--accent: #34D399`, radial `#065F46` → `#022C22`)
3. **Dead template files** — `src/index.css`, `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png`, `public/icons.svg` (all unused leftovers from the Vite scaffold)
4. **README was Vite template text** plus a fork notice (no real documentation)
5. **No tests, no CI, no backend, no .env handling, no `vercel.json`**
6. **`.oxlintrc.json` `$schema` pointed at a local `./node_modules/...` path** (broken outside the repo)
7. **`ProductInfo` "Product Not Found" screen had no Back button** — a dead end with no way out
8. **No NaN guards on basket sums** — empty/missing values could render `NaN` in totals

---

## What Changed — Phase A (quick fixes)

The following quick fixes were applied:

1. **Fixed the dead Home Checkout button** — `App.jsx` now passes an `onCheckout` prop to `Home`
2. **Theme unification** — `basket.css`, `checkout.css`, and `payment.css` converted to the emerald CSS variables (`var(--primary)`, `var(--primary-dark)`, `var(--text-muted)`, radial emerald gradient); the whole app now uses one consistent emerald theme
3. **Deleted dead files** — `src/index.css`, `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png`, `public/icons.svg`; removed the unused `lucide-react` dependency
4. **README rewritten** (previous draft; this document is the comprehensive replacement)
5. **Hygiene** — `.env*` (keeping `!.env.example`) and `.vercel` added to `.gitignore`; `vercel.json` created (`{"framework":"vite"}`); `.oxlintrc.json` `$schema` switched to the remote oxc schema URL

---

## What Changed — Phase B (real scanning + backend)

### Backend (committed as `b209376`)

New `server/` — its own npm project (`"type": "module"`, `engines.node >= 18`):

- **`server/index.js`** — Express app with `helmet()` and `cors({ origin: CLIENT_ORIGIN || "*" })`, listening on `PORT || 3001`. Endpoints:
  - `GET /` → `{ service: "NutriBasket API", endpoints: [...] }`
  - `GET /health` → `{ status: "ok" }`
  - `GET /api/products/:barcode` → validates the barcode with `gtinCheckDigitValid` (regex `^\d{8,14}$`, allowed lengths 8/12/13/14, alternating 3/1 weights from the right) → `400 invalid_barcode` on failure; `404 product_not_found` when the lookup returns nothing; `502 upstream_error` when the Open Food Facts upstream fails
- **`server/lib/off.js`** — `fetchWithRetry` (10-second `AbortController` timeout, `User-Agent: NutriBasket/1.0 (contact@nutribasket.app)`, `Accept: application/json`, retry on 503 with 800 ms backoff, 2 attempts total); `normalizeProduct` maps the Open Food Facts v2 response (requested fields: `code, product_name, brands, image_front_url, image_url, quantity, nutriments`) into `{ id, barcode, name, brand, image_url, pack_quantity, price_inr: null, calories, protein, carbs, fat }` with `_100g` → `_serving` → plain fallbacks and zero defaults (NaN-proof). A "shell product" guard requires `product_name` (Open Food Facts returns `status: 1` for unknown codes), otherwise the lookup is treated as a 404
- **`server/lib/cache.js`** — in-memory `Map` with a 24-hour TTL
- **`server/.env.example`** — `PORT=3001`, `CLIENT_ORIGIN=https://nutri-basket-six.vercel.app`, `OFF_BASE_URL=https://world.openfoodfacts.org`
- **`render.yaml`** (Render Blueprint) — web service `nutribasket-api`, runtime node, `rootDir: server`, free plan, `npm install` build, `npm start` start command, `healthCheckPath: /health`, env `CLIENT_ORIGIN`

Verified live: Nutella (barcode `3017624010701`) returns normalized nutrition data; an unknown barcode (`8901234567890`) returns 404; an invalid barcode returns 400.

### Frontend

- **Dependency** — `@zxing/browser` ^0.2.1 added (bundles its own types; `@zxing/library` is a peer dependency)
- **`src/components/scanner/BarcodeScanner.jsx`** — real camera scanner using `BrowserMultiFormatReader.decodeFromVideoDevice` (auto rear camera). Design points:
  - Camera starts only on user tap ("Start Camera" button) to work around the iOS autoplay quirk
  - Status machine: `idle / starting / scanning / denied (NotAllowedError) / no-camera (NotFoundError) / busy (NotReadableError) / error`, each with its own message and a "Try Again" button
  - 1.5-second duplicate-scan dedupe via `lastScanRef`; stops scanning after a hit
  - StrictMode-safe cleanup: `mountedRef` + `controls.stop()` + `BrowserCodeReader.releaseAllStreams()` + `cleanVideoSource`
  - Scan result text passed up via `onDetected`
  - The video element drops into the existing `.scanner-frame` CSS (350x220); the corner brackets and animated scan line still overlay the live feed
- **`src/screens/ScanProduct.jsx`** — the fake `simulateScan()` is gone; now renders `BarcodeScanner` plus an always-available manual barcode entry form (`inputMode="numeric"`, `maxLength=14`, validated client-side by the GTIN check digit) that calls `onProduct(barcode)`
- **`src/lib/barcode.js`** — `gtinCheckDigitValid` (same algorithm as the server)
- **`src/lib/api.js`** — `fetchProductByBarcode(barcode)` → `GET {VITE_API_URL || ""}/api/products/:barcode`; 404 → `null`; any other non-ok → throws
- **`src/App.jsx`** — new async scan flow `handleScanned(barcode)`: loading → fetch → `selectedProduct` set to the full API object with lookup status "ready"; 404 → "not-found" screen (with "Try Another" back to scan); network error → "error" screen with Back + Retry. Session state `prices = { barcode: INR }` remembers user-entered prices (per session, not persisted); `addProduct` injects `prices[id] || 0` into basket items; Home's `onCheckout` is wired
- **`src/screens/ProductInfo.jsx`** — renders the API product object directly (no more `.find()`); shows the product photo `<img>` when `image_url` is present (shopping-cart emoji otherwise); nutrition grid (price/calories/protein/carbs/fat); when price is `null` an "Enter Price" numeric input is required before the item can be added (the Add to Basket button stays disabled until a price is entered); calls `onSetPrice` then `onAdd`
- **`vite.config.js`** — dev server proxy added: `/api` → `http://localhost:3001`
- **`.env.example`** (root) — documents `VITE_API_URL` (empty in dev → proxy; production → Render URL)
- **`src/styles/global.css`** — added `.scanner-video` (absolute cover), `.scanner-overlay`, `.manual-form` / `.manual-input` / `.manual-btn` / `.manual-error`, `.product-photo`, `.price-input`, `.start-btn:disabled`

**Files left untouched** — `Basket.jsx`, `Checkout.jsx`, `Home.jsx`, `PaymentSuccess.jsx`, `Welcome.jsx`, `AppLayout.jsx`, `main.jsx`, `src/data/products.js` (the demo products file is now unused by any screen but kept).

**Known remaining simulations** — the Checkout QR placeholder and the PaymentSuccess random transaction id remain simulated (out of scope for this phase).

---

## Current State of the Repo

### File tree

```
NutriBasket/
├── .env.example                    # VITE_API_URL documented (untracked)
├── .gitignore                      # node_modules, dist, .env*, .vercel, editors
├── .oxlintrc.json                  # remote $schema + react/oxc plugins
├── IMPROVEMENT.md                  # improvement plan (barcode & QR scanner integration)
├── README.md                       # this file
├── assets/
│   └── banner.svg                  # banner image
├── index.html
├── package.json                    # frontend project (root)
├── package-lock.json
├── public/
│   └── favicon.svg                 # (icons.svg was deleted in Phase A)
├── render.yaml                     # Render Blueprint (committed with b209376)
├── vercel.json                     # {"framework":"vite"}
├── vite.config.js                  # react plugin + /api proxy to :3001
├── src/
│   ├── main.jsx
│   ├── App.jsx                     # screen routing + scan flow + basket state
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppLayout.jsx
│   │   └── scanner/
│   │       └── BarcodeScanner.jsx  # ZXing camera scanner
│   ├── data/
│   │   └── products.js             # legacy demo products (now unused, kept)
│   ├── lib/
│   │   ├── api.js                  # fetchProductByBarcode
│   │   └── barcode.js              # gtinCheckDigitValid
│   ├── screens/
│   │   ├── Welcome.jsx
│   │   ├── Home.jsx
│   │   ├── ScanProduct.jsx         # real scanner + manual fallback
│   │   ├── ProductInfo.jsx         # API product + enter-price flow
│   │   ├── Basket.jsx
│   │   ├── Checkout.jsx
│   │   └── PaymentSuccess.jsx
│   └── styles/
│       ├── global.css              # emerald theme + scanner/price styles
│       ├── basket.css              # emerald-ized
│       ├── checkout.css            # emerald-ized
│       └── payment.css             # emerald-ized
└── server/                         # Express backend (committed with b209376)
    ├── .env.example
    ├── index.js                    # GET /, /health, /api/products/:barcode
    ├── lib/
    │   ├── cache.js                # in-memory Map, 24h TTL
    │   └── off.js                  # Open Food Facts client + normalization
    ├── package.json
    └── package-lock.json
```

### Dependencies

Root `package.json`:

| Type | Package | Version |
| --- | --- | --- |
| dependencies | `@zxing/browser` | ^0.2.1 |
| dependencies | `react` | ^19.2.7 |
| dependencies | `react-dom` | ^19.2.7 |
| devDependencies | `@types/react` | ^19.2.17 |
| devDependencies | `@types/react-dom` | ^19.2.3 |
| devDependencies | `@vitejs/plugin-react` | ^6.0.3 |
| devDependencies | `oxlint` | ^1.71.0 |
| devDependencies | `vite` | ^8.1.1 |

`server/package.json`:

| Type | Package | Version |
| --- | --- | --- |
| dependencies | `cors` | ^2.8.5 |
| dependencies | `dotenv` | ^16.4.5 |
| dependencies | `express` | ^4.21.2 |
| dependencies | `helmet` | ^8.0.0 |

### What is NOT yet done

- **No database** — prices and baskets are session-only; nothing is persisted
- **No automated tests** — there is no test script; verification has been manual (see IMPROVEMENT.md status below)
- **No Zustand** — basket state is plain `useState`/prop drilling
- **No Tailwind CSS** — plain CSS was used instead
- **Bundle weight** — the frontend bundle is ~687 KB (ZXing adds significant weight; code-splitting the scanner is a future option)

---

## IMPROVEMENT.md Implementation Status (branch `tweaks`)

[IMPROVEMENT.md](IMPROVEMENT.md) is the improvement plan "Improvement of NutriBasket: Barcode & QR Scanner Integration": current situation, phase goal (scan barcode/QR → auto-retrieve nutrition), planned tech stack, a 7-step user flow, next steps 1–6, and a future AI nutrition scoring phase.

| Item | Status | Where / Notes |
| --- | --- | --- |
| @zxing/browser | IMPLEMENTED | ^0.2.1, `src/components/scanner/BarcodeScanner.jsx` |
| Tailwind CSS | NOT IMPLEMENTED | Plain CSS used instead (`src/styles/*.css`) |
| Zustand | NOT IMPLEMENTED | Basket managed with `useState`/prop drilling in `src/App.jsx` |
| Node.js + Express backend | IMPLEMENTED | `server/`, committed in `b209376` |
| Open Food Facts API lookup | IMPLEMENTED | `server/lib/off.js`, normalized clean response |
| PostgreSQL via Supabase | NOT IMPLEMENTED | Optional per plan; everything is in-memory |
| Vercel hosting — frontend | IMPLEMENTED | `vercel.json`, live at nutri-basket-six.vercel.app |
| Vercel hosting — backend (serverless) | NOT IMPLEMENTED | Backend runs as a separate Express service on Render free tier instead |
| Scanner component (ZXing + camera) | IMPLEMENTED | `BarcodeScanner.jsx`, live camera feed |
| Camera permission / denial handling | IMPLEMENTED | denied / no-camera / busy / error states + "Try Again" |
| Manual barcode entry fallback | IMPLEMENTED | Form + GTIN validation; server re-validates |
| Backend endpoint + clean response | IMPLEMENTED | `GET /api/products/:barcode`, 400/404/502 semantics |
| Frontend wired to backend | IMPLEMENTED | `src/lib/api.js`, `src/App.jsx`, Vite proxy, `VITE_API_URL` |
| Nutrition data displayed (product + basket UI) | IMPLEMENTED | `ProductInfo.jsx` grid, `Basket.jsx` totals |
| Basket state management | PARTIAL | Functionality works via `useState`; Zustand store not implemented |
| Persistence (Supabase, baskets/scan history) | NOT IMPLEMENTED | Optional per plan |
| Testing (real barcodes, varied lighting, manual entry, e2e) | PARTIAL | Features built and live; manual testing performed; no automated suite |
| 7-step user flow | PARTIAL | Steps 1–5 and 7 implemented; step 6 partial (item added to basket via `useState`, no Zustand, no Supabase) |
| Future phase: AI nutrition scoring | NOT IMPLEMENTED | Explicitly future work |

**Tally: 11 implemented, 2 partial, 6 not implemented.** (Of the 6 not implemented, 3 — Supabase, persistence, and Vercel-serverless hosting — are optional/deliberate deviations; the plan's core scanning-plus-backend goal is fully achieved.)

### Bonus beyond the plan

- Server-side GTIN re-validation of entered barcodes
- Open Food Facts retry/backoff/timeout handling (`fetchWithRetry`)
- 24-hour in-memory response cache
- `/health` endpoint for Render health checks
- CORS restricted via `CLIENT_ORIGIN` env var
- Session-remembered user-entered prices (Open Food Facts has no price data)

---

## How to Run Locally

Prerequisites: **Node.js 18+** and npm.

### 1. Backend (port 3001)

```bash
cd server
npm install
cp .env.example .env   # adjust PORT / CLIENT_ORIGIN / OFF_BASE_URL as needed
npm run dev            # starts with node --watch
```

Verify: `curl http://localhost:3001/health` → `{"status":"ok"}`.

### 2. Frontend (port 5173)

```bash
# from the repo root
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` to `http://localhost:3001`, so no `.env` file is required in development (the root `.env.example` documents this).

### 3. Camera access note

The camera (getUserMedia) requires a **secure context**: use `https://` or `http://localhost`. Testing on a physical phone therefore requires either the deployed site or a tunnel (e.g. `ngrok`).

### 4. Lint and build

```bash
npm run lint    # oxlint (frontend)
npm run build   # production build to dist/
```

---

## Scripts

| Project | Script | Description |
| --- | --- | --- |
| root | `npm run dev` | Start the Vite dev server (port 5173, proxies /api to :3001) |
| root | `npm run build` | Production build to `dist/` |
| root | `npm run preview` | Preview the production build |
| root | `npm run lint` | Run Oxlint on the frontend |
| server | `npm run dev` | Start Express with `node --watch` (port 3001) |
| server | `npm start` | Start Express (`node index.js`) — used in production |

---

## Roadmap / Next Steps

1. **Automated tests** — introduce a test runner (e.g. Vitest) with unit tests for `gtinCheckDigitValid`, the API client, and backend endpoints; add an end-to-end scan → fetch → display → basket flow test
2. **Zustand migration** — replace `useState` basket/session state with a Zustand store (per IMPROVEMENT.md)
3. **Supabase persistence** — persist baskets and scan history per user/session (optional per the plan)
4. **Real UPI payment QR** — replace the Checkout QR placeholder and the random transaction id with a real payment flow
5. **Code-splitting the scanner bundle** — lazy-load `BarcodeScanner` to cut the ~687 KB initial bundle
6. **AI nutrition scoring** — the future phase described at the end of IMPROVEMENT.md
7. **Possibly Tailwind CSS** — the plan originally called for it; plain CSS was chosen instead

---

## License

No license file is present in the repository ("No license specified").
