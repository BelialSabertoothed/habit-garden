const KEY = "hg_access_token";
type Listener = (token: string | null) => void;
const listeners = new Set<Listener>();

export function getAccessToken(): string | null {
  return localStorage.getItem(KEY);
}
export function setAccessToken(token: string) {
  localStorage.setItem(KEY, token);
  listeners.forEach((l) => l(token));
}
export function clearAccessToken() {
  localStorage.removeItem(KEY);
  listeners.forEach((l) => l(null));
}
export function onTokenChange(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
