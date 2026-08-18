const memory = new Map();

export const PROFILE_KEY = "nb_profile";
export const PROFILE_VERSION = 2;

export const SCAN_HISTORY_KEY = "nb_scan_history";
export const SCAN_HISTORY_MAX = 50;
export const SCAN_DEDUPE_MS = 60000;

export function storageGet(key) {
  let raw;
  try {
    raw = localStorage.getItem(key);
  } catch {
    // storage unavailable (private mode) — memory fallback
    return memory.has(key) ? memory.get(key) : null;
  }
  if (raw == null) {
    return memory.has(key) ? memory.get(key) : null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    // corrupt value — discard and start fresh
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return null;
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota / private mode — keep in memory only
    memory.set(key, value);
  }
}

export function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
  memory.delete(key);
}

export function profileKeyFor(email) {
  const key = String(email || "").trim().toLowerCase();
  return key ? `${PROFILE_KEY}:${key}` : PROFILE_KEY;
}

export function loadProfile(email) {
  const key = profileKeyFor(email);
  const profile = storageGet(key);
  if (profile != null) {
    if (profile.version === PROFILE_VERSION) return profile;
    storageRemove(key);
  }
  if (key !== PROFILE_KEY) {
    // First connect for this account: keep the legacy local profile and
    // seed the account profile from it so nothing is lost.
    const legacy = storageGet(PROFILE_KEY);
    if (legacy != null && legacy.version === PROFILE_VERSION) {
      storageSet(key, legacy);
      return legacy;
    }
    if (legacy != null) storageRemove(PROFILE_KEY);
  }
  return null;
}

export function saveProfile(profile, email) {
  storageSet(profileKeyFor(email), profile);
  return profile;
}

export function removeProfile(email) {
  storageRemove(profileKeyFor(email));
}

export function loadScanHistory() {
  const history = storageGet(SCAN_HISTORY_KEY);
  return Array.isArray(history) ? history : [];
}

export function saveScanHistory(entry) {
  const history = loadScanHistory();
  const previous = history[0];
  if (
    previous &&
    previous.barcode === entry.barcode &&
    entry.timestamp - previous.timestamp < SCAN_DEDUPE_MS
  ) {
    return history;
  }
  const next = [entry, ...history].slice(0, SCAN_HISTORY_MAX);
  storageSet(SCAN_HISTORY_KEY, next);
  return next;
}
