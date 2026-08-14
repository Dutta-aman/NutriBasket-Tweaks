// DEPRECATED: dead code — this module is not imported anywhere.
// Kept for reference only. Sample barcodes here have invalid GTIN check digits;
// do not reuse them. Live data comes from the server (server/lib/off.js) and
// the seed database (seed/demo.db). See issue #23.
const products = [
  {
    id: 1,
    barcode: "890100000001",
    name: "Amul Milk",
    brand: "Amul",
    price: 35,
    calories: 150,
    protein: 8,
    carbs: 12,
    fat: 6,
  },

  {
    id: 2,
    barcode: "890100000002",
    name: "Brown Bread",
    brand: "Britannia",
    price: 45,
    calories: 220,
    protein: 7,
    carbs: 40,
    fat: 2,
  },

  {
    id: 3,
    barcode: "890100000003",
    name: "Apple",
    brand: "Fresh Farm",
    price: 30,
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
  },

  {
    id: 4,
    barcode: "890100000004",
    name: "Eggs",
    brand: "Farm Fresh",
    price: 80,
    calories: 155,
    protein: 13,
    carbs: 1,
    fat: 11,
  },

  {
    id: 5,
    barcode: "890100000005",
    name: "Orange Juice",
    brand: "Real",
    price: 120,
    calories: 110,
    protein: 2,
    carbs: 25,
    fat: 0,
  },
];

export default products;