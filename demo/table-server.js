import http from "node:http";
import os from "node:os";
import QRCode from "qrcode";

const PORT = 8001;

const products = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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

function lanIP() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return "127.0.0.1";
}

const BASE = `http://${lanIP()}:${PORT}`;

const css = `
  * { box-sizing: border-box; margin: 0; }
  body {
    font-family: system-ui, sans-serif;
    background: radial-gradient(circle at top, #065f46, #022c22);
    color: #fff; min-height: 100vh; padding: 16px;
    display: flex; flex-direction: column; align-items: center;
  }
  .card {
    background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
    border-radius: 20px; padding: 18px; width: 100%; max-width: 420px;
    backdrop-filter: blur(18px);
  }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .brand { color: #a7f3d0; font-size: 14px; }
  .badges { display: flex; gap: 6px; margin: 10px 0; flex-wrap: wrap; }
  .badge {
    background: rgba(16,185,129,.25); border: 1px solid #10b981; color: #a7f3d0;
    border-radius: 999px; padding: 4px 12px; font-size: 13px; font-weight: 700;
  }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; background: rgba(0,0,0,.3); border-radius: 12px; overflow: hidden; }
  th, td { border: 1px solid rgba(255,255,255,.25); padding: 9px 12px; text-align: left; font-size: 14px; }
  th { background: #059669; }
  td.v { font-weight: 700; text-align: right; }
  .qr-grid { display: flex; flex-direction: column; gap: 24px; margin-top: 16px; width: 100%; max-width: 420px; }
  .qr-item { text-align: center; }
  .qr-item img { width: 240px; height: 240px; border-radius: 12px; background: #fff; padding: 8px; }
  .qr-item .label { margin-top: 8px; font-weight: 700; }
  .qr-item .url { color: #a7f3d0; font-size: 12px; word-break: break-all; }
  .back { color: #a7f3d0; font-size: 13px; margin-top: 14px; display: block; text-decoration: none; }
  .note { color: #a7f3d0; font-size: 13px; margin: 6px 0; }
`;

function productPage(p) {
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${p.name} — NutriBasket</title><style>${css}</style></head>
<body>
  <div class="card">
    <h1>${p.name}</h1>
    <div class="brand">${p.brand}</div>
    <div class="badges">
      <span class="badge">₹${p.price}</span>
      <span class="badge">${p.weight}</span>
    </div>
    <table>
      <thead><tr><th>Nutrient</th><th>Value</th></tr></thead>
      <tbody>
        ${p.nutrition.map(([k, v]) => `<tr><td>${k}</td><td class="v">${v}</td></tr>`).join("")}
      </tbody>
    </table>
  </div>
  <a class="back" href="/">← All products</a>
</body></html>`;
}

function qrPage() {
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Scan a QR — NutriBasket</title><style>${css}</style></head>
<body>
  <h1>Scan with your phone</h1>
  <p class="note">Point your phone camera at a QR — the browser will open the product table.</p>
  <div class="qr-grid">
    ${products
      .map(
        (p) => `<div class="qr-item">
          <img src="/qr/${p.id}" alt="QR for ${p.name}"/>
          <div class="label">${p.name}</div>
          <div class="url">${BASE}/p/${p.id}</div>
        </div>`
      )
      .join("")}
  </div>
</body></html>`;
}

const server = http.createServer(async (req, res) => {
  const url = req.url || "/";

  if (url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      `<h1 style="color:#fff;font-family:system-ui">NutriBasket QR demo</h1>
       <a style="color:#a7f3d0" href="/qr">→ Show QRs to scan</a>`
    );
    return;
  }

  if (url === "/qr") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(qrPage());
    return;
  }

  const qrMatch = url.match(/^\/qr\/(\d+)$/);
  if (qrMatch) {
    const p = products.find((x) => x.id === +qrMatch[1]);
    if (!p) { res.writeHead(404); res.end("not found"); return; }
    const png = await QRCode.toBuffer(`${BASE}/p/${p.id}`, { width: 480, errorCorrectionLevel: "M" });
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(png);
    return;
  }

  const pMatch = url.match(/^\/p\/(\d+)$/);
  if (pMatch) {
    const p = products.find((x) => x.id === +pMatch[1]);
    if (!p) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(productPage(p));
    return;
  }

  res.writeHead(404); res.end("not found");
});

server.listen(PORT, () => {
  console.log(`Server: ${BASE}`);
  console.log(`Open on PC:  ${BASE}/qr   (shows the QRs to scan)`);
});