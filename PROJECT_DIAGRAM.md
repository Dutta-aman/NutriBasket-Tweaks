# NutriBasket — Project Diagram

NutriBasket is a smart-shopping assistant: a React 19 + Vite single-page app (deployed on Vercel) where shoppers scan or type a product barcode, fetch nutrition data from Open Food Facts through an Express API (deployed on Render), enter a price, build a basket with running nutrition totals, and complete a mock UPI checkout. This document maps the system at five levels — overall architecture, frontend components, user workflow, the backend API lifecycle, and deployment pipelines — followed by an endpoint reference table. Mermaid diagrams render natively on GitHub.

## 1. System Architecture (overview)

The browser app calls the Express backend over REST; the backend is the only component that talks to Open Food Facts (OFF). The backend keeps a 24-hour in-memory cache to absorb repeated lookups, and CORS is scoped to the frontend origin via the `CLIENT_ORIGIN` environment variable. Two independent deployment pipelines feed the frontend (Vercel) and backend (Render via GitHub Action).

```mermaid
graph TD
    subgraph FRONT["Frontend (Vercel)"]
        B["Browser / React 19 + Vite app<br/>src/App.jsx"]
        F["fetchProductByBarcode()<br/>base = VITE_API_URL or empty string"]
    end

    subgraph BACKEND["Backend (Render)"]
        API["Express server<br/>server/index.js"]
        CACHE["24h in-memory cache<br/>server/lib/cache.js"]
        CORS["CORS allowlist<br/>CLIENT_ORIGIN env"]
    end

    OFF["Open Food Facts API<br/>world.openfoodfacts.org<br/>api/v2/product"]

    subgraph DEPLOY["Deployment pipelines"]
        GH["GitHub push<br/>branches: main, tweaks"]
        ACT["GitHub Action<br/>render-deploy.yml"]
        RAPI["Render Deploy API<br/>api.render.com/v1/services"]
        VDEP["Vercel auto-deploy<br/>vercel.json (framework vite)"]
    end

    B --> F
    F -- "GET /api/products/:barcode" --> API
    API -- "cache lookup / store" --> CACHE
    API --> CORS
    API -- "v2 lookup, 10s timeout,<br/>503 retry + backoff" --> OFF

    GH --> ACT
    ACT -- "commitId + RENDER_API_KEY" --> RAPI
    RAPI --> API
    GH --> VDEP
    VDEP --> B
```

## 2. Frontend Component Architecture

`main.jsx` mounts `App` inside a top-level `ErrorBoundary` (a render-crash fallback with a restart button). `App` is a pure state machine over seven pages (`page`) with a `lookup` state (`loading / not-found / error / ready`) plus `basket`, `prices`, `selectedProduct`, and `lastBarcode`; `handleScanned(barcode)` drives the lookup and routes to the product page. Screens are thin presentational components; shared pieces are the ZXing `BarcodeScanner`, the `AppLayout` shell, and the `api.js` / `barcode.js` libs. `data/products.js` is legacy and unused.

```mermaid
graph TD
    MAIN["main.jsx<br/>ReactDOM.createRoot + StrictMode"] --> EB["ErrorBoundary<br/>render crash -> restart screen"]
    EB --> APP["App<br/>page: welcome / home / scan / product / basket / checkout / success<br/>lookup: loading / not-found / error / ready<br/>state: basket, prices, selectedProduct, lastBarcode"]

    APP --> W["Welcome"]
    APP --> H["Home"]
    APP --> S["ScanProduct"]
    APP --> P["ProductInfo"]
    APP --> B["Basket"]
    APP --> C["Checkout"]
    APP --> PS["PaymentSuccess"]

    W --> L["AppLayout<br/>shared card shell"]
    S --> SC["BarcodeScanner<br/>ZXing BrowserMultiFormatReader"]
    S --> BAR["lib/barcode.js<br/>gtinCheckDigitValid"]
    P --> API["lib/api.js<br/>fetchProductByBarcode"]
    API --> DATA["data/products.js<br/>legacy, unused"]
    W --> STY["styles/global.css, basket.css,<br/>checkout.css, payment.css"]
```

## 3. User Workflow (happy path + fallbacks)

The shopper lands on Welcome, moves through Home to the Scan screen, and either scans with the camera (ZXing) or types a barcode manually. Manual entry is GTIN-validated (8/12/13/14 digits with check digit). If the camera is denied, missing, busy, or fails, the UI falls back to manual entry. `App` then loads the product; after 5 seconds it shows a cold-start hint ("waking up the server"). Not-found and error states both route back to the scan screen (error offers Retry with the last barcode). The happy path continues: enter a price (regex `^\d+(\.\d{1,2})?$`), add to basket (deduped, quantity increments), review totals, checkout against a UPI QR placeholder, and confirm.

