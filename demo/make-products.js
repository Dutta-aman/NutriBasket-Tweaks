import QRCode from "qrcode";

const products = [
  {
    name: "Amul Butter",
    brand: "Amul",
    price: 56,
    weight: "500g",
    nutrition: [
      ["Energy", "722 kcal"],
      ["Protein", "0.9 g"],
      ["Carbohydrate", "0.6 g"],
      ["Total Sugars", "0 g"],
      ["Dietary Fibre", "0 g"],
      ["Total Fat", "81 g"],
      ["Saturated Fat", "54 g"],
      ["Cholesterol", "220 mg"],
      ["Sodium", "650 mg"],
    ],
  },
  {
    name: "Whole Wheat Bread",
    brand: "HealthyBake",
    price: 45,
    weight: "400g",
    nutrition: [
      ["Energy", "960 kcal"],
      ["Protein", "32 g"],
      ["Carbohydrate", "184 g"],
      ["Total Sugars", "12 g"],
      ["Dietary Fibre", "24 g"],
      ["Total Fat", "12 g"],
      ["Saturated Fat", "3 g"],
      ["Cholesterol", "0 mg"],
      ["Sodium", "480 mg"],
    ],
  },
  {
    name: "Banana",
    brand: "Local Farm",
    price: 8,
    weight: "1 piece",
    nutrition: [
      ["Energy", "105 kcal"],
      ["Protein", "1.3 g"],
      ["Carbohydrate", "27 g"],
      ["Total Sugars", "14 g"],
      ["Dietary Fibre", "3.1 g"],
      ["Total Fat", "0.3 g"],
      ["Saturated Fat", "0.1 g"],
      ["Cholesterol", "0 mg"],
      ["Sodium", "1 mg"],
    ],
  },
];

for (const [i, p] of products.entries()) {
  const json = JSON.stringify(p);
  const file = i === 0 ? "qr code/demo_product1.png" : `qr code/demo_product${i + 1}.png`;
  QRCode.toFile(file, json, { width: 400, errorCorrectionLevel: "M" }).then(() => {
    console.log(`Saved: ${file}`);
    console.log(json);
    console.log();
  });
}