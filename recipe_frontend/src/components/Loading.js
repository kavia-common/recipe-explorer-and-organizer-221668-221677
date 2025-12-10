import React from 'react';

/**
 * Loading indicator component for consistent UX.
 * Variants: 'inline' (text only) and 'card' (styled container).
 */
export default function Loading({ label = 'Loading...', variant = 'card', 'aria-live': ariaLive = 'polite' }) {
  const content = (
    <div role="status" aria-live={ariaLive} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        aria-hidden="true"
        style={{
          width: 14,
          height: 14,
          border: '2px solid rgba(17,24,39,0.25)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin .9s linear infinite',
        }}
      />
      <span>{label}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (variant === 'inline') return content;

  return (
    <div className="card" role="status" aria-live={ariaLive}>
      {content}
    </div>
  );
}
