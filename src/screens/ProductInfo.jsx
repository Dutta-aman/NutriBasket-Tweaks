import { useState } from "react";
import "./../styles/global.css";

function ProductInfo({
  product,
  price,
  onSetPrice,
  onAdd,
  onBack
}) {

  const [priceInput, setPriceInput] = useState("");

  const priceInputValid = /^\d+(\.\d{1,2})?$/.test(priceInput.trim());

  function fmt(value, suffix) {

    return value === null || value === undefined ? "N/A" : `${value}${suffix}`;

  }

  function handleAdd() {

    if (price === null) {

      if (!priceInputValid) return;

      const finalPrice = Number(priceInput.trim());

      onSetPrice(product.id, finalPrice);

      onAdd(product, finalPrice);

    } else {

      onAdd(product, price);

    }

  }

  return (

    <div className="product-container">

      <div className="product-card premium-product">

        <div className="product-hero">

          {product.image_url ? (

            <img
              className="product-photo"
              src={product.image_url}
              alt={product.name}
            />

          ) : (

            <div className="product-image premium-product-icon">

              🛒

            </div>

          )}

          <h1>

            {product.name}

          </h1>

          <p className="brand premium-brand">

            🏷 {product.brand}

          </p>

        </div>

        <div className="nutrition-grid premium-nutrition">

          <div className="price-card">

            {price === null ? (

              <input

                className="price-input"

                type="number"

                min="0"

                step="0.5"

                aria-label="Price in rupees"

                placeholder="₹"

                value={priceInput}

                onChange={(event) => setPriceInput(event.target.value)}

              />

            ) : (

              <h2>
                ₹{price}
              </h2>

            )}

            <span>

              {price === null ? "Enter Price" : "Price"}

            </span>

          </div>

          <div>

            <h2>
              🔥 {fmt(product.calories)}
            </h2>

            <span>
              Calories
            </span>

          </div>

          <div>

            <h2>
              💪 {fmt(product.protein, "g")}
            </h2>

            <span>
              Protein
            </span>

          </div>

          <div>

            <h2>
              🌾 {fmt(product.carbs, "g")}
            </h2>

            <span>
              Carbs
            </span>

          </div>

          <div>

            <h2>
              🥑 {fmt(product.fat, "g")}
            </h2>

            <span>
              Fat
            </span>

          </div>

        </div>

        <div className="product-buttons premium-product-buttons">

          <button

            className="secondary-btn"

            onClick={onBack}

          >

            ← Back

          </button>

          <button

            className="start-btn premium-btn"

            onClick={handleAdd}

            disabled={price === null && !priceInputValid}

          >

            🧺 Add to Basket

          </button>

        </div>

      </div>

    </div>

  );

}

export default ProductInfo;
