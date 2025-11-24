const ACCESS_TOKEN_KEY = "hg_access_token";

type Listener = (token: string | null) => void;
const listeners = new Set<Listener>();

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  for (const fn of listeners) fn(token);
}

export function clearAccessToken() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  for (const fn of listeners) fn(null);
}

export function onTokenChange(listener: Listener): () => void {
  listeners.add(listener);
  listener(getAccessToken());
  return () => {
    listeners.delete(listener);
    return true;
  };
}
