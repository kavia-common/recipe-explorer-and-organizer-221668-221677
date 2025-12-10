import React, { useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { addUserFavorite, removeUserFavorite } from '../api/userFavorites';
import './recipe.css';

/**
 * FavoriteButton toggles favorite state for a recipe.
 * Optimistic UI: immediately toggles state and reverts if server fails.
 */
export default function FavoriteButton({ recipeId, initial = false, onChange }) {
  const [active, setActive] = useState(initial);
  const [pending, setPending] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showToast } = useUI();

  const toggle = useCallback(async () => {
    if (!isAuthenticated) {
      showToast('Please login to save favorites.', { type: 'info' });
      return;
    }
    if (pending) return;
    const previous = active;
    const next = !active;

    // optimistic update
    setActive(next);
    setPending(true);
    onChange?.(next);

    try {
      if (next) {
        await addUserFavorite(recipeId);
        showToast('Added to favorites', { type: 'success' });
      } else {
        await removeUserFavorite(recipeId);
        showToast('Removed from favorites', { type: 'success' });
      }
    } catch (e) {
      // revert on failure
      setActive(previous);
      onChange?.(previous);
      showToast('Failed to update favorites', { type: 'error' });
    } finally {
      setPending(false);
    }
  }, [active, isAuthenticated, recipeId, showToast, pending, onChange]);

  return (
    <button
      type="button"
      className={`fav-btn ${active ? 'is-active' : ''}`}
      aria-pressed={active}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
      onClick={toggle}
      disabled={pending}
    >
      {active ? '★' : '☆'}
    </button>
  );
}
