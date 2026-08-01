import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { getProductByBarcode, gtinCheckDigitValid } from "./lib/off.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));

app.get("/", (req, res) => {
  res.json({
    service: "NutriBasket API",
    endpoints: ["/health", "/api/products/:barcode"],
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products/:barcode", async (req, res) => {
  const { barcode } = req.params;

  if (!gtinCheckDigitValid(barcode)) {
    return res.status(400).json({
      error: "invalid_barcode",
      message: "Barcode must be a valid 8-14 digit product code",
    });
  }

  try {
    const product = await getProductByBarcode(barcode);
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

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`NutriBasket server listening on http://localhost:${port}`);
});
