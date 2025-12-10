import React from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';
import './recipe.css';

/**
 * RecipeCard shows a compact card with title, image and favorite action.
 */
export default function RecipeCard({ recipe }) {
  const { id, title, image, summary } = recipe || {};
  return (
    <div className="recipe-card card">
      <div className="recipe-card__media">
        <Link to={`/recipe/${id}`}>
          <img
            src={image || 'https://via.placeholder.com/640x360?text=Recipe'}
            alt={title || 'Recipe'}
            className="recipe-card__img"
          />
        </Link>
        <div className="recipe-card__fav">
          <FavoriteButton recipeId={id} />
        </div>
      </div>
      <div className="recipe-card__body">
        <h4 className="recipe-card__title">
          <Link to={`/recipe/${id}`}>{title || 'Untitled Recipe'}</Link>
        </h4>
        {summary ? (
          <p className="recipe-card__summary">{summary}</p>
        ) : (
          <p className="recipe-card__summary muted">No description available.</p>
        )}
      </div>
    </div>
  );
}
