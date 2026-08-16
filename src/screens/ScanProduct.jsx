import { useState } from "react";
import "./../styles/global.css";
import BarcodeScanner from "./../components/scanner/BarcodeScanner";
import { gtinCheckDigitValid } from "./../lib/barcode";
import { ScanIcon } from "../components/icons";

function ScanProduct({ onProduct, onBack }) {

  const [manualCode, setManualCode] = useState("");

  const [manualError, setManualError] = useState("");

  function handleManualSubmit(event) {

    event.preventDefault();

    const code = manualCode.trim();

    if (!gtinCheckDigitValid(code)) {

      setManualError("Enter a valid 8-14 digit barcode");

      return;

    }

    setManualError("");

    onProduct(code);

  }

  return (

    <div className="scan-container">

      <div className="scan-card premium-scan">

        <button className="secondary-btn scan-back-btn" onClick={onBack}>← Back</button>

        <div className="scan-header">

          <div className="scan-icon">

            <ScanIcon size={48} />

          </div>

          <h1>

            Product Scanner

          </h1>

          <p>

            Scan a product barcode or QR code to view
            price and nutrition information.

          </p>

        </div>

        <BarcodeScanner onDetected={onProduct} />

        <form className="manual-form" onSubmit={handleManualSubmit}>

          <input

            className="manual-input"

            type="text"

            inputMode="numeric"

            maxLength="14"

            aria-label="Barcode"

            placeholder="Or enter barcode manually…"

            value={manualCode}

            onChange={(event) => setManualCode(event.target.value)}

          />

          <button

            type="submit"

            className="secondary-btn manual-btn"

          >

            Look Up

          </button>

        </form>

        {manualError && (

          <p className="manual-error">

            {manualError}

          </p>

        )}

      </div>

    </div>

  );

}

export default ScanProduct;
