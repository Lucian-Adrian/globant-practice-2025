// JWT test console moved to legacy utilities
import React, { useEffect, useMemo, useState } from 'react';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from './auth/authProvider';
const Panel = ({ title, children }) => (<fieldset style={{ border:'1px solid #ccc', padding:12, borderRadius:8 }}><legend style={{ fontWeight:600 }}>{title}</legend>{children}</fieldset>);
const Row = ({ label, children }) => (<label style={{ display:'grid', gridTemplateColumns:'160px 1fr', alignItems:'center', gap:8, marginBottom:8 }}><span style={{ opacity:0.8 }}>{label}</span><span>{children}</span></label>);
const CodeBox = ({ value }) => (<pre style={{ background:'#111', color:'#0f0', padding:8, borderRadius:6, maxHeight:150, overflow:'auto' }}>{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</pre>);
const api = {
  signup: async (username, password, email) => { const r = await fetch('/api/auth/test/signup/', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ username, password, email }) }); const j = await r.json().catch(()=>({})); return { ok:r.ok, status:r.status, body:j }; },
  checkUsername: async (username) => { const r = await fetch(`/api/auth/test/check-username/?username=${encodeURIComponent(username)}`); const j = await r.json().catch(()=>({})); return { ok:r.ok, status:r.status, body:j }; },
  login: async (username, password) => { const r = await fetch('/api/auth/token/', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ username, password }) }); const j = await r.json().catch(()=>({})); return { ok:r.ok, status:r.status, body:j }; },
  studentLogin: async (email, password) => { const r = await fetch('/api/auth/student/login/', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ email, password }) }); const j = await r.json().catch(()=>({})); return { ok:r.ok, status:r.status, body:j }; },
  me: async () => { const token = getAccessToken(); const r = await fetch('/api/auth/me/', { headers: token?{ Authorization:`Bearer ${token}` }:{} }); const j = await r.json().catch(()=>({})); return { ok:r.ok, status:r.status, body:j }; },
  studentMe: async () => { const token = getAccessToken(); const r = await fetch('/api/auth/student/me/', { headers: token?{ Authorization:`Bearer ${token}` }:{} }); const j = await r.json().catch(()=>({})); return { ok:r.ok, status:r.status, body:j }; },
  studentDashboard: async () => { const token = getAccessToken(); const r = await fetch('/api/student/dashboard/', { headers: token?{ Authorization:`Bearer ${token}` }:{} }); const j = await r.json().catch(()=>({})); return { ok:r.ok, status:r.status, body:j }; },
  refresh: async () => { const refresh = getRefreshToken(); const r = await fetch('/api/auth/token/refresh/', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ refresh }) }); const j = await r.json().catch(()=>({})); return { ok:r.ok, status:r.status, body:j }; },
};
export default function TestJWT() {
  const [username, setUsername] = useState('testuser');
  const [password, setPassword] = useState('Test123!');
  const [email, setEmail] = useState('test@example.com');
  const [studentEmail, setStudentEmail] = useState('john@example.com');
  const [studentPassword, setStudentPassword] = useState('password123');
  const [logs, setLogs] = useState([]); const [me, setMe] = useState(null);
  const addLog = (entry) => setLogs(prev => [{ ts:new Date().toLocaleTimeString(), ...entry }, ...prev.slice(0,100)]);
  useEffect(()=>{(async()=>{ const r = await api.me(); setMe(r.ok?r.body:null); })();},[]);
  const handleCheck = async () => { const r = await api.checkUsername(username); addLog({ where:'check', status:r.status, body:r.body }); };
  const handleSignup = async () => { const r = await api.signup(username, password, email); addLog({ where:'signup', status:r.status, body:r.body }); };
  const handleLogin = async () => { const r = await api.login(username, password); addLog({ where:'login', status:r.status, body:r.body }); if(r.ok && r.body.access){ setAccessToken(r.body.access); if(r.body.refresh) setRefreshToken(r.body.refresh); const m = await api.me(); setMe(m.ok?m.body:null); addLog({ where:'me-after-login', status:m.status, body:m.body }); } };
  const handleStudentLogin = async () => { const r = await api.studentLogin(studentEmail, studentPassword); addLog({ where:'student-login', status:r.status, body:r.body }); if(r.ok && r.body.access){ setAccessToken(r.body.access); if(r.body.refresh) setRefreshToken(r.body.refresh); const m = await api.studentMe(); setMe(m.ok?m.body:null); addLog({ where:'student-me-after-login', status:m.status, body:m.body }); } };
  const handleStudentDashboard = async () => { const r = await api.studentDashboard(); addLog({ where:'student-dashboard', status:r.status, body:r.body }); };
  const handleRefresh = async () => { const r = await api.refresh(); addLog({ where:'refresh', status:r.status, body:r.body }); if(r.ok && r.body.access) setAccessToken(r.body.access); };
  const handleLogout = async () => { clearTokens(); const m = await api.me(); setMe(m.ok?m.body:null); addLog({ where:'logout', status:m.status, body:m.body }); };
  const handleClearStudentToken = () => { localStorage.removeItem('student_access_token'); addLog({ where:'clear-student-token', status:200, body:{ message:'Student token cleared' } }); };
  const tokens = useMemo(()=>({ access:getAccessToken(), refresh:getRefreshToken() }), [logs]);
  return (<div style={{ padding:16, fontFamily:'system-ui, sans-serif', display:'grid', gap:16 }}><h2>JWT Test Console</h2><div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(320px, 1fr))', gap:16 }}>
    <Panel title="1) Create new user (DEBUG only)"><Row label="Username"><input value={username} onChange={e=>setUsername(e.target.value)} /></Row><Row label="Password"><input value={password} type="password" onChange={e=>setPassword(e.target.value)} /></Row><Row label="Email"><input value={email} onChange={e=>setEmail(e.target.value)} /></Row><button onClick={handleSignup}>Create User</button></Panel>
    <Panel title="2) Check if user exists (DEBUG only)"><Row label="Username"><input value={username} onChange={e=>setUsername(e.target.value)} /></Row><button onClick={handleCheck}>Check</button></Panel>
    <Panel title="3) Login (Admin JWT)"><Row label="Username"><input value={username} onChange={e=>setUsername(e.target.value)} /></Row><Row label="Password"><input value={password} type="password" onChange={e=>setPassword(e.target.value)} /></Row><button onClick={handleLogin}>Login</button></Panel>
    <Panel title="4) Student Login"><Row label="Email"><input value={studentEmail} onChange={e=>setStudentEmail(e.target.value)} /></Row><Row label="Password"><input value={studentPassword} type="password" onChange={e=>setStudentPassword(e.target.value)} /></Row><button onClick={handleStudentLogin}>Student Login</button></Panel>
    <Panel title="5) View current user & tokens"><div>Current user (GET /api/auth/me/ or /api/auth/student/me/):</div><CodeBox value={me || { detail:'Not authenticated' }} /><div>Tokens (localStorage):</div><CodeBox value={tokens} /></Panel>
    <Panel title="6) Student Dashboard"><button onClick={handleStudentDashboard}>Get Dashboard</button></Panel>
    <Panel title="7) Refresh access token"><button onClick={handleRefresh}>Refresh</button></Panel>
    <Panel title="8) Logout (clear admin tokens)"><button onClick={handleLogout}>Logout</button></Panel>
    <Panel title="9) Clear student token"><button onClick={handleClearStudentToken}>Clear Student Token</button></Panel>
  </div><Panel title="Logs (latest first)"><CodeBox value={logs} /></Panel></div>);
}
