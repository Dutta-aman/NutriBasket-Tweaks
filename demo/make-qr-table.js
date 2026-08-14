import QRCode from "qrcode";

const rows = [
  ["Amul Butter", "500g"],
  ["Energy", "722 kcal"],
  ["Protein", "0.9 g"],
  ["Carbohydrate", "0.6 g"],
  ["Total Sugars", "0 g"],
  ["Dietary Fibre", "0 g"],
  ["Total Fat", "81 g"],
  ["Saturated Fat", "54 g"],
  ["Cholesterol", "220 mg"],
  ["Sodium", "650 mg"],
];

const w1 = Math.max(...rows.map(([a]) => a.length));
const w2 = Math.max(...rows.map(([, b]) => b.length));

const H = "─";
const T = "┬";
const B = "┴";
const C = "┼";
const L = "├";
const R = "┤";
const TOP = "┌" + H.repeat(w1 + 2) + T + H.repeat(w2 + 2) + "┐";
const MID = L + H.repeat(w1 + 2) + C + H.repeat(w2 + 2) + R;
const BOT = "└" + H.repeat(w1 + 2) + B + H.repeat(w2 + 2) + "┘";

const line = (a, b) => "│ " + a.padEnd(w1) + " │ " + b.padEnd(w2) + " │";

const out = [TOP];
rows.forEach(([a, b], i) => {
  if (i > 0) out.push(MID);
  out.push(line(a, b));
});
out.push(BOT);

const text = out.join("\n");
QRCode.toFile("qr code/demo_table_ascii.png", text, {
  width: 400,
  errorCorrectionLevel: "M",
}).then(() => {
  console.log(text);
  console.log("\nSaved: qr code/demo_table_ascii.png");
});