import QRCode from "qrcode";

const text = process.argv[2];
const out = process.argv[3] || "qr.png";

if (!text) {
  console.error("Usage: node make-qr.js '<text>' [output.png]");
  process.exit(1);
}

QRCode.toFile(out, text, { width: 400, errorCorrectionLevel: "M" }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`QR saved to ${out}`);
  console.log(`Encoded text: ${text}`);
});