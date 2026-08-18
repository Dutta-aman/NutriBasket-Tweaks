const memory = new Map();

export const PROFILE_KEY = "nb_profile";
export const PROFILE_VERSION = 2;

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

export function loadProfile() {
  const profile = storageGet(PROFILE_KEY);
  if (profile == null || profile.version !== PROFILE_VERSION) {
    if (profile != null) storageRemove(PROFILE_KEY);
    return null;
  }
  return profile;
}
