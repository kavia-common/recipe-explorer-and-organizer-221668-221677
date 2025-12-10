import axios from 'axios';

/**
 * API Client initialization
 * - baseURL from environment variables: REACT_APP_API_BASE, fallback to REACT_APP_BACKEND_URL
 * - Attaches Authorization header when token is available via setter
 * - Centralizes error handling and surfaces as toasts (basic DOM-based toasts to avoid extra deps)
 */

// Resolve API base URL
const baseURL =
  (process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '');

// Simple in-file token store (to be set from AuthContext/provider)
let authToken = null;

// PUBLIC_INTERFACE
export function setAuthToken(token) {
  /** Set the bearer token to be used on all subsequent requests. Pass null/undefined to clear. */
  authToken = token || null;
}

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Return the resolved API base URL. */
  return baseURL;
}

/**
 * Lightweight toast system without external dependencies
 */
function ensureToastContainer() {
  let el = document.getElementById('toast-root');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast-root';
    el.style.position = 'fixed';
    el.style.top = '16px';
    el.style.right = '16px';
    el.style.zIndex = '9999';
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.gap = '8px';
    document.body.appendChild(el);
  }
  return el;
}

function showToast(message, type = 'error', timeout = 3500) {
  try {
    // Prefer UIContext if present on window (exposed by provider)
    const uiToast = window.__UI_TOAST__;
    if (typeof uiToast === 'function') {
      uiToast(message, { type, timeout });
      return;
    }
    // Fallback: direct DOM toasts
    const root = ensureToastContainer();
    const item = document.createElement('div');
    item.textContent = message;
    item.setAttribute('role', 'status');
    item.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    item.style.padding = '10px 12px';
    item.style.borderRadius = '8px';
    item.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    item.style.color = '#111827';
    item.style.background = type === 'error' ? '#fde2e2' : '#e0f2fe';
    item.style.border = `1px solid ${type === 'error' ? '#fca5a5' : '#93c5fd'}`;
    root.appendChild(item);
    setTimeout(() => {
      try {
        root.removeChild(item);
      } catch (_) {
        // ignore
      }
    }, timeout);
  } catch (_) {
    // no-op if DOM not ready
  }
}

// Create Axios instance
const api = axios.create({
  baseURL,
  withCredentials: true, // allow cookies if backend uses them
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    // Request config error
    showToast('Network request setup failed', 'error');
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.error ||
      error?.message ||
      (status ? `Request failed with status ${status}` : 'Request failed');

    // Show toast for errors
    if (status >= 500) {
      showToast('Server error. Please try again later.', 'error');
    } else if (status === 401) {
      showToast('You are not authorized. Please login again.', 'error');
    } else if (status === 403) {
      showToast('You do not have permission to perform this action.', 'error');
    } else {
      showToast(message, 'error');
    }

    return Promise.reject(error);
  }
);

export default api;
