import QRCode from "qrcode";
import * as XLSX from "xlsx";

const data = [
  ["Product", "Weight", "Energy(kcal)", "Protein(g)", "Carbohydrate(g)", "Total Sugars(g)", "Dietary Fibre(g)", "Total Fat(g)", "Saturated Fat(g)", "Cholesterol(mg)", "Sodium(mg)"],
  ["Amul Butter", "500g", 722, 0.9, 0.6, 0, 0, 81, 54, 220, 650],
  ["Whole Wheat Bread", "400g", 960, 32, 184, 12, 24, 12, 3, 0, 480],
  ["Banana", "1 piece", 105, 1.3, 27, 14, 3.1, 0.3, 0.1, 0, 1],
];

const csv = data.map((row) => row.join(",")).join("\n");

QRCode.toFile("qr code/demo_excel_csv.png", csv, {
  width: 400,
  errorCorrectionLevel: "M",
}).then(() => {
  console.log("CSV text inside the QR:");
  console.log(csv);
  console.log("\nSaved: qr code/demo_excel_csv.png");

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");
  XLSX.writeFile(wb, "qr code/demo_excel.xlsx");
  console.log("Saved: qr code/demo_excel.xlsx");
});