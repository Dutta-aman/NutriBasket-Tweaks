import { useEffect, useRef, useState } from "react";

import Welcome from "./screens/Welcome";
import Home from "./screens/Home";
import ScanProduct from "./screens/ScanProduct";
import ProductInfo from "./screens/ProductInfo";
import Basket from "./screens/Basket";
import Checkout from "./screens/Checkout";
import PaymentSuccess from "./screens/PaymentSuccess";
import { fetchProductByBarcode } from "./lib/api";
import { extractBarcodeFromQr } from "./lib/barcode";
import ProfileBoundary from "./components/ProfileBoundary";
import { computeBMI, computeTargets, perceptionMessage } from "./lib/bmi";
import { productRiskFlags } from "./lib/explainer";
import { loadProfile, saveProfile, removeProfile, saveScanHistory } from "./lib/storage";
import { activeAccount, signIn, signOut } from "./lib/account";

function buildProfileSnapshot(profile, product) {
  if (!profile) return null;
  const bmi = computeBMI(profile.weightKg, profile.heightCm);
  const flags = productRiskFlags(product);
  const targets = computeTargets(profile);
  const calories = Number(product.calories);
  let budgetSummary = null;
  if (targets && Number.isFinite(calories) && calories > 0) {
    const share = Math.min(100, Math.round((calories / targets.calories) * 100));
    budgetSummary = `${share}% of ${targets.calories} kcal daily budget`;
  }
  return {
    bmi,
    riskFlags: flags.map((flag) => flag.label),
    perceptionMessage: perceptionMessage(profile, bmi),
    budgetSummary,
  };
}

function App() {

  const [page, setPage] = useState(() => {
    const saved = sessionStorage.getItem("nb_page");
    return saved === "product" ? "home" : saved || "welcome";
  });

  const [basket, setBasket] = useState(() => {
    try {
      const raw = sessionStorage.getItem("nb_basket");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [lastBarcode, setLastBarcode] = useState(null);

  const [lookup, setLookup] = useState("idle");

  const [prices] = useState({});

  const [slowLookup, setSlowLookup] = useState(false);

  const [profile, setProfile] = useState(() => loadProfile(activeAccount()?.email));

  const [account, setAccount] = useState(() => activeAccount());

  const lookupSeqRef = useRef(0);

  const pageRef = useRef(page);

  const historyRef = useRef([]);

  function navigate(next) {
    if (pageRef.current === next) return;
    const stack = historyRef.current;
    if (stack[stack.length - 1] !== pageRef.current) stack.push(pageRef.current);
    pageRef.current = next;
    setPage(next);
  }

  function goBack() {
    const stack = historyRef.current;
    const target = stack.pop() ?? "home";
    pageRef.current = target;
    setPage(target);
  }

  function cancelLookup() {
    lookupSeqRef.current += 1;
    setLookup("idle");
    setSelectedProduct(null);
    goBack();
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("product") ?? params.get("barcode") ?? params.get("code") ?? params.get("gtin") ?? params.get("ean") ?? params.get("id");
    const pathMatch = window.location.pathname.match(/^\/(\d{8,14})$/);
    const barcode = (raw ? extractBarcodeFromQr(raw) : null) ?? (pathMatch ? extractBarcodeFromQr(pathMatch[1]) : null);
    if (barcode) {
      historyRef.current = [];
      if (pageRef.current === "welcome") pageRef.current = "home";
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
    sessionStorage.setItem("nb_page", page);
  }, [page]);

  useEffect(() => {
    sessionStorage.setItem("nb_basket", JSON.stringify(basket));
  }, [basket]);

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

    navigate("product");

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

        saveScanHistory({
          id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9),
          barcode: product.barcode || barcode,
          name: product.name || "Unknown product",
          image: product.image_url || null,
          timestamp: Date.now(),
          profileSnapshot: buildProfileSnapshot(profile, product),
        });

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

    navigate("basket");

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

    saveProfile(p, account?.email);

    navigate("home");

  }

  function handleProfileReset() {

    removeProfile(account?.email);

    setProfile(null);

    navigate("welcome");

  }

  function handleGoogleSignIn(googleUser) {

    const connected = signIn(googleUser);

    setAccount(connected);

    setProfile(loadProfile(connected.email));

  }

  function handleGoogleSignOut() {

    signOut();

    setAccount(null);

    setProfile(loadProfile());

  }

  function handleExit() {

    setBasket([]);

    setSelectedProduct(null);

    setLookup("idle");

    setLastBarcode(null);

    navigate("home");

  }

  if (page === "welcome") {

    return (
      <Welcome
        profile={profile}
        onStart={() => navigate(profile ? "home" : "profile")}
      />
    );

  }

  if (page === "profile") {

    return (
      <ProfileBoundary
        onReset={handleProfileReset}
        onComplete={handleProfileComplete}
        onSkip={() => navigate("home")}
        onBack={goBack}
        activeAccount={account}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleGoogleSignOut}
      />
    );

  }

  if (page === "home") {

    return (
      <Home
        profile={profile}
        onScan={() => navigate("scan")}
        onBasket={() => navigate("basket")}
        onSetupProfile={() => navigate("profile")}
        onOpenScan={handleScanned}
      />
    );

  }

  if (page === "scan") {

    return (
      <ScanProduct
        onProduct={handleScanned}
        onBack={goBack}
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
            <div className="product-buttons">
              <button
                className="secondary-btn"
                onClick={cancelLookup}
              >
                ← Back
              </button>
            </div>
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
            <div className="product-buttons">
              <button
                className="secondary-btn"
                onClick={goBack}
              >
                ← Back
              </button>
              <button
                className="start-btn premium-btn"
                onClick={() => navigate("scan")}
              >
                ← Try Another
              </button>
            </div>
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
                onClick={goBack}
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
          onBack={goBack}
          onHome={() => navigate("home")}
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
        onBack={goBack}
        onContinue={() => navigate("home")}
        onHome={() => navigate("home")}
        onCheckout={() => navigate("checkout")}
      />
    );

  }

  if (page === "checkout") {

    return (
      <Checkout
        basket={basket}
        onBack={goBack}
        onPayment={() => navigate("payment")}
      />
    );

  }

  if (page === "payment") {

    return (
      <PaymentSuccess
        basket={basket}
        onBack={goBack}
        onExit={handleExit}
      />
    );

  }

  return null;

}

export default App;