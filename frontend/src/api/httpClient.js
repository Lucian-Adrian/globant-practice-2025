// Centralized HTTP client for react-admin & custom fetches with JWT auth.
// Ensures we always produce a proper Headers instance (react-admin's fetchUtils.fetchJson expects that).
import { fetchUtils } from 'react-admin';
import { getAccessToken, getRefreshToken, setAccessToken } from '../auth/authProvider';

// Use VITE_API_BASE_URL if set (production), otherwise use relative /api path (development/proxy)
export const API_PREFIX = import.meta.env.VITE_API_BASE_URL || '/api';

export function buildHeaders(extra = {}) {
  const h = new Headers(extra instanceof Headers ? extra : { ...extra });
  const token = getAccessToken();
  if (token && !h.has('Authorization')) {
    h.set('Authorization', `Bearer ${token}`);
  }
  return h;
}

// --- Student tokens helpers (separate from admin/react-admin tokens) ---
function getStudentAccessToken() { return localStorage.getItem('student_access_token'); }
function setStudentAccessToken(tok) { return localStorage.setItem('student_access_token', tok); }
function getStudentRefreshToken() { return localStorage.getItem('student_refresh_token'); }
function clearStudentTokens() {
  localStorage.removeItem('student_access_token');
  localStorage.removeItem('student_refresh_token');
}

export function buildStudentHeaders(extra = {}) {
  const h = new Headers(extra instanceof Headers ? extra : { ...extra });
  const token = getStudentAccessToken();
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

async function refreshStudentAccessToken() {
  const refresh = getStudentRefreshToken();
  if (!refresh) return null;
  try {
    const resp = await fetch('/api/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data.access) return null;
    setStudentAccessToken(data.access);
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
    // Don't retry if already retried or if it's a client error other than auth
    if (!retry && (status === 401 || status === 403)) {
      const token = await refreshAccessToken();
      if (token) {
        const newHeaders = new Headers(merged.headers || {});
        newHeaders.set('Authorization', `Bearer ${token}`);
        return fetchUtils.fetchJson(url, { ...merged, headers: newHeaders, retry: true });
      }
    }
    // Ensure error has a message for React Query
    if (err && !err.message) {
      err.message = `HTTP Error ${status || 'unknown'}`;
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

// Student-aware versions for the portal
export async function studentHttpJson(url, options = {}) {
  const { headers, retry, ...rest } = options;
  const merged = { ...rest, headers: buildStudentHeaders(headers) };
  try {
    return await fetchUtils.fetchJson(url, merged);
  } catch (err) {
    const status = err?.status;
    if (!retry && (status === 401 || status === 403)) {
      const token = await refreshStudentAccessToken();
      if (token) {
        const newHeaders = new Headers(merged.headers || {});
        newHeaders.set('Authorization', `Bearer ${token}`);
        return fetchUtils.fetchJson(url, { ...merged, headers: newHeaders, retry: true });
      } else {
        // If refresh failed, clear tokens
        clearStudentTokens();
      }
    }
    // Ensure error has a message for React Query
    if (err && !err.message) {
      err.message = `HTTP Error ${status || 'unknown'}`;
    }
    throw err;
  }
}

export async function studentRawFetch(url, options = {}) {
  const { headers, retry, ...rest } = options;
  const merged = { ...rest, headers: buildStudentHeaders(headers) };
  let resp = await fetch(url, merged);
  if (!retry && (resp.status === 401 || resp.status === 403)) {
    const token = await refreshStudentAccessToken();
    if (token) {
      const newHeaders = new Headers(merged.headers || {});
      newHeaders.set('Authorization', `Bearer ${token}`);
      resp = await fetch(url, { ...merged, headers: newHeaders, retry: true });
    } else {
      // If refresh failed, clear tokens for safety
      clearStudentTokens();
    }
  }
  return resp;
}
