import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './layout.css';
import { useAuth } from '../contexts/AuthContext';

/**
 * NavBar renders the top navigation bar with brand and key links.
 */
export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <Link to="/" className="nav__brand-link" aria-label="Recipe Explorer Home">
          <span className="brand__dot" />
          <span className="brand__title">Recipe Explorer</span>
        </Link>
      </div>

      <nav className="navbar__links" aria-label="Primary">
        <NavLink to="/" end className="nav__link">Home</NavLink>
        <NavLink to="/browse" className="nav__link">Browse</NavLink>
        <NavLink to="/search" className="nav__link">Search</NavLink>
        <NavLink to="/favorites" className="nav__link">Favorites</NavLink>

        {isAuthenticated ? (
          <>
            <NavLink to="/profile" className="nav__link">
              {user?.name ? `Hi, ${user.name}` : 'Profile'}
            </NavLink>
            <button
              className="nav__link btn-link"
              onClick={logout}
              title="Logout"
              aria-label="Logout"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="nav__link">Login</NavLink>
            <NavLink to="/register" className="nav__link">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
