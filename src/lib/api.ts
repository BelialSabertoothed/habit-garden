import { getAccessToken, setAccessToken, clearAccessToken } from "./authToken";

const RAW_API_URL = import.meta.env.VITE_API_URL ?? "";
const API_URL = RAW_API_URL.replace(/\/+$/, "") + "/";

const WITH_CREDENTIALS =
  (import.meta.env.VITE_API_WITH_CREDENTIALS ?? "false") === "true";

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, data: unknown, message?: string) {
    super(message ?? `API error ${status}`);
    this.status = status;
    this.data = data;
  }
}

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
type Opts = {
  json?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  _retry?: boolean;
};

async function rawFetch(path: string, method: Method, opts: Opts = {}) {
  const headers: Record<string, string> = {
    ...(opts.json ? { "Content-Type": "application/json" } : {}),
    ...(opts.headers ?? {}),
  };

  const token = getAccessToken();
  console.log("[api] rawFetch path:", path, "token:", token); // 👈 debug

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = new URL(path, API_URL).toString();
  console.log("[api] final URL:", url); // 👈 debug

  const res = await fetch(url, {
    method,
    headers,
    body: opts.json ? JSON.stringify(opts.json) : undefined,
    credentials: WITH_CREDENTIALS ? "include" : "same-origin",
    signal: opts.signal,
  });

  const text = await res.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })()
    : null;

  return { res, data };
}

async function request<T>(
  path: string,
  method: Method,
  opts: Opts = {}
): Promise<T> {
  let { res, data } = await rawFetch(path, method, opts);

  if (res.status === 401 && !opts._retry) {
    // pokus o refresh – zůstává, ale bez další invalidace query
    const r = await fetch(new URL("auth/refresh", API_URL).toString(), {
      method: "POST",
      credentials: WITH_CREDENTIALS ? "include" : "same-origin",
    });

    if (r.ok) {
      const body = await r.json();
      const accessToken = (body as any)?.accessToken;
      if (typeof accessToken === "string") {
        setAccessToken(accessToken);
        ({ res, data } = await rawFetch(path, method, {
          ...opts,
          _retry: true,
        }));
      }
    } else {
      // refresh selhal → prostě smažeme token a dál necháme 401 dojít až do useMe
      clearAccessToken();
    }
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data,
      (data as any)?.message || (data as any)?.error
    );
  }

  return data as T;
}

export const api = {
  get: <T>(p: string, o?: Opts) => request<T>(p, "GET", o),
  post: <T>(p: string, o?: Opts) => request<T>(p, "POST", o),
  patch: <T>(p: string, o?: Opts) => request<T>(p, "PATCH", o),
  put: <T>(p: string, o?: Opts) => request<T>(p, "PUT", o),
  del: <T>(p: string, o?: Opts) => request<T>(p, "DELETE", o),
};
