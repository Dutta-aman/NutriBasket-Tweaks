const API_BASE = import.meta.env.VITE_API_URL || "";

export async function fetchProductByBarcode(barcode) {
  const res = await fetch(`${API_BASE}/api/products/${barcode}`, {
    headers: { Accept: "application/json" },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
  return res.json();
}
