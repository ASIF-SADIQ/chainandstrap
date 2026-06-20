import React, { useState, useEffect } from 'react';

const API = 'http://137.184.102.82:5000/api';

export default function AdminAuth({ children }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('cs_admin_token');
    const user = JSON.parse(localStorage.getItem('cs_admin_user') || 'null');
    if (token && user?.role === 'admin') {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      if (data.user.role !== 'admin') throw new Error('Access denied. Admin accounts only.');
      localStorage.setItem('cs_admin_token', data.token);
      localStorage.setItem('cs_admin_user', JSON.stringify(data.user));
      setAuthed(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cs_admin_token');
    localStorage.removeItem('cs_admin_user');
    setAuthed(false);
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #c9a96e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
        <div style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ color: '#c9a96e', fontSize: 22, letterSpacing: '0.5em', fontWeight: 400, margin: '0 0 8px 0', textTransform: 'uppercase' }}>Chain & Straps</h1>
            <p style={{ color: '#555', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', margin: 0 }}>Admin Portal</p>
            <div style={{ height: 1, background: 'linear-gradient(to right, transparent, #c9a96e, transparent)', margin: '20px 0 0 0' }} />
          </div>

          <div style={{ background: '#111', border: '1px solid #222', padding: 32 }}>
            <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 400, margin: '0 0 6px 0' }}>Sign In</h2>
            <p style={{ color: '#555', fontSize: 12, margin: '0 0 24px 0' }}>Restricted to authorized administrators only.</p>

            {error && (
              <div style={{ background: '#1a0000', border: '1px solid #3d0000', color: '#ff6b6b', padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: '#888', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Email</label>
                <input
                  type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@chainandstrap.store"
                  style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', color: '#fff', padding: '12px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#c9a96e'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ color: '#888', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Password</label>
                <input
                  type="password" required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', color: '#fff', padding: '12px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#c9a96e'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', background: '#c9a96e', color: '#0d0d0d', border: 'none', padding: '14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'SIGNING IN...' : 'ACCESS DASHBOARD'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', color: '#333', fontSize: 11, marginTop: 24 }}>
            🔒 All access attempts are logged.
          </p>
        </div>
      </div>
    );
  }

  // Logged in — render dashboard with logout button injected via context
  return (
    <div>
      {/* Logout bar */}
      <div style={{ background: '#0d0d0d', borderBottom: '1px solid #1e1e1e', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#c9a96e', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          ✓ Admin: {JSON.parse(localStorage.getItem('cs_admin_user') || '{}')?.name}
        </span>
        <button onClick={handleLogout}
          style={{ background: 'transparent', border: '1px solid #333', color: '#888', padding: '6px 16px', fontSize: 11, cursor: 'pointer', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Logout
        </button>
      </div>
      {children}
    </div>
  );
}
