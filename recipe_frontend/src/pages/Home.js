import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Home page shows a simple welcome and primary actions.
 */
export default function Home() {
  return (
    <div className="card">
      <h2>Welcome to Recipe Explorer</h2>
      <p>Browse, search, and save your favorite recipes. Add your own notes to keep track of tweaks and ideas.</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <Link className="nav__link" to="/browse">Browse</Link>
        <Link className="nav__link" to="/search">Search</Link>
        <Link className="nav__link" to="/favorites">Favorites</Link>
      </div>
    </div>
  );
}
