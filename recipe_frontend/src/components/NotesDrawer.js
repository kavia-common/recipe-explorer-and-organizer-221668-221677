import React, { useEffect, useRef, useCallback } from 'react';
import './recipe.css';

/**
 * NotesDrawer shows a right-side drawer with notes content.
 * - Focus trap when open
 * - Closes with Escape
 * - Returns focus to opener when closed if opener ref is provided
 */
export default function NotesDrawer({
  open,
  onClose,
  children,
  title = 'Notes',
  openerRef,
}) {
  const panelRef = useRef(null);

  // Trap focus inside the drawer when open
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusableSelectors = [
      'a[href]',
      'area[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'iframe',
      'object',
      'embed',
      '*[tabindex]:not([tabindex="-1"])',
      '*[contenteditable=true]'
    ];

    function getFocusable() {
      return Array.from(panel.querySelectorAll(focusableSelectors.join(','))).filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
      );
    }

    // set initial focus
    const toFocus = getFocusable()[0] || panel;
    window.setTimeout(() => toFocus?.focus(), 0);

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key === 'Tab') {
        const focusables = getFocusable();
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
    }

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open, onClose]);

  // Return focus to opener on close
  const lastOpen = useRef(open);
  useEffect(() => {
    if (lastOpen.current && !open && openerRef?.current) {
      openerRef.current.focus?.();
    }
    lastOpen.current = open;
  }, [open, openerRef]);

  const handleBackdropClick = useCallback(
    (e) => {
      e.stopPropagation();
      onClose?.();
    },
    [onClose]
  );

  return (
    <>
      {open && (
        <div
          className="drawer-backdrop"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}
      <aside
        ref={panelRef}
        className={`notes-drawer ${open ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notes-drawer-title"
        tabIndex={-1}
      >
        <div className="notes-drawer__header">
          <h3 id="notes-drawer-title" style={{ margin: 0 }}>{title}</h3>
          <button
            className="drawer-close"
            onClick={onClose}
            aria-label="Close notes"
          >
            ✕
          </button>
        </div>
        <div className="notes-drawer__content">{children}</div>
      </aside>
    </>
  );
}
