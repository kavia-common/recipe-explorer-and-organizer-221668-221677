import React, { useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { addFavorite, removeFavorite } from '../api/recipes';
import './recipe.css';

/**
 * FavoriteButton toggles favorite state for a recipe.
 * This shell assumes a boolean active state and calls API endpoints.
 */
export default function FavoriteButton({ recipeId, initial = false }) {
  const [active, setActive] = useState(initial);
  const { isAuthenticated } = useAuth();
  const { showToast } = useUI();

  const toggle = useCallback(async () => {
    if (!isAuthenticated) {
      showToast('Please login to save favorites.', { type: 'info' });
      return;
    }
    try {
      if (active) {
        await removeFavorite(recipeId);
        setActive(false);
        showToast('Removed from favorites', { type: 'success' });
      } else {
        await addFavorite(recipeId);
        setActive(true);
        showToast('Added to favorites', { type: 'success' });
      }
    } catch (e) {
      showToast('Failed to update favorites', { type: 'error' });
    }
  }, [active, isAuthenticated, recipeId, showToast]);

  return (
    <button
      className={`fav-btn ${active ? 'is-active' : ''}`}
      aria-pressed={active}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
      onClick={toggle}
    >
      {active ? '★' : '☆'}
    </button>
  );
}
