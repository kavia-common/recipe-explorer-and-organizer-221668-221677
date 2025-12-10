import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';

/**
 * Register page allows new users to sign up (shell).
 */
export default function Register() {
  const navigate = useNavigate();
  const { showToast } = useUI();
  const { setToken, fetchCurrentUser } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiRegister(form);
      if (res?.token) setToken(res.token);
      await fetchCurrentUser();
      showToast('Account created', { type: 'success' });
      navigate('/profile', { replace: true });
    } catch (e) {
      showToast('Registration failed', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h2>Create an account</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Name</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(17,24,39,0.12)' }}
          />
        </label>
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
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
