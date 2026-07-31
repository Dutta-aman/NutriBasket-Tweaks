# Improvement of NutriBasket: Barcode & QR Scanner Integration

## Current Situation

NutriBasket is currently a React + Vite prototype, deployed on Vercel. The project started from a standard React/Vite template and has not yet implemented any scanning, backend, or nutrition-data functionality — it is at the foundational UI/setup stage.

**What exists today:**
- React + Vite frontend scaffold
- Deployed and accessible at `nutri-basket.vercel.app`
- No backend service yet
- No database yet
- No scanning capability yet
- No nutrition data integration yet

This document covers only the barcode/QR scanning phase of the project. AI-based food recognition will be planned and documented separately once the scanner and backend foundation are complete.

---

## Goal of This Phase

Enable users to scan a barcode or QR code on a packaged food product using their phone camera, and have the app automatically retrieve and display that product's nutrition information.

---

## Planned Tech Stack (This Phase Only)

### Frontend
- **React + Vite** — existing framework, no changes required
- **@zxing/browser** — library to decode barcodes and QR codes from a live camera feed in the browser
- **Tailwind CSS** — styling for the scanner UI (camera view, scan button, results card)
- **Zustand** — lightweight state management for holding scanned items and the current basket

### Backend
- **Node.js + Express** — handles requests from the frontend
- Responsibilities at this stage:
  - Receive a scanned barcode number from the frontend
  - Call the Open Food Facts API to retrieve product data
  - Return product name and nutrition information to the frontend

### External Data Source
- **Open Food Facts API** — free, public, no API key required; returns product details (name, ingredients, nutrition facts) for a given barcode

### Database
- **PostgreSQL via Supabase** — used to persist scanned items and baskets if/when persistence is needed
- Optional at this stage; the prototype can function with in-memory frontend state before this is added

### Hosting
- **Vercel** — hosts both the frontend and backend (as serverless functions), continuing from the existing deployment

---

## Planned User Flow

1. User opens the app and taps a "Scan" button
2. Camera activates and the ZXing library scans for a barcode or QR code in real time
3. Once a code is detected, the barcode number is sent from the frontend to the Express backend
4. The backend calls the Open Food Facts API using that barcode number
5. The backend returns the product's name and nutrition information to the frontend
6. The scanned item is added to the basket (held in Zustand state, and optionally saved to the Supabase database)
7. The user sees the product's nutrition information displayed in the app

---

## Next Steps

1. **Build the scanner component**
   - Create a `BarcodeScanner` component in the frontend that opens the camera and uses ZXing to detect codes
   - Handle camera permission requests and denial gracefully
   - Add a manual barcode entry fallback for cases where scanning fails (poor lighting, damaged barcode, etc.)

2. **Set up the backend service**
   - Initialize a Node.js + Express project
   - Create an endpoint that accepts a barcode number and queries the Open Food Facts API
   - Return a clean, simplified response to the frontend (product name, key nutrition facts)

3. **Connect frontend to backend**
   - Wire the scanner component to call the backend endpoint once a barcode is detected
   - Display the returned nutrition data in the basket UI

4. **Add basket state management**
   - Implement Zustand store to hold currently scanned items
   - Support adding, removing, and viewing items in the basket

5. **(Optional, once core flow works) Add persistence**
   - Set up Supabase with PostgreSQL
   - Store baskets and scanned item history per user/session

6. **Testing**
   - Test scanning with real product barcodes in varied lighting conditions
   - Test the manual entry fallback
   - Test the full flow end-to-end: scan → fetch → display → add to basket

---

- Nutrition scoring or recommendations generated via AI

These will be addressed in a future phase, after the scanner and backend foundation described above are complete and stable.
