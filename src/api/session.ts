const REFRESH_TOKEN_KEY = 'better-life.refresh-token';

let accessToken: string | null = null;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function storeTokens(tokens: TokenPair) {
  accessToken = tokens.accessToken;
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearStoredSession() {
  accessToken = null;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
