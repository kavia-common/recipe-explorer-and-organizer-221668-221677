import React from 'react';
import './recipe.css';

/**
 * RecipeFilters is a small filter bar shell to refine results.
 */
export default function RecipeFilters({ value = {}, onChange }) {
  const { category = '', ingredients = '', q = '' } = value;

  const update = (patch) => {
    onChange?.({ ...value, ...patch });
  };

  return (
    <div className="card recipe-filters">
      <div className="filters-row">
        <label className="filters-item">
          <span className="filters-label">Search</span>
          <input
            type="text"
            placeholder="Search recipes..."
            value={q}
            onChange={(e) => update({ q: e.target.value })}
          />
        </label>
        <label className="filters-item">
          <span className="filters-label">Category</span>
          <select value={category} onChange={(e) => update({ category: e.target.value })}>
            <option value="">All</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="dessert">Dessert</option>
          </select>
        </label>
        <label className="filters-item">
          <span className="filters-label">Ingredients</span>
          <input
            type="text"
            placeholder="e.g. chicken, tomato"
            value={ingredients}
            onChange={(e) => update({ ingredients: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}
