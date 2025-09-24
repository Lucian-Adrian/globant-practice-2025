// Legacy manual login component (react-admin provides built-in). Archived.
import React, { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { authProvider, getAccessToken } from '../auth/authProvider';

export default function Login() {
  const notify = useNotify();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const fetchMe = async () => {
    try {
      const token = getAccessToken();
      if (!token) { setUser(null); return; }
      const resp = await fetch('/api/auth/me/', { headers: { Authorization: `Bearer ${token}` } });
      if (!resp.ok) { setUser(null); return; }
      const data = await resp.json();
      setUser(data);
    } catch { setUser(null); }
  };
  useEffect(() => { fetchMe(); }, []);
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await authProvider.login({ username, password }); notify('Logged in'); await fetchMe(); } catch (err) { notify(err.message || 'Login failed', { type: 'warning' }); } finally { setLoading(false); }
  };
  const handleLogout = async () => { await authProvider.logout(); notify('Logged out'); setUser(null); };
  return (
    <div style={{ margin:'1rem', display:'flex', alignItems:'center', gap:8 }}>
      {user ? (<><span>Signed in as <strong>{user.username}</strong></span><button type="button" onClick={handleLogout}>Logout</button></>) : (
        <form onSubmit={handleSubmit} style={{ display:'flex', gap:8 }}>
          <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button type="submit" disabled={loading}>Login</button>
        </form>
      )}
    </div>
  );
}
