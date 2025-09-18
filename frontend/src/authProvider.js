// Minimal JWT authProvider for react-admin
// Stores tokens in localStorage and attaches Authorization header via custom httpClient.

export const TOKEN_KEY = 'jwt_access';
export const REFRESH_KEY = 'jwt_refresh';

const apiBase = '/api/auth';

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const setAccessToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export const setRefreshToken = (t) => localStorage.setItem(REFRESH_KEY, t);
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

export const authProvider = {
  // react-admin will call this when the user clicks on the login button
  login: async ({ username, password }) => {
    const resp = await fetch(`${apiBase}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      throw new Error(body.detail || body.message || 'Invalid credentials');
    }
    const data = await resp.json();
    if (data.access) setAccessToken(data.access);
    if (data.refresh) setRefreshToken(data.refresh);
    return Promise.resolve();
  },

  // react-admin will call this when the user clicks on the logout button
  logout: () => {
    clearTokens();
    return Promise.resolve();
  },

  // react-admin will call this when the API returns an error
  checkError: (error) => {
    const status = error?.status;
    if (status === 401 || status === 403) {
      // try to refresh once on 401; if fails, logout
      return authProvider.refreshAccessToken().catch(() => {
        clearTokens();
        return Promise.reject();
      });
    }
    return Promise.resolve();
  },

  // Require a token to access the admin. This makes RA show its Login page at /login.
  checkAuth: () => {
    const token = getAccessToken();
    return token ? Promise.resolve() : Promise.reject();
  },

  // react-admin will call this to get the user identity
  getIdentity: () => Promise.resolve({ id: 'me', fullName: 'Authenticated User' }),

  // react-admin will call this to get the user permissions
  getPermissions: () => Promise.resolve(''),

  refreshAccessToken: async () => {
    const refresh = getRefreshToken();
    if (!refresh) return Promise.reject();
    const resp = await fetch(`${apiBase}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!resp.ok) {
      clearTokens();
      return Promise.reject();
    }
    const data = await resp.json();
    if (data.access) setAccessToken(data.access);
    return Promise.resolve();
  },
};

// httpClient wrapper that attaches Authorization header if a token exists
export const withAuthHeaders = (fetchJson) => async (url, options = {}) => {
  const opts = { ...options };
  const headers = new Headers(opts.headers || { 'Content-Type': 'application/json' });
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  opts.headers = headers;

  const res = await fetchJson(url, opts);
  return res;
};
