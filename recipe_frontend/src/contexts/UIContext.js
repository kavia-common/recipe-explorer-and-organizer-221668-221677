import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Minimal UI context to control:
 * - toasts: queue and render via a simple portal-like root
 * - modals: simple single-modal state (title, content, open/close)
 *
 * This avoids extra UI libs while providing a unified interface.
 */

const UIContext = createContext(null);

let toastContainerEl = null;
function ensureToastContainer() {
  if (typeof document === 'undefined') return null;
  if (toastContainerEl && document.body.contains(toastContainerEl)) return toastContainerEl;
  const el = document.createElement('div');
  el.id = 'toast-root';
  el.style.position = 'fixed';
  el.style.top = '16px';
  el.style.right = '16px';
  el.style.zIndex = '9999';
  el.style.display = 'flex';
  el.style.flexDirection = 'column';
  el.style.gap = '8px';
  document.body.appendChild(el);
  toastContainerEl = el;
  return el;
}

function createToastElement(message, type = 'info') {
  const item = document.createElement('div');
  item.textContent = message;
  item.style.padding = '10px 12px';
  item.style.borderRadius = '8px';
  item.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  item.style.color = '#111827';
  item.style.background = type === 'error' ? '#fde2e2' : type === 'success' ? '#dcfce7' : '#e0f2fe';
  item.style.border = `1px solid ${type === 'error' ? '#fca5a5' : type === 'success' ? '#86efac' : '#93c5fd'}`;
  return item;
}

// PUBLIC_INTERFACE
export function UIProvider({ children }) {
  /** Provides UI helpers for showing toasts and controlling a basic modal. */
  const [modal, setModal] = useState({ open: false, title: '', content: null });

  const showToast = useCallback((message, options = {}) => {
    const { type = 'info', timeout = 3500 } = options;
    try {
      const root = ensureToastContainer();
      if (!root) return;
      const el = createToastElement(message, type);
      root.appendChild(el);
      window.setTimeout(() => {
        try {
          root.removeChild(el);
        } catch {
          // ignore
        }
      }, timeout);
    } catch {
      // ignore DOM errors
    }
  }, []);

  const openModal = useCallback((title, content) => {
    setModal({ open: true, title, content });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ open: false, title: '', content: null });
  }, []);

  const value = useMemo(() => ({
    showToast,
    modal,
    openModal,
    closeModal,
  }), [showToast, modal, openModal, closeModal]);

  return (
    <UIContext.Provider value={value}>
      {children}
      {/* Simple modal markup */}
      {modal.open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9998
          }}
          onClick={closeModal}
        >
          <div
            className="card"
            style={{ maxWidth: 560, width: '90%', padding: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>{modal.title}</h3>
              <button onClick={closeModal} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                ✕
              </button>
            </div>
            <div>{modal.content}</div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useUI() {
  /** Access UI helpers: showToast, modal state, openModal, closeModal. */
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return ctx;
}

export default UIContext;
