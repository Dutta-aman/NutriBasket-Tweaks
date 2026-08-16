const VALID_LENGTHS = [8, 12, 13, 14];

export function gtinCheckDigitValid(barcode) {
  if (!/^\d{8,14}$/.test(barcode)) return false;
  if (!VALID_LENGTHS.includes(barcode.length)) return false;
  let sum = 0;
  let weight = 3;
  for (let i = barcode.length - 2; i >= 0; i--) {
    sum += Number(barcode[i]) * weight;
    weight = weight === 3 ? 1 : 3;
  }
  return (10 - (sum % 10)) % 10 === Number(barcode[barcode.length - 1]);
}

export function isPaymentQR(text) {
  if (typeof text !== "string") return false;
  return /^upi:\/\//i.test(text) ||
    /^paytm:\/\//i.test(text) ||
    /^tez:\/\//i.test(text) ||
    /^phonepe:\/\//i.test(text) ||
    /^gpay:\/\//i.test(text) ||
    /upi\/(pay|collect)/i.test(text) ||
    /@(paytm|okaxis|okicici|ybl|ibl|googlepay|axl|upi)/i.test(text) ||
    /paytm|phonepe|gpay|bhim/i.test(text);
}

export function extractBarcodeFromQr(text) {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  if (gtinCheckDigitValid(trimmed)) return trimmed;

  try {
    const data = JSON.parse(trimmed);
    const candidate =
      data && typeof data === "object"
        ? (data.barcode ?? data.code ?? data.gtin ?? data.ean)
        : null;
    if (typeof candidate === "string" && gtinCheckDigitValid(candidate.trim())) {
      return candidate.trim();
    }
  } catch {
    // not JSON — fall through
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      for (const key of ["product", "barcode", "code", "gtin", "ean", "id", "p"]) {
        const value = url.searchParams.get(key);
        if (typeof value === "string" && gtinCheckDigitValid(value.trim())) {
          return value.trim();
        }
      }
      const pathMatch = url.pathname.match(/\/product\/([^/]+)/i);
      if (pathMatch && gtinCheckDigitValid(pathMatch[1].trim())) {
        return pathMatch[1].trim();
      }
    } catch {
      // malformed URL — fall through to digit-run scan
    }
  }

  const stripped = trimmed.replace(/^\[?01\]?/, "");
  const runs = stripped.match(/\d{8,14}/g) ?? [];
  for (const run of runs) {
    if (gtinCheckDigitValid(run)) return run;
  }
  return null;
}
