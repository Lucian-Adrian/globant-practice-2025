// Moved from src/authProvider.js (unused duplicate). Canonical version: src/auth/authProvider.js

// Original contents preserved for reference.
export const TOKEN_KEY = 'jwt_access';
export const REFRESH_KEY = 'jwt_refresh';
const apiBase = '/api/auth';
export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const setAccessToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export const setRefreshToken = (t) => localStorage.setItem(REFRESH_KEY, t);
export const clearTokens = () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(REFRESH_KEY); };
export const authProvider = { login: async ({ username, password }) => { const resp = await fetch(`${apiBase}/token/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }); if (!resp.ok) { const body = await resp.json().catch(() => ({})); throw new Error(body.detail || body.message || 'Invalid credentials'); } const data = await resp.json(); if (data.access) setAccessToken(data.access); if (data.refresh) setRefreshToken(data.refresh); }, logout: () => { clearTokens(); return Promise.resolve(); }, checkError: (error) => { const status = error?.status; if (status === 401 || status === 403) { return authProvider.refreshAccessToken().catch(() => { clearTokens(); return Promise.reject(); }); } return Promise.resolve(); }, checkAuth: () => { const token = getAccessToken(); return token ? Promise.resolve() : Promise.reject(); }, getIdentity: () => Promise.resolve({ id: 'me', fullName: 'Authenticated User' }), getPermissions: () => Promise.resolve(''), refreshAccessToken: async () => { const refresh = getRefreshToken(); if (!refresh) return Promise.reject(); const resp = await fetch(`${apiBase}/token/refresh/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh }) }); if (!resp.ok) { clearTokens(); return Promise.reject(); } const data = await resp.json(); if (data.access) setAccessToken(data.access); return Promise.resolve(); }, };
export const withAuthHeaders = (fetchJson) => async (url, options = {}) => { const opts = { ...options }; const headers = new Headers(opts.headers || { 'Content-Type': 'application/json' }); const token = getAccessToken(); if (token) headers.set('Authorization', `Bearer ${token}`); opts.headers = headers; return fetchJson(url, opts); };
