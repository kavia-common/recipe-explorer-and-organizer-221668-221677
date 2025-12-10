import React from 'react';
import RecipeCard from './RecipeCard';
import './recipe.css';

/**
 * RecipeGrid renders a list of recipes in a responsive grid.
 */
export default function RecipeGrid({ recipes = [] }) {
  if (!recipes?.length) {
    return <div className="card">No recipes found.</div>;
  }

  return (
    <div className="recipe-grid">
      {recipes.map((r) => (
        <RecipeCard key={r.id || r.slug || r.title} recipe={r} />
      ))}
    </div>
  );
}
