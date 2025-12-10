import React from 'react';
import { Link } from 'react-router-dom';
import './layout.css';

/**
 * Sidebar displays category links and a placeholder for filters.
 */
export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__section">
        <h3 className="sidebar__title">Categories</h3>
        <ul className="sidebar__list">
          <li><Link to="/browse?category=breakfast">Breakfast</Link></li>
          <li><Link to="/browse?category=lunch">Lunch</Link></li>
          <li><Link to="/browse?category=dinner">Dinner</Link></li>
          <li><Link to="/browse?category=dessert">Dessert</Link></li>
        </ul>
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
