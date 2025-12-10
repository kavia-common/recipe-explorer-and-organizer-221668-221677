import React from 'react';

/**
 * Toast placeholder component.
 * Most toasts are shown via UIContext DOM portal; this is here for future inline usage.
 */
export default function Toast({ message, type = 'info' }) {
  const bg =
    type === 'error' ? '#fde2e2' : type === 'success' ? '#dcfce7' : '#e0f2fe';
  const border =
    type === 'error' ? '#fca5a5' : type === 'success' ? '#86efac' : '#93c5fd';

  return (
    <div style={{
      padding: '10px 12px',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      color: '#111827',
      background: bg,
      border: `1px solid ${border}`,
      marginBottom: 8
    }}>
      {message}
    </div>
  );
}
