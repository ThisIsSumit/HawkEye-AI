const ACCESS_TOKEN_KEY = 'hawkeye_access_token';
const LEGACY_KEYS = ['accessToken'];

export function getStoredAccessToken(): string | null {
  const token = globalThis.localStorage?.getItem(ACCESS_TOKEN_KEY) ?? globalThis.sessionStorage?.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    return token;
  }

  for (const key of LEGACY_KEYS) {
    const legacy = globalThis.localStorage?.getItem(key) ?? globalThis.sessionStorage?.getItem(key);
    if (legacy) {
      setStoredAccessToken(legacy);
      globalThis.localStorage?.removeItem(key);
      globalThis.sessionStorage?.removeItem(key);
      return legacy;
    }
  }

  return null;
}

export function setStoredAccessToken(token: string) {
  globalThis.localStorage?.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearStoredAccessToken() {
  globalThis.localStorage?.removeItem(ACCESS_TOKEN_KEY);
  globalThis.sessionStorage?.removeItem(ACCESS_TOKEN_KEY);
  for (const key of LEGACY_KEYS) {
    globalThis.localStorage?.removeItem(key);
    globalThis.sessionStorage?.removeItem(key);
  }
}

export function getAccessTokenStorageKey() {
  return ACCESS_TOKEN_KEY;
}
