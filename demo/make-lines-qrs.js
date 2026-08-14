import QRCode from "qrcode";

const products = [
  {
    file: "qr code/lines_amul_butter.png",
    lines: [
      "Product Name: Amul Butter",
      "Brand: Amul",
      "Weight: 500g",
      "Price: Rs.56",
      "Energy: 722 kcal",
      "Protein: 0.9 g",
      "Carbohydrate: 0.6 g",
      "Total Sugars: 0 g",
      "Dietary Fibre: 0 g",
      "Total Fat: 81 g",
      "Saturated Fat: 54 g",
      "Cholesterol: 220 mg",
      "Sodium: 650 mg",
    ],
  },
  {
    file: "qr code/lines_whole_wheat_bread.png",
    lines: [
      "Product Name: Whole Wheat Bread",
      "Brand: HealthyBake",
      "Weight: 400g",
      "Price: Rs.45",
      "Energy: 960 kcal",
      "Protein: 32 g",
      "Carbohydrate: 184 g",
      "Total Sugars: 12 g",
      "Dietary Fibre: 24 g",
      "Total Fat: 12 g",
      "Saturated Fat: 3 g",
      "Cholesterol: 0 mg",
      "Sodium: 480 mg",
    ],
  },
  {
    file: "qr code/lines_banana.png",
    lines: [
      "Product Name: Banana",
      "Brand: Local Farm",
      "Weight: 1 piece",
      "Price: Rs.8",
      "Energy: 105 kcal",
      "Protein: 1.3 g",
      "Carbohydrate: 27 g",
      "Total Sugars: 14 g",
      "Dietary Fibre: 3.1 g",
      "Total Fat: 0.3 g",
      "Saturated Fat: 0.1 g",
      "Cholesterol: 0 mg",
      "Sodium: 1 mg",
    ],
  },
];

for (const p of products) {
  const text = p.lines.join("\n");
  await QRCode.toFile(p.file, text, { width: 400, errorCorrectionLevel: "M" });
  console.log("Saved:", p.file);
}