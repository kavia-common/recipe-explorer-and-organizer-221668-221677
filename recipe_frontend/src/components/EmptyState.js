import React from 'react';

/**
 * Empty state component for consistent presentation and a11y.
 */
export default function EmptyState({ title = 'Nothing here', description = '', actions = null }) {
  return (
    <div className="card" role="region" aria-label="Empty state">
      <div style={{ display: 'grid', gap: 8 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {description ? (
          <p style={{ margin: 0, color: 'var(--color-secondary)' }}>{description}</p>
        ) : null}
        {actions ? <div style={{ marginTop: 8 }}>{actions}</div> : null}
      </div>
    </div>
  );
}
