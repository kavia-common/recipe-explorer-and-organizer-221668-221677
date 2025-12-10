import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Profile page shows basic user information (shell).
 */
export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <h2>Your Profile</h2>
      {user ? (
        <div style={{ display: 'grid', gap: 8 }}>
          <div><strong>Name:</strong> {user.name || '—'}</div>
          <div><strong>Email:</strong> {user.email || '—'}</div>
          <div><strong>ID:</strong> {user.id || '—'}</div>
        </div>
      ) : (
        <p>No user data loaded.</p>
      )}
    </div>
  );
}
