import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './layout.css';
import { listCategories as apiListCategories } from '../api/categories';
import { useUI } from '../contexts/UIContext';

/**
 * Sidebar displays category links and a placeholder for filters.
 * - Fetches categories dynamically from API (/categories)
 * - Highlights active category from URL (?category=...)
 * - Persists selection by updating URL query params
 */
export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useUI();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const activeCategory = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get('category') || '';
  }, [location.search]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await apiListCategories();
        if (!mounted) return;
        // normalize to array of { id|slug|name } strings
        let items = [];
        if (Array.isArray(data)) {
          items = data.map((c) => {
            if (typeof c === 'string') return c;
            // eslint-disable-next-line no-nested-ternary
            return c?.slug || c?.name || c?.id || '';
          }).filter(Boolean);
        }
        setCategories(items);
      } catch (e) {
        showToast('Failed to load categories', { type: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [showToast]);

  function onSelect(cat) {
    const sp = new URLSearchParams(location.search);
    if (cat) {
      sp.set('category', cat);
    } else {
      sp.delete('category');
    }
    // Reset pagination when category changes
    sp.delete('page');
    navigate({ pathname: '/browse', search: `?${sp.toString()}` });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__section">
        <h3 className="sidebar__title">Categories</h3>
        {loading ? (
          <div className="sidebar__list">
            <div style={{ padding: '6px 10px', color: 'var(--color-secondary)' }}>Loading...</div>
          </div>
        ) : categories.length ? (
          <ul className="sidebar__list">
            <li>
              <Link
                to="/browse"
                className={!activeCategory ? 'is-active' : undefined}
                aria-current={!activeCategory ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onSelect('');
                }}
              >
                All
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c}>
                <Link
                  to={`/browse?category=${encodeURIComponent(c)}`}
                  className={activeCategory === c ? 'is-active' : undefined}
                  aria-current={activeCategory === c ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(c);
                  }}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="sidebar__list">
            <div style={{ padding: '6px 10px', color: 'var(--color-secondary)' }}>No categories</div>
          </div>
        )}
      </div>

      <div className="sidebar__section" style={{ marginTop: 16 }}>
        <h3 className="sidebar__title">Quick Links</h3>
        <ul className="sidebar__list">
          <li><Link to="/search?q=chicken">Chicken</Link></li>
          <li><Link to="/search?q=pasta">Pasta</Link></li>
          <li><Link to="/search?q=salad">Salad</Link></li>
        </ul>
      </div>
    </aside>
  );
}
