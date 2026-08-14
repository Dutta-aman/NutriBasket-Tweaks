import "./../styles/basket.css";

function round2(n) { return Math.round(n * 100) / 100; }

function Basket({
  basket,
  setBasket,
  updateQuantity,
  onCheckout,
  onContinue,
}) {

  function removeItem(index) {
    const updatedBasket = basket.filter((_, i) => i !== index);
    setBasket(updatedBasket);
  }

  const totalAmount = basket.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalCalories = basket.reduce(
    (sum, item) => sum + item.calories * item.quantity,
    0
  );

  const totalProtein = basket.reduce(
    (sum, item) => sum + item.protein * item.quantity,
    0
  );

  const totalCarbs = basket.reduce(
    (sum, item) => sum + item.carbs * item.quantity,
    0
  );

  const totalFat = basket.reduce(
    (sum, item) => sum + item.fat * item.quantity,
    0
  );

  return (
    <div className="basket-container">

      <div className="basket-card">

        <h1>🧺 My Basket</h1>

        {basket.length === 0 ? (

          <div className="empty-box">

            <h2>Your basket is empty</h2>

            <p>Scan products to begin shopping.</p>

            <button
              className="start-btn"
              onClick={onContinue}
            >
              📷 Scan Products
            </button>

          </div>

        ) : (

          <>
            {basket.map((item, index) => (

              <div
                className="basket-item"
                key={item.id}
              >

                <div className="basket-left">

                  <div className="product-avatar">
                    🛒
                  </div>

                  <div>

                    <h2>{item.name}</h2>

                    <p>{item.brand}</p>

                    <p>
                      ₹{item.price} × {item.quantity}
                    </p>

                  </div>

                </div>

                <div className="basket-right">

                  <div className="quantity-box">

                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(index, -1)}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(index, 1)}
                    >
                      +
                    </button>

                  </div>

                  <h3>
                    ₹{round2(item.price * item.quantity)}
                  </h3>

                  <button
                    className="remove-btn"
                    onClick={() => removeItem(index)}
                  >
                    Remove
                  </button>

                </div>

              </div>

            ))}

            <div className="nutrition-summary">

              <h2>🥗 Nutrition Summary</h2>

              <div className="nutrition-grid-2">

                <div>
                  <h3>{totalCalories}</h3>
                  <span>Calories</span>
                </div>

                <div>
                  <h3>{totalProtein.toFixed(1)} g</h3>
                  <span>Protein</span>
                </div>

                <div>
                  <h3>{totalCarbs.toFixed(1)} g</h3>
                  <span>Carbs</span>
                </div>

                <div>
                  <h3>{totalFat.toFixed(1)} g</h3>
                  <span>Fat</span>
                </div>

              </div>

            </div>

            <div className="total-box">

              <h2>Total Amount</h2>

              <h1>₹{round2(totalAmount)}</h1>

            </div>

            <div className="basket-actions">

              <button
                className="secondary-btn"
                onClick={onContinue}
              >
                ← Continue Shopping
              </button>

              <button
                className="start-btn"
                onClick={onCheckout}
              >
                💳 Checkout
              </button>

            </div>

          </>

        )}

      </div>

    </div>
  );
}

export default Basket;