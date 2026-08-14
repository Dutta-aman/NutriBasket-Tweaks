import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { getProductByBarcode, gtinCheckDigitValid } from "./lib/off.js";
import { findInSeed } from "./lib/seed.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!allowedOrigins.length) {
  console.warn(
    "CLIENT_ORIGIN is not set — CORS is disabled, cross-origin requests will be blocked. Set CLIENT_ORIGIN on Render."
  );
}

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : false,
  })
);

function rateLimit(limitPerMinute) {
  const hits = new Map();
  const WINDOW_MS = 60 * 1000;
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = hits.get(ip);
    if (!entry || now - entry.windowStart >= WINDOW_MS) {
      hits.set(ip, { windowStart: now, count: 1 });
    } else {
      entry.count += 1;
      if (entry.count > limitPerMinute) {
        return res.status(429).json({
          error: "rate_limited",
          message: `Too many requests — limit is ${limitPerMinute} per minute`,
        });
      }
    }
    next();
  };
}
app.get("/", (req, res) => {
  res.json({
    service: "NutriBasket API",
    endpoints: ["/health", "/api/products/:barcode"],
    data_license: "Open Database License 1.0 (ODbL) — © Open Food Facts contributors",
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", rateLimit(60));

app.get("/api/products/:barcode", async (req, res) => {
  const { barcode } = req.params;

  if (!gtinCheckDigitValid(barcode)) {
    return res.status(400).json({
      error: "invalid_barcode",
      message: "Barcode must be a valid 8-14 digit product code",
    });
  }

  try {
    const product = findInSeed(barcode) || (await getProductByBarcode(barcode));
    if (!product) {
      return res.status(404).json({
        error: "product_not_found",
        message: "Product not found in the nutrition database",
      });
    }
    res.json(product);
  } catch (err) {
    console.error(`Lookup failed for ${barcode}:`, err.message);
    res.status(502).json({
      error: "upstream_error",
      message: "Could not reach the nutrition database",
    });
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({ error: "not_found", message: "API route not found" });
});

app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({
    error: err.status === 400 ? "bad_request" : "internal_error",
    message: err.status === 400 ? err.message : "Internal server error",
  });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`NutriBasket server listening on http://localhost:${port}`);
});
