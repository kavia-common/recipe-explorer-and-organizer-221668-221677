import React, { useMemo } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Browse from './pages/Browse';
import Search from './pages/Search';
import RecipeDetail from './pages/RecipeDetail';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

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

// PUBLIC_INTERFACE
function App() {
  const apiBase = useMemo(() => getApiBaseUrl(), []);

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('API Base URL:', apiBase);
  }

  return (
    <Routes>
      <Route element={<LayoutShell />}>
        <Route index element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/search" element={<Search />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
