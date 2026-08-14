import QRCode from "qrcode";

const products = [
  {
    file: "qr code/table_amul_butter.png",
    name: "Amul Butter",
    brand: "Amul",
    price: "Rs.56",
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
    file: "qr code/table_whole_wheat_bread.png",
    name: "Whole Wheat Bread",
    brand: "HealthyBake",
    price: "Rs.45",
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
    file: "qr code/table_banana.png",
    name: "Banana",
    brand: "Local Farm",
    price: "Rs.8",
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

function makeTable(p) {
  const rows = [
    [p.name, p.weight],
    ["Price", p.price],
    ...p.nutrition,
  ];
  const w1 = Math.max(...rows.map(([a]) => a.length));
  const w2 = Math.max(...rows.map(([, b]) => b.length));
  const H = "─", T = "┬", B = "┴", C = "┼", L = "├", R = "┤";
  const top = "┌" + H.repeat(w1 + 2) + T + H.repeat(w2 + 2) + "┐";
  const mid = L + H.repeat(w1 + 2) + C + H.repeat(w2 + 2) + R;
  const bot = "└" + H.repeat(w1 + 2) + B + H.repeat(w2 + 2) + "┘";
  const line = (a, b) => "│ " + a.padEnd(w1) + " │ " + b.padEnd(w2) + " │";
  const out = [top];
  rows.forEach(([a, b], i) => {
    if (i > 0) out.push(mid);
    out.push(line(a, b));
  });
  out.push(bot);
  return out.join("\n");
}

for (const p of products) {
  const text = makeTable(p);
  await QRCode.toFile(p.file, text, { width: 400, errorCorrectionLevel: "M" });
  console.log("Saved:", p.file);
  console.log(text);
  console.log();
}