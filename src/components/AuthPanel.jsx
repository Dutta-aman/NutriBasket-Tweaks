import { useEffect, useRef, useState } from "react";

const GIS_SCRIPT_URL = "https://accounts.google.com/gsi/client";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function decodeJwtPayload(token) {
  try {
    const base64 = String(token).split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function loadGisScript() {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

const BUTTON_STYLES = {
  theme: "outline",
  size: "large",
  shape: "rectangular",
  text: "signin_with",
};

export default function AuthPanel({ activeAccount, onSignIn, onSignOut }) {
  const buttonRef = useRef(null);
  const onSignInRef = useRef(onSignIn);
  const [gisReady, setGisReady] = useState(false);
  const [gisFailed, setGisFailed] = useState(false);

  useEffect(() => {
    onSignInRef.current = onSignIn;
  });

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadGisScript()
      .then(() => {
        if (cancelled || !window.google || !window.google.accounts) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => {
            const payload = decodeJwtPayload(response && response.credential);
            if (payload && payload.email) {
              onSignInRef.current({
                googleId: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
              });
            }
          },
        });
        setGisReady(true);
      })
      .catch(() => {
        if (!cancelled) setGisFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!gisReady || !window.google || !window.google.accounts) return;
    const id = window.google.accounts.id;
    if (buttonRef.current && typeof id.renderButton === "function") {
      id.renderButton(buttonRef.current, BUTTON_STYLES);
    } else if (typeof id.prompt === "function") {
      id.prompt();
    }
  }, [gisReady]);

  if (activeAccount) {
    return (
      <div className="account-panel" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          {activeAccount.picture ? (
            <img
              className="account-avatar"
              src={activeAccount.picture}
              alt=""
              style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
          ) : (
            <span
              className="account-avatar account-avatar--fallback"
              aria-hidden="true"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--emerald-600)",
                color: "#fff",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {(activeAccount.name || activeAccount.email || "?").charAt(0).toUpperCase()}
            </span>
          )}
          <div style={{ minWidth: 0 }}>
            <strong style={{ display: "block", fontSize: 14 }}>{activeAccount.name || "Connected account"}</strong>
            <span style={{ fontSize: 12, color: "var(--text-muted)", wordBreak: "break-all" }}>
              Connected as {activeAccount.email}
            </span>
          </div>
        </div>
        <button type="button" className="secondary-btn account-signout" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="account-panel">
      {!CLIENT_ID ? (
        <>
          <button type="button" className="start-btn account-google-btn" disabled>
            Connect with Google
          </button>
          <p className="account-note" style={{ fontSize: 13, color: "var(--text-muted)", margin: "10px 0 0" }}>
            Google sign-in needs VITE_GOOGLE_CLIENT_ID in .env — add your Google Cloud
            OAuth client ID
          </p>
        </>
      ) : gisFailed ? (
        <p className="account-note" style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
          Could not load Google sign-in. Check your connection and try again.
        </p>
      ) : (
        <>
          <div ref={buttonRef} className="account-google-button" />
          {!gisReady ? (
            <p className="account-note" style={{ fontSize: 13, color: "var(--text-muted)", margin: "10px 0 0" }}>
              Loading Google sign-in…
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}