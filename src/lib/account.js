import { storageGet, storageSet } from "./storage";

const ACCOUNTS_KEY = "nb_accounts";

export function accountKey(email) {
  return String(email || "").trim().toLowerCase();
}

export function getAccountStore() {
  const raw = storageGet(ACCOUNTS_KEY);
  const store =
    raw && typeof raw === "object" && Array.isArray(raw.accounts)
      ? raw
      : { accounts: [], activeEmail: null };
  return {
    accounts: Array.isArray(store.accounts) ? store.accounts : [],
    activeEmail: typeof store.activeEmail === "string" ? store.activeEmail : null,
  };
}

function saveAccountStore(store) {
  storageSet(ACCOUNTS_KEY, {
    accounts: store.accounts,
    activeEmail: store.activeEmail,
  });
}

export function signIn(profileFromGoogle) {
  const store = getAccountStore();
  const email = accountKey(profileFromGoogle.email);
  const account = {
    googleId: profileFromGoogle.googleId,
    name: profileFromGoogle.name,
    email: profileFromGoogle.email,
    picture: profileFromGoogle.picture,
  };
  const existing = store.accounts.find((a) => accountKey(a.email) === email);
  const stored = {
    ...(existing || {}),
    ...account,
    createdAt: existing ? existing.createdAt : Date.now(),
  };
  const accounts = existing
    ? store.accounts.map((a) => (accountKey(a.email) === email ? stored : a))
    : [...store.accounts, stored];
  saveAccountStore({ accounts, activeEmail: email });
  return stored;
}

export function signOut() {
  const store = getAccountStore();
  saveAccountStore({ ...store, activeEmail: null });
}

export function removeAccount(email) {
  const key = accountKey(email);
  const store = getAccountStore();
  const accounts = store.accounts.filter((a) => accountKey(a.email) !== key);
  const activeEmail =
    store.activeEmail === key ? null : store.activeEmail;
  saveAccountStore({ accounts, activeEmail });
}

export function activeAccount() {
  const store = getAccountStore();
  if (!store.activeEmail) return null;
  return store.accounts.find((a) => accountKey(a.email) === store.activeEmail) || null;
}