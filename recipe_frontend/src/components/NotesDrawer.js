import React from 'react';
import './recipe.css';

/**
 * NotesDrawer shows a right-side drawer with notes content.
 */
export default function NotesDrawer({ open, onClose, children, title = 'Notes' }) {
  return (
    <>
      {open && (
        <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`notes-drawer ${open ? 'open' : ''}`}
        role="complementary"
        aria-label="Notes Drawer"
      >
        <div className="notes-drawer__header">
          <h3>{title}</h3>
          <button className="drawer-close" onClick={onClose} aria-label="Close notes">✕</button>
        </div>
        <div className="notes-drawer__content">{children}</div>
      </aside>
    </>
  );
}
