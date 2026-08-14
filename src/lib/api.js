const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const TIMEOUT_MS = 60000;

export async function fetchProductByBarcode(barcode) {
  let res;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(barcode)}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`Lookup timed out after ${TIMEOUT_MS / 1000}s`);
    }
    if (err instanceof TypeError) {
      console.warn(
        "Lookup failed — likely CORS: check CLIENT_ORIGIN on the Render service / VITE_API_URL",
        err
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
  return res.json();
}
