// Centralized HTTP client for react-admin & custom fetches with JWT auth.
// Ensures we always produce a proper Headers instance (react-admin's fetchUtils.fetchJson expects that).
import { fetchUtils } from 'react-admin';
import { getAccessToken, getRefreshToken, setAccessToken } from '../auth/authProvider';

export const API_PREFIX = '/api';

export function buildHeaders(extra = {}) {
  const h = new Headers(extra instanceof Headers ? extra : { ...extra });
  const token = getAccessToken();
  if (token && !h.has('Authorization')) {
    h.set('Authorization', `Bearer ${token}`);
  }
  return h;
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const resp = await fetch('/api/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data.access) return null;
    setAccessToken(data.access);
    return data.access;
  } catch (_) { return null; }
}

export async function httpJson(url, options = {}) {
  const { headers, retry, ...rest } = options;
  const merged = { ...rest, headers: buildHeaders(headers) };
  try {
    return await fetchUtils.fetchJson(url, merged);
  } catch (err) {
    const status = err?.status;
    if (!retry && (status === 401 || status === 403)) {
      const token = await refreshAccessToken();
      if (token) {
        const newHeaders = new Headers(merged.headers || {});
        newHeaders.set('Authorization', `Bearer ${token}`);
        return fetchUtils.fetchJson(url, { ...merged, headers: newHeaders, retry: true });
      }
    }
    throw err;
  }
}

export async function rawFetch(url, options = {}) {
  const { headers, retry, ...rest } = options;
  const merged = { ...rest, headers: buildHeaders(headers) };
  let resp = await fetch(url, merged);
  if (!retry && (resp.status === 401 || resp.status === 403)) {
    const token = await refreshAccessToken();
    if (token) {
      const newHeaders = new Headers(merged.headers || {});
      newHeaders.set('Authorization', `Bearer ${token}`);
      resp = await fetch(url, { ...merged, headers: newHeaders, retry: true });
    }
  }
  return resp;
}
