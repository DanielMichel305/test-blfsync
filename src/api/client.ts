import { clearPrivateQueryData } from "./queryClient";
import {
  clearStoredSession,
  getAccessToken,
  getRefreshToken,
  storeTokens,
  type TokenPair,
} from "./session";
import type { components } from "./generated";

type ErrorBody = components["schemas"]["Error"];

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/v1"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly error: string,
    public readonly code?: string,
    public readonly details?: ErrorBody["details"],
  ) {
    super(error);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown | FormData;
  auth?: boolean;
  retryAuth?: boolean;
};

function endSession() {
  clearStoredSession();
  clearPrivateQueryData();
  window.dispatchEvent(new CustomEvent("better-life:session-cleared"));
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await parseBody(response);
    if (!response.ok) return false;
    storeTokens(data as TokenPair);
    return true;
  } catch {
    return false;
  }
}

let refreshPromise: Promise<boolean> | null = null;

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    body,
    auth = true,
    retryAuth = true,
    headers: suppliedHeaders,
    ...init
  } = options;
  const headers = new Headers(suppliedHeaders);
  headers.set("Accept", "application/json");

  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (auth && getAccessToken()) {
    headers.set("Authorization", `Bearer ${getAccessToken()}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      body:
        body instanceof FormData
          ? body
          : body === undefined
            ? undefined
            : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      0,
      "Unable to reach the Better Life API.",
      "NETWORK_ERROR",
    );
  }

  if (response.status === 401 && auth && retryAuth && getRefreshToken()) {
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
    const refreshed = await refreshPromise;
    if (refreshed) return apiRequest<T>(path, { ...options, retryAuth: false });
    endSession();
  }
  if (response.status === 401 && auth && !retryAuth) endSession();

  const data = await parseBody(response);
  if (!response.ok) {
    const error = (
      data && typeof data === "object" ? data : {}
    ) as Partial<ErrorBody>;
    throw new ApiError(
      response.status,
      error.error || response.statusText || "API request failed.",
      error.code,
      error.details,
    );
  }

  return data as T;
}

export function withQuery(path: string, params: Record<string, unknown> = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "")
      search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export function toFormData(values: Record<string, unknown>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === null) {
      data.append(key, "");
      return;
    }
    if (Array.isArray(value))
      value.forEach((item) => data.append(key, String(item)));
    else if (value instanceof Blob) data.append(key, value);
    else data.append(key, String(value));
  });
  return data;
}

export function clearSession() {
  endSession();
}
