import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Minimal UI context to control:
 * - toasts: queue and render via a simple portal-like root
 * - modals: simple single-modal state (title, content, open/close) with a11y (focus trap, ESC close)
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
  item.setAttribute('role', 'status');
  item.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
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

  // Expose a minimal global hook for non-React modules (e.g., Axios client)
  if (typeof window !== 'undefined') {
    window.__UI_TOAST__ = showToast;
  }

  const value = useMemo(() => ({
    showToast,
    modal,
    openModal,
    closeModal,
  }), [showToast, modal, openModal, closeModal]);

  // Modal a11y: focus trap and ESC close with focus restoration
  const modalPanelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!modal.open) return;

    // Save previously focused element
    previouslyFocusedRef.current = document.activeElement;

    const panel = modalPanelRef.current;
    if (!panel) return;

    // Focus first focusable or panel
    const focusFirst = () => {
      const focusable = panel.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) {
        focusable.focus();
      } else {
        panel.focus();
      }
    };
    setTimeout(focusFirst, 0);

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      } else if (e.key === 'Tab') {
        const focusables = Array.from(
          panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        ).filter(el => !el.hasAttribute('disabled'));
        if (!focusables.length) {
          e.preventDefault();
          panel.focus();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first || document.activeElement === panel) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      // Restore focus
      previouslyFocusedRef.current?.focus?.();
    };
  }, [modal.open, closeModal]);

  return (
    <UIContext.Provider value={value}>
      {children}
      {modal.open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={modal.title || 'Dialog'}
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
            ref={modalPanelRef}
            className="card"
            style={{ maxWidth: 560, width: '90%', padding: 20 }}
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 id="modal-title" style={{ margin: 0 }}>{modal.title}</h3>
              <button
                type="button"
                onClick={closeModal}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <div role="document" aria-describedby="modal-body">
              <div id="modal-body">{modal.content}</div>
            </div>
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
