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
