const API_BASE = import.meta.env.VITE_API_URL || "";

export async function fetchProductByBarcode(barcode) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/products/${barcode}`, {
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    if (err instanceof TypeError) {
      console.warn(
        "Lookup failed — likely CORS: check CLIENT_ORIGIN on the Render service / VITE_API_URL",
        err
      );
    }
    throw err;
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
  return res.json();
}
