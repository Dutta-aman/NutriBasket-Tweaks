import { useEffect, useRef, useState } from "react";

import Welcome from "./screens/Welcome";
import Home from "./screens/Home";
import ScanProduct from "./screens/ScanProduct";
import ProductInfo from "./screens/ProductInfo";
import Basket from "./screens/Basket";
import { fetchProductByBarcode } from "./lib/api";
import { extractBarcodeFromQr } from "./lib/barcode";
import ProfileBoundary from "./components/ProfileBoundary";
import { loadProfile, storageSet, storageRemove, PROFILE_KEY } from "./lib/storage";

function App() {

  const [page, setPage] = useState("welcome");

  const [basket, setBasket] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [lastBarcode, setLastBarcode] = useState(null);

  const [lookup, setLookup] = useState("idle");

  const [prices] = useState({});

  const [slowLookup, setSlowLookup] = useState(false);

  const [profile, setProfile] = useState(() => loadProfile());

  const lookupSeqRef = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("product") ?? params.get("barcode") ?? params.get("code") ?? params.get("gtin") ?? params.get("ean") ?? params.get("id");
    const pathMatch = window.location.pathname.match(/^\/(\d{8,14})$/);
    const barcode = (raw ? extractBarcodeFromQr(raw) : null) ?? (pathMatch ? extractBarcodeFromQr(pathMatch[1]) : null);
    if (barcode) {
      handleScanned(barcode);
      const url = new URL(window.location.href);
      for (const key of ["product", "barcode", "code", "gtin", "ean", "id"]) {
        url.searchParams.delete(key);
      }
      window.history.replaceState({}, "", pathMatch ? "/" : url.pathname + url.search + url.hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

    if (lookup !== "loading") {
      setSlowLookup(false);
      return;
    }

    const timer = setTimeout(() => setSlowLookup(true), 5000);

    return () => clearTimeout(timer);

  }, [lookup]);

  function handleScanned(barcode) {

    setLastBarcode(barcode);

    setSelectedProduct(null);

    setLookup("loading");

    setPage("product");

    const seq = ++lookupSeqRef.current;

    fetchProductByBarcode(barcode)

      .then((product) => {

        if (seq !== lookupSeqRef.current) return;

        if (!product) {

          setLookup("not-found");

          return;

        }

        setSelectedProduct(product);

        setLookup("ready");

      })

      .catch(() => {

        if (seq !== lookupSeqRef.current) return;

        setLookup("error");

      });

  }

  function addProduct(product, priceOverride) {

    const price = priceOverride ?? prices[product.id] ?? 0;

    const priced = { ...product, price };

    const existing = basket.find(
      item => item.id === priced.id
    );

    if (existing) {

      const updated = basket.map(item =>

        item.id === priced.id
          ? {
              ...item,
              quantity: (item.quantity || 1) + 1
            }
          : item

      );

      setBasket(updated);

    } else {

      setBasket([
        ...basket,
        {
          ...priced,
          quantity: 1
        }
      ]);

    }

    setPage("basket");

  }

  function updateQuantity(index, change) {

    const updated = [...basket];

    const currentQty = updated[index].quantity || 1;

    const newQty = currentQty + change;

    if (newQty <= 0) {

      updated.splice(index, 1);

    } else {

      updated[index].quantity = newQty;

    }

    setBasket(updated);

  }

  function handleProfileComplete(p) {

    setProfile(p);

    storageSet(PROFILE_KEY, p);

    setPage("home");

  }

  function handleProfileReset() {

    storageRemove(PROFILE_KEY);

    setProfile(null);

    setPage("welcome");

  }

  if (page === "welcome") {

    return (
      <Welcome
        profile={profile}
        onStart={() => setPage(profile ? "home" : "profile")}
      />
    );

  }

  if (page === "profile") {

    return (
      <ProfileBoundary
        onReset={handleProfileReset}
        onComplete={handleProfileComplete}
      />
    );

  }

  if (page === "home") {

    return (
      <Home
        onScan={() => setPage("scan")}
        onBasket={() => setPage("basket")}
      />
    );

  }

  if (page === "scan") {

    return (
      <ScanProduct
        onProduct={handleScanned}
        onBack={() => setPage("welcome")}
      />
    );

  }

  if (page === "product") {

    if (lookup === "loading") {

      return (
        <div className="product-container">
          <div className="product-card">
            <div className="dither-anim" aria-hidden="true" />
            <h1>Searching…</h1>
            <p>Fetching nutrition information.</p>
            {slowLookup && (
              <p className="lookup-hint">
                Waking up the server — this is normal for the free-tier
                backend and can take up to ~40s on the first request.
                Please wait…
              </p>
            )}
          </div>
        </div>
      );

    }

    if (lookup === "not-found") {

      return (
        <div className="product-container">
          <div className="product-card">
            <h1>Product Not Found</h1>
            <p>This barcode is not in the nutrition database.</p>
            {lastBarcode && (
              <div className="notfound-links">
                <a
                  href={`https://in.openfoodfacts.org/search?q=${encodeURIComponent(lastBarcode)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Search Open Food Facts
                </a>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(lastBarcode)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Search Google
                </a>
              </div>
            )}
            <button
              className="start-btn premium-btn"
              onClick={() => setPage("scan")}
            >
              ← Try Another
            </button>
          </div>
        </div>
      );

    }

    if (lookup === "error") {

      return (
        <div className="product-container">
          <div className="product-card">
            <h1>Something Went Wrong</h1>
            <p>Could not reach the nutrition database.</p>
            <div className="product-buttons">
              <button
                className="secondary-btn"
                onClick={() => setPage("scan")}
              >
                ← Back
              </button>
              {lastBarcode && (
                <button
                  className="start-btn premium-btn"
                  onClick={() => handleScanned(lastBarcode)}
                >
                  🔄 Retry
                </button>
              )}
            </div>
          </div>
        </div>
      );

    }

    if (selectedProduct) {

      return (
        <ProductInfo
          product={selectedProduct}
          profile={profile}
          onBack={() => setPage("scan")}
          onAdd={addProduct}
        />
      );

    }

    return null;

  }

  if (page === "basket") {

    return (
      <Basket
        basket={basket}
        setBasket={setBasket}
        updateQuantity={updateQuantity}
        profile={profile}
        onContinue={() => setPage("home")}
      />
    );

  }

  return null;

}

export default App;