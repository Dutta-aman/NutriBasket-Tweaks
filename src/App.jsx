import { useEffect, useState } from "react";

import Welcome from "./screens/Welcome";
import Home from "./screens/Home";
import ScanProduct from "./screens/ScanProduct";
import ProductInfo from "./screens/ProductInfo";
import Basket from "./screens/Basket";
import Checkout from "./screens/Checkout";
import PaymentSuccess from "./screens/PaymentSuccess";
import { fetchProductByBarcode } from "./lib/api";

function App() {

  const [page, setPage] = useState("welcome");

  const [basket, setBasket] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [lastBarcode, setLastBarcode] = useState(null);

  const [lookup, setLookup] = useState("idle");

  const [prices, setPrices] = useState({});

  const [slowLookup, setSlowLookup] = useState(false);

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

    fetchProductByBarcode(barcode)

      .then((product) => {

        if (!product) {

          setLookup("not-found");

          return;

        }

        setSelectedProduct(product);

        setLookup("ready");

      })

      .catch(() => {

        setLookup("error");

      });

  }

  function setPrice(barcode, price) {

    setPrices((prev) => ({ ...prev, [barcode]: price }));

  }

  function addProduct(product) {

    const priced = { ...product, price: prices[product.id] || 0 };

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

  function handleExit() {

    setBasket([]);

    setSelectedProduct(null);

    setLookup("idle");

    setPage("home");

  }

  if (page === "welcome") {

    return (
      <Welcome
        onStart={() => setPage("home")}
      />
    );

  }

  if (page === "home") {

    return (
      <Home
        basket={basket}
        onScan={() => setPage("scan")}
        onBasket={() => setPage("basket")}
        onCheckout={() => setPage("checkout")}
      />
    );

  }

  if (page === "scan") {

    return (
      <ScanProduct
        onProduct={handleScanned}
      />
    );

  }

  if (page === "product") {

    if (lookup === "loading") {

      return (
        <div className="product-container">
          <div className="product-card">
            <h1>Searching…</h1>
            <p>Fetching nutrition information.</p>
            {slowLookup && (
              <p className="lookup-hint">
                Waking up the server — first request can take ~40s.
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
              <button
                className="start-btn premium-btn"
                onClick={() => handleScanned(lastBarcode)}
              >
                🔄 Retry
              </button>
            </div>
          </div>
        </div>
      );

    }

    if (selectedProduct) {

      return (
        <ProductInfo
          product={selectedProduct}
          price={prices[selectedProduct.id] ?? null}
          onSetPrice={setPrice}
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
        onContinue={() => setPage("home")}
        onCheckout={() => setPage("checkout")}
      />
    );

  }

  if (page === "checkout") {

    return (
      <Checkout
        basket={basket}
        onPayment={() => setPage("success")}
      />
    );

  }

  if (page === "success") {

    return (
      <PaymentSuccess
        basket={basket}
        onExit={handleExit}
      />
    );

  }

  return null;

}

export default App;