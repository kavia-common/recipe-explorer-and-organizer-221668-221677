import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import FavoriteButton from '../components/FavoriteButton';
import NotesDrawer from '../components/NotesDrawer';
import { getRecipeById } from '../api/recipes';
import { useUI } from '../contexts/UIContext';

/**
 * RecipeDetail page loads a single recipe from /recipes/:id, shows details,
 * and provides a FavoriteButton with initial state.
 */
export default function RecipeDetail() {
  const { id } = useParams();
  const { showToast } = useUI();
  const [notesOpen, setNotesOpen] = useState(false);

  const [recipe, setRecipe] = useState(null);
  const [initialFav, setInitialFav] = useState(false);
  const [loading, setLoading] = useState(false);

  const recipeId = useMemo(() => id, [id]);

  const loadRecipe = useCallback(async () => {
    if (!recipeId) return;
    setLoading(true);
    try {
      const data = await getRecipeById(recipeId);
      // Normalize response structure
      const normalized = {
        id: data?.id || data?._id || recipeId,
        title: data?.title || data?.name || `Recipe ${recipeId}`,
        image: data?.image || data?.cover || 'https://via.placeholder.com/800x420?text=Recipe+Detail',
        summary: data?.summary || data?.description || 'No description available.',
        isFavorite: Boolean(data?.isFavorite),
      };
      setRecipe(normalized);
      setInitialFav(Boolean(normalized.isFavorite));
    } catch (e) {
      showToast('Failed to load recipe', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [recipeId, showToast]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  if (loading && !recipe) {
    return <div className="card">Loading recipe...</div>;
  }

  if (!loading && !recipe) {
    return <div className="card">Recipe not found.</div>;
  }

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <img
            src={recipe.image}
            alt={recipe.title}
            style={{ width: 360, height: 220, objectFit: 'cover', borderRadius: 8 }}
          />
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0 }}>{recipe.title}</h2>
              <FavoriteButton
                recipeId={recipe.id}
                initial={initialFav}
                onChange={(val) => setInitialFav(Boolean(val))}
              />
            </div>
            <p style={{ color: 'var(--color-secondary)' }}>{recipe.summary}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="nav__link" onClick={() => setNotesOpen(true)}>Open Notes</button>
            </div>
          </div>
        </div>
      </div>

      <NotesDrawer open={notesOpen} onClose={() => setNotesOpen(false)}>
        <p>This is a placeholder for notes related to the recipe.</p>
        <textarea
          rows={6}
          style={{ width: '100%', borderRadius: 6, border: '1px solid rgba(17,24,39,0.12)', padding: 8 }}
          placeholder="Write your note..."
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
          <button className="nav__link" onClick={() => setNotesOpen(false)}>Cancel</button>
          <button className="nav__link">Save</button>
        </div>
      </NotesDrawer>
    </>
  );
}
