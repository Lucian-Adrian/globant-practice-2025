// Centralized HTTP client for react-admin & custom fetches with JWT auth.
// Ensures we always produce a proper Headers instance (react-admin's fetchUtils.fetchJson expects that).
import { fetchUtils } from 'react-admin';
import { getAccessToken } from '../auth/authProvider';

export const API_PREFIX = '/api';

export function buildHeaders(extra = {}) {
  const h = new Headers(extra instanceof Headers ? extra : { ...extra });
  const token = getAccessToken();
  if (token && !h.has('Authorization')) {
    h.set('Authorization', `Bearer ${token}`);
  }
  return h;
}

export async function httpJson(url, options = {}) {
  const { headers, ...rest } = options;
  const merged = { ...rest, headers: buildHeaders(headers) };
  return fetchUtils.fetchJson(url, merged);
}

export async function rawFetch(url, options = {}) {
  const { headers, ...rest } = options;
  const merged = { ...rest, headers: buildHeaders(headers) };
  return fetch(url, merged);
}
