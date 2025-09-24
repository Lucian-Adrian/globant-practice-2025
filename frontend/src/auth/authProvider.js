// Moved from src/authProvider.js
// Minimal JWT authProvider for react-admin
const ACCESS_KEY = 'ds_access_token';
const REFRESH_KEY = 'ds_refresh_token';

export function setAccessToken(token) { localStorage.setItem(ACCESS_KEY, token); }
export function getAccessToken() { return localStorage.getItem(ACCESS_KEY); }
export function setRefreshToken(token) { localStorage.setItem(REFRESH_KEY, token); }
export function getRefreshToken() { return localStorage.getItem(REFRESH_KEY); }
export function clearTokens() { localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY); }

export const authProvider = {
  login: async ({ username, password }) => {
    const payload = { username: username?.trim(), password };
    const start = Date.now();
    let resp, data;
    try {
      resp = await fetch('/api/auth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      data = await resp.json().catch(() => ({}));
    } catch (e) {
      console.error('Auth network error', e);
      throw new Error('Network error');
    }
    if (!resp.ok || !data?.access) {
      console.warn('Auth failed', resp?.status, data);
      throw new Error(data?.detail || data?.error || 'Invalid credentials');
    }
    setAccessToken(data.access);
    if (data.refresh) setRefreshToken(data.refresh);
    // Clear student token when logging in as admin
    localStorage.removeItem('student_access_token');
    console.info('Auth success in', Date.now() - start, 'ms');
  },
  logout: async () => { clearTokens(); },
  checkAuth: () => {
    const token = getAccessToken();
    if (!token) return Promise.reject();
    
    // Check if there's a student token, which should not access admin
    const studentToken = localStorage.getItem('student_access_token');
    if (studentToken) {
      clearTokens();
      return Promise.reject();
    }
    
    // Decode token to check if it's an admin token (not a student token)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.student_id) {
        // This is a student token, reject for admin routes
        clearTokens();
        return Promise.reject();
      }
    } catch (e) {
      // Invalid token format
      clearTokens();
      return Promise.reject();
    }
    
    return Promise.resolve();
  },
  checkError: (error) => {
    if (error?.status === 401 || error?.status === 403) {
      clearTokens();
      return Promise.reject();
    }
    return Promise.resolve();
  },
  getPermissions: () => Promise.resolve(),
  refreshAccessToken: async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error('No refresh token');
    const resp = await fetch('/api/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data.access) throw new Error('Refresh failed');
    setAccessToken(data.access);
    return data.access;
  },
};

// Deprecated: kept for backward compatibility of older components (e.g. custom list actions)
// Prefer using httpClient/rawFetch from src/api/httpClient
export function withAuthHeaders(fn) {
  return (url, options = {}) => {
    const token = getAccessToken();
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    return fn(url, { ...options, headers });
  };
}

// withAuthHeaders no longer needed; httpClient handles token injection centrally.
