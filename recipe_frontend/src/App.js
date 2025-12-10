import React, { useMemo } from 'react';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import './App.css';

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /**
   * Determine the API base URL for backend requests.
   * Priority:
   * 1) process.env.REACT_APP_API_BASE
   * 2) process.env.REACT_APP_BACKEND_URL
   */
  const base = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || '';
  return base.replace(/\/+$/, '');
}

/**
 * Simple top navigation bar placeholder.
 */
function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <span className="brand__dot" />
        <span className="brand__title">Recipe Explorer</span>
      </div>
      <nav className="navbar__links">
        <Link to="/" className="nav__link">Home</Link>
        <Link to="/recipes" className="nav__link">Recipes</Link>
        <Link to="/favorites" className="nav__link">Favorites</Link>
      </nav>
    </header>
  );
}

/**
 * Simple sidebar placeholder for categories/filters.
 */
function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__section">
        <h3 className="sidebar__title">Categories</h3>
        <ul className="sidebar__list">
          <li><Link to="/recipes?cat=breakfast">Breakfast</Link></li>
          <li><Link to="/recipes?cat=lunch">Lunch</Link></li>
          <li><Link to="/recipes?cat=dinner">Dinner</Link></li>
          <li><Link to="/recipes?cat=dessert">Dessert</Link></li>
        </ul>
      </div>
    </aside>
  );
}

/**
 * Base layout shell: Top Nav + Sidebar + Main content area.
 */
function LayoutShell() {
  return (
    <div className="layout">
      <NavBar />
      <div className="layout__body">
        <Sidebar />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* Placeholder route components */
function Home() {
  return <div className="card">Welcome to Recipe Explorer. Start by browsing recipes.</div>;
}
function Recipes() {
  return <div className="card">Recipes list goes here.</div>;
}
function Favorites() {
  return <div className="card">Your favorite recipes will appear here.</div>;
}

// PUBLIC_INTERFACE
function App() {
  const apiBase = useMemo(() => getApiBaseUrl(), []);

  // expose for debugging in dev
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('API Base URL:', apiBase);
  }

  return (
    <Routes>
      <Route element={<LayoutShell />}>
        <Route index element={<Home />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="favorites" element={<Favorites />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
