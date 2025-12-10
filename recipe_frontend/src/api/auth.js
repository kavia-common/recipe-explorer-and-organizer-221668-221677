import api, { setAuthToken } from './client';

/**
 * Authentication API
 * Assumed endpoints (adjust when backend spec is available):
 * - POST /auth/login        { email, password }
 * - POST /auth/register     { name?, email, password }
 * - POST /auth/refresh
 * - POST /auth/logout
 * - GET  /auth/me
 *
 * Responses are expected to include a token for login/register/refresh when using bearer tokens.
 */

// PUBLIC_INTERFACE
export async function login({ email, password }) {
  /** Login user with email/password. Returns user and token if provided by backend. */
  const { data } = await api.post('/auth/login', { email, password });
  if (data?.token) setAuthToken(data.token);
  return data;
}

// PUBLIC_INTERFACE
export async function register(payload) {
  /** Register a new user. Payload typically includes name, email, password. */
  const { data } = await api.post('/auth/register', payload);
  if (data?.token) setAuthToken(data.token);
  return data;
}

// PUBLIC_INTERFACE
export async function refresh() {
  /** Refresh auth session (cookie or bearer). Returns new token if backend issues one. */
  const { data } = await api.post('/auth/refresh');
  if (data?.token) setAuthToken(data.token);
  return data;
}

// PUBLIC_INTERFACE
export async function logout() {
  /** Logout the current user and clear token from client. */
  try {
    await api.post('/auth/logout');
  } finally {
    setAuthToken(null);
  }
}

// PUBLIC_INTERFACE
export async function currentUser() {
  /** Get current authenticated user profile. */
  const { data } = await api.get('/auth/me');
  return data;
}