```mermaid
flowchart LR
    W["Welcome"] --> H["Home"]
    H --> SC["Scan screen"]
    SC --> CAM["Camera scan via ZXing"]
    SC --> MAN["Manual barcode entry<br/>GTIN check-digit validation"]
    CAM -- "denied / no-camera / busy / error" --> MAN

    CAM --> LK["App lookup: loading"]
    MAN --> LK
    LK -- "after 5s" --> HINT["Cold-start hint:<br/>server wake-up can take ~40s"]
    HINT --> LK

    LK -- "ready" --> RD["ProductInfo<br/>nutrition card + price entry"]
    LK -- "not-found" --> NF["Product Not Found"] --> SC
    LK -- "error" --> ER["Something Went Wrong"]
    ER -- "Retry (last barcode)" --> LK

    RD --> PR["Enter price<br/>regex validated: digits, up to 2 decimals"]
    PR --> AD["Add to Basket<br/>dedupe by id, quantity +1"]
    AD --> BK["Basket<br/>total amount + nutrition summary"]
    BK --> CO["Checkout<br/>UPI QR placeholder"]
    CO --> OK["Payment Success<br/>generated NB transaction id"]
    OK --> H
```

## 4. Backend API Lifecycle

`GET /api/products/:barcode` first validates the barcode check digit (400 `invalid_barcode` on failure). Otherwise `getProductByBarcode` checks the 24h in-memory cache first; on a miss it calls OFF via `fetchWithRetry` (10s timeout, one retry with 800ms backoff on 503). A successful response is normalized into the app's product shape and cached. A missing `product_name` maps to 404 `product_not_found`; an upstream failure after retries maps to 502 `upstream_error`.

```mermaid
sequenceDiagram
    participant C as Client (browser)
    participant E as Express route (index.js)
    participant O as off.js lookup
    participant F as Open Food Facts
    participant K as 24h cache

    C->>E: GET /api/products/:barcode
    alt Invalid check digit
        E-->>C: 400 error: invalid_barcode
    else Valid barcode
        E->>O: getProductByBarcode(barcode)
        O->>K: get(barcode)
        alt Cache hit (under 24h TTL)
            K-->>O: cached product
            O-->>E: product
            E-->>C: 200 product JSON
        else Cache miss
            O->>F: GET /api/v2/product/{code}.json (10s timeout)
            alt 503 from OFF
                F-->>O: 503 - retry with 800ms backoff
                O->>F: second attempt
            end
            alt Product found with product_name
                F-->>O: OFF JSON
                O->>O: normalizeProduct()
                O->>K: set(barcode, product, 24h TTL)
                O-->>E: product
                E-->>C: 200 normalized product
            else Missing product_name
                F-->>O: 404 / empty payload
                O-->>E: null
                E-->>C: 404 error: product_not_found
            end
        end
        alt Upstream failure after retries
            O-->>E: throw (timeout / non-2xx)
            E-->>C: 502 error: upstream_error
        end
    end
```

## 5. Deployment Lifecycle

The backend is deployed two ways. The canonical path: pushing to `main` in the upstream repo triggers the Render dashboard webhook (or the GitHub Action below in the fork). The repository in this workspace uses the GitHub Action path: a push to `main` or `tweaks` runs `render-deploy.yml`, which guards on the `RENDER_SERVICE_ID` repo variable, then POSTs to the Render Deploy API with the `RENDER_API_KEY` secret and the commit SHA, causing Render to build and start the service (`/health` is the health check). The frontend is independently auto-deployed by Vercel with `VITE_API_URL` baked in at build time. Self-hosters can instead use the Render dashboard / `render.yaml` blueprint with `CLIENT_ORIGIN` and an `OFF_BASE_URL` override.

```mermaid
flowchart TD
    subgraph CANON["Canonical path (upstream repo)"]
        P1["Push to main"] --> WH["Render dashboard webhook"] --> R1["Render deploy"] --> LIVE
    end

    subgraph ACTPATH["Action path (this repo)"]
        P2["Push to main / tweaks"] --> GA["GitHub Action<br/>render-deploy.yml"]
        GA --> G{"RENDER_SERVICE_ID<br/>repo variable set?"}
        G -- "no" --> FAIL["Exit 1 with setup error message"]
        G -- "yes" --> CURL["curl -X POST Render Deploy API<br/>Authorization: Bearer RENDER_API_KEY<br/>body: commitId = github.sha, clearCache"]
        CURL --> R2["Render deploy at commitId<br/>rootDir: server, plan: free"]
        R2 --> LIVE["Live API service<br/>GET /health -> status ok"]
    end

    subgraph VDP["Frontend path (Vercel)"]
        P3["Push to GitHub"] --> V["Vercel build<br/>VITE_API_URL baked in"]
        V --> VURL["Frontend URL<br/>https://nutri-basket-six.vercel.app"]
    end

    subgraph SELF["Manual / self-hosting"]
        B1["Render dashboard + render.yaml blueprint"] --> B2["Manual deploy<br/>set CLIENT_ORIGIN, OFF_BASE_URL"]
    end
```

## 6. API Endpoints Reference

| Method | Path | Purpose | Success response | Error responses |
| --- | --- | --- | --- | --- |
| GET | `/` | Service index listing available endpoints | `200` `{ "service": "NutriBasket API", "endpoints": ["/health", "/api/products/:barcode"] }` | - |
| GET | `/health` | Liveness probe used by Render's health check | `200` `{ "status": "ok" }` | - |
| GET | `/api/products/:barcode` | Look up a product by GTIN barcode (8-14 digits, valid check digit); cached for 24h | `200` product JSON: `{ id, barcode, name, brand, image_url, pack_quantity, price_inr, calories, protein, carbs, fat }` | `400` `{ "error": "invalid_barcode" }` — malformed barcode / bad check digit; `404` `{ "error": "product_not_found" }` — not in Open Food Facts; `502` `{ "error": "upstream_error" }` — OFF unreachable after retries |
