import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';

/**
 * Login page lets users authenticate (shell).
 */
export default function Login() {
  const { login, loading } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await login(form);
      showToast('Logged in successfully', { type: 'success' });
      navigate(from, { replace: true });
    } catch (err) {
      showToast('Invalid credentials', { type: 'error' });
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(17,24,39,0.12)' }}
          />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Password</span>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(17,24,39,0.12)' }}
          />
        </label>
        <button className="nav__link" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
