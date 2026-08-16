import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, BrowserCodeReader } from "@zxing/browser";
import { gtinCheckDigitValid, extractBarcodeFromQr, isPaymentQR } from "../../lib/barcode";
import { ScanIcon, CameraIcon, CheckIcon } from "../icons";

const STATUS_TEXT = {
  idle: "Tap Scan Now to begin",
  starting: "Starting camera…",
  scanning: "Ready to Scan",
  detected: "Scan success",
  "qr-detected": "Scan success",
  denied: "Camera access blocked",
  "no-camera": "No camera found",
  busy: "Camera is busy",
  error: "Camera failed to start",
  invalid: "Not a valid product barcode — try again",
  payment: "Payment not available in app",
};

function BarcodeScanner({ onDetected }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const mountedRef = useRef(true);
  const lastScanRef = useRef({ text: "", at: 0 });
  const generationRef = useRef(0);
  const detectedTimeoutRef = useRef(null);
  const [status, setStatus] = useState("idle");

  function stopScanner() {
    generationRef.current += 1;
    controlsRef.current?.stop();
    controlsRef.current = null;
    BrowserCodeReader.releaseAllStreams();
    if (videoRef.current) {
      BrowserCodeReader.cleanVideoSource(videoRef.current);
    }
  }

  function resetToIdle() {
    stopScanner();
    setStatus("idle");
  }

  function startScanner() {
    stopScanner();
    const generation = generationRef.current;
    setStatus("starting");
    const codeReader = new BrowserMultiFormatReader(undefined, {
      delayBetweenScanAttempts: 300,
      delayBetweenScanSuccess: 800,
      tryPlayVideoTimeout: 8000,
    });

    codeReader
      .decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (!result || !mountedRef.current) return;
        if (generation !== generationRef.current) return;
        const text = result.getText();
        const now = Date.now();
        if (text === lastScanRef.current.text && now - lastScanRef.current.at < 1500) {
          return;
        }
        lastScanRef.current = { text, at: now };
        if (!gtinCheckDigitValid(text)) {
          if (isPaymentQR(text)) {
            stopScanner();
            setStatus("payment");
            return;
          }
          const barcode = extractBarcodeFromQr(text);
          if (barcode) {
            setStatus("qr-detected");
            stopScanner();
            detectedTimeoutRef.current = setTimeout(() => {
              if (!mountedRef.current) return;
              onDetected(barcode);
            }, 600);
            return;
          }
          stopScanner();
          setStatus("invalid");
          return;
        }
        setStatus("detected");
        stopScanner();
        detectedTimeoutRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          onDetected(text);
        }, 600);
      })
      .then((controls) => {
        if (!mountedRef.current || generation !== generationRef.current) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setStatus("scanning");
      })
      .catch((error) => {
        if (!mountedRef.current || generation !== generationRef.current) return;
        if (error.name === "NotAllowedError") setStatus("denied");
        else if (error.name === "NotFoundError") setStatus("no-camera");
        else if (error.name === "NotReadableError") setStatus("busy");
        else setStatus("error");
      });
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(detectedTimeoutRef.current);
      stopScanner();
    };
  }, []);

  const failed = ["denied", "no-camera", "busy", "error"].includes(status);

  const bad = failed || status === "invalid" || status === "payment";

  const success = status === "detected" || status === "qr-detected";

  return (
    <>
      <div className="scanner-ui">
        <div className={`scanner-frame premium-scanner${status === "invalid" || status === "payment" ? " scanner-invalid" : ""}`}>
          <video ref={videoRef} className="scanner-video" muted playsInline />
          <div className="scan-corner top-left"></div>
          <div className="scan-corner top-right"></div>
          <div className="scan-corner bottom-left"></div>
          <div className="scan-corner bottom-right"></div>
          <div className="scan-line"></div>
          {status === "idle" && (
            <div className="scanner-overlay">
              <CameraIcon size={48} className="scanner-camera-icon" />
            </div>
          )}
          {success && (
            <div className="scanner-success">
              <CheckIcon size={64} />
            </div>
          )}
        </div>
      </div>

      <div className="scanner-status premium-status" role="status" aria-live="polite">
        <span className={`status-dot status-${bad ? "bad" : status === "starting" ? "waiting" : success ? "ok" : "idle"}`} />
        {STATUS_TEXT[status]}
      </div>

      <p className="scan-help">
        {bad
          ? "You can still enter the barcode manually below."
          : "Place a barcode or product QR inside the frame"}
      </p>

      {status === "idle" && (
        <button className="start-btn premium-btn" onClick={startScanner}>
          <ScanIcon size={18} /> Scan Now
        </button>
      )}

      {bad && (
        <button className="start-btn premium-btn" onClick={status === "invalid" || status === "payment" ? resetToIdle : startScanner}>
          Try Again
        </button>
      )}
    </>
  );
}

export default BarcodeScanner;
