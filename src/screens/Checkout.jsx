import "./../styles/checkout.css";
import { CartIcon } from "../components/icons";

function round2(n) { return Math.round(n * 100) / 100; }

function Checkout({
  basket,
  onPayment,
  onBack
}) {

  const totalItems = basket.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

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

    <div className="checkout-container">

      <div className="checkout-card">

        <h1><CartIcon size={28} /> Checkout</h1>

        <p className="checkout-subtitle">
          Review your order before completing payment.
        </p>

        <div className="summary-grid">

          <div className="summary-card">
            <h2>{totalItems}</h2>
            <span>Total Products</span>
          </div>

          <div className="summary-card">
            <h2>₹{round2(totalAmount)}</h2>
            <span>Total Amount</span>
          </div>

          <div className="summary-card">
            <h2>{totalCalories}</h2>
            <span>Calories</span>
          </div>

          <div className="summary-card">
            <h2>{totalProtein.toFixed(1)} g</h2>
            <span>Protein</span>
          </div>

          <div className="summary-card">
            <h2>{totalCarbs.toFixed(1)} g</h2>
            <span>Carbs</span>
          </div>

          <div className="summary-card">
            <h2>{totalFat.toFixed(1)} g</h2>
            <span>Fat</span>
          </div>

        </div>

        <div className="payment-box">

          <div className="qr-placeholder">
            <span className="qr-icon">🔒</span>
          </div>

          <h3>Demo Payment</h3>

          <p>
            This is a demo — no real UPI QR. Tap Pay to simulate payment.
          </p>

        </div>

        <button
          className="pay-btn"
          onClick={onPayment}
        >
          Pay ₹{round2(totalAmount)}
        </button>

        <button
          className="secondary-btn back-btn"
          onClick={onBack}
        >
          ← Back
        </button>

      </div>

    </div>

  );

}

export default Checkout;