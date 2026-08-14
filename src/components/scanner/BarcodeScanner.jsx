import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, BrowserCodeReader } from "@zxing/browser";
import { gtinCheckDigitValid } from "../../lib/barcode";

const STATUS_TEXT = {
  idle: "Tap Start Camera",
  starting: "Starting camera…",
  scanning: "Ready to Scan",
  denied: "Camera access blocked",
  "no-camera": "No camera found",
  busy: "Camera is busy",
  error: "Camera failed to start",
  invalid: "✗ Not a valid product barcode — try again",
};

function BarcodeScanner({ onDetected }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const mountedRef = useRef(true);
  const lastScanRef = useRef({ text: "", at: 0 });
  const [status, setStatus] = useState("idle");

  function stopScanner() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    BrowserCodeReader.releaseAllStreams();
    if (videoRef.current) {
      BrowserCodeReader.cleanVideoSource(videoRef.current);
    }
  }

  function startScanner() {
    setStatus("starting");
    const codeReader = new BrowserMultiFormatReader(undefined, {
      delayBetweenScanAttempts: 300,
      delayBetweenScanSuccess: 800,
      tryPlayVideoTimeout: 8000,
    });

    codeReader
      .decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (!result || !mountedRef.current) return;
        const text = result.getText();
        const now = Date.now();
        if (text === lastScanRef.current.text && now - lastScanRef.current.at < 1500) {
          return;
        }
        lastScanRef.current = { text, at: now };
        if (!gtinCheckDigitValid(text)) {
          setStatus("invalid");
          return;
        }
        setStatus("scanning");
        stopScanner();
        onDetected(text);
      })
      .then((controls) => {
        if (!mountedRef.current) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setStatus("scanning");
      })
      .catch((error) => {
        if (!mountedRef.current) return;
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
      stopScanner();
    };
  }, []);

  const failed = ["denied", "no-camera", "busy", "error"].includes(status);

  const bad = failed || status === "invalid";

  return (
    <>
      <div className="scanner-ui">
        <div className="scanner-frame premium-scanner">
          <video ref={videoRef} className="scanner-video" muted playsInline />
          <div className="scan-corner top-left"></div>
          <div className="scan-corner top-right"></div>
          <div className="scan-corner bottom-left"></div>
          <div className="scan-corner bottom-right"></div>
          <div className="scan-line"></div>
          {status === "idle" && (
            <div className="scanner-overlay">📸</div>
          )}
        </div>
      </div>

      <div className="scanner-status premium-status">
        <span>{bad ? "🔴" : status === "starting" ? "⏳" : "🟢"}</span>
        {STATUS_TEXT[status]}
      </div>

      <p className="scan-help">
        {failed
          ? "You can still enter the barcode manually below."
          : "Place the barcode inside the frame"}
      </p>

      {status === "idle" && (
        <button className="start-btn premium-btn" onClick={startScanner}>
          📸 Start Camera
        </button>
      )}

      {failed && (
        <button className="start-btn premium-btn" onClick={startScanner}>
          🔄 Try Again
        </button>
      )}
    </>
  );
}

export default BarcodeScanner;
