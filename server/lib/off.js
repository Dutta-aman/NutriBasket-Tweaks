import { get, set } from "./cache.js";

const BASE_URL = process.env.OFF_BASE_URL || "https://in.openfoodfacts.org";
const USER_AGENT = "NutriBasket/1.0 (contact@nutribasket.app)";
const TIMEOUT_MS = 10000;
const VALID_LENGTHS = [8, 12, 13, 14];
const NOT_FOUND = Symbol("not_found");

export function gtinCheckDigitValid(barcode) {
  if (!/^\d{8,14}$/.test(barcode)) return false;
  if (!VALID_LENGTHS.includes(barcode.length)) return false;
  let sum = 0;
  let weight = 3;
  for (let i = barcode.length - 2; i >= 0; i--) {
    sum += Number(barcode[i]) * weight;
    weight = weight === 3 ? 1 : 3;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(barcode[barcode.length - 1]);
}

async function fetchWithRetry(url, attempts = 2) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        signal: controller.signal,
      });
      if (res.status === 404) return null;
      if (res.status === 503 && i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 800 * (i + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`Open Food Facts responded ${res.status}`);
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          `Open Food Facts returned non-JSON (${contentType || "no content-type"})`
        );
      }
      return await res.json();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 500));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

function numberOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function pickFirst(...values) {
  for (const value of values) {
    const n = numberOrNull(value);
    if (n !== null) return n;
  }
  return null;
}

function normalizeProduct(code, data) {
  const p = data && data.product;
  if (!p || !p.product_name) return null;
  const n = p.nutriments || {};
  return {
    id: code,
    barcode: code,
    name: p.product_name,
    brand: p.brands || "",
    image_url: p.image_front_url || p.image_url || null,
    pack_quantity: p.quantity || null,
    price_inr: null,
    source: "off",
    calories: pickFirst(n["energy-kcal_100g"], n["energy-kcal_serving"], n["energy-kcal"]),
    protein: pickFirst(n.proteins_100g, n.proteins_serving, n.proteins),
    carbs: pickFirst(n.carbohydrates_100g, n.carbohydrates_serving, n.carbohydrates),
    fat: pickFirst(n.fat_100g, n.fat_serving, n.fat),
  };
}

export async function getProductByBarcode(barcode) {
  const cached = get(barcode);
  if (cached === NOT_FOUND) return null;
  if (cached) return cached;
  const url = `${BASE_URL}/api/v2/product/${barcode}.json?fields=code,product_name,brands,image_front_url,image_url,quantity,nutriments`;
  const data = await fetchWithRetry(url);
  const product = normalizeProduct(barcode, data);
  if (product) set(barcode, product);
  else set(barcode, NOT_FOUND);
  return product;
}
