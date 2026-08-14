import "./../styles/payment.css";

function round2(n) { return Math.round(n * 100) / 100; }

function PaymentSuccess({
  basket,
  onExit
}) {

  const total = basket.reduce(
    (sum, item) =>
      sum + item.price * (item.quantity || 1),
    0
  );

  const transactionId =
    "NB" + Math.floor(Math.random() * 100000000);

  const date = new Date().toLocaleString();

  return (

    <div className="success-container">

      <div className="success-card">

        <div className="success-icon">
          ✅
        </div>

        <h1>
          Payment Successful
        </h1>

        <p>
          Thank you for shopping with NutriBasket.
        </p>

        <div className="verification-box">

          <div className="verification-row">
            <span className="label">
              Payment Status
            </span>

            <span className="value">
              🟢 Verified
            </span>
          </div>

          <div className="verification-row">
            <span className="label">
              Transaction ID
            </span>

            <span className="value">
              {transactionId}
            </span>
          </div>

          <div className="verification-row">
            <span className="label">
              Amount Paid
            </span>

            <span className="value">
              ₹{round2(total)}
            </span>
          </div>

          <div className="verification-row">
            <span className="label">
              Date & Time
            </span>

            <span className="value">
              {date}
            </span>
          </div>

        </div>

        <button
          className="success-btn"
          onClick={onExit}
        >
          ✔ Confirm & Exit
        </button>

      </div>

    </div>

  );

}

export default PaymentSuccess;