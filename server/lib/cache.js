const cache = new Map();
const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 5000;

export function get(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function set(key, value) {
  cache.set(key, { value, at: Date.now() });
  if (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
}

export function size() {
  return cache.size;
}
