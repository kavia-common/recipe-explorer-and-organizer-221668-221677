import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import FavoriteButton from '../components/FavoriteButton';
import NotesDrawer from '../components/NotesDrawer';

/**
 * RecipeDetail page shows a single recipe (shell).
 */
export default function RecipeDetail() {
  const { id } = useParams();
  const [notesOpen, setNotesOpen] = useState(false);

  const recipe = {
    id,
    title: `Recipe ${id}`,
    image: 'https://via.placeholder.com/800x420?text=Recipe+Detail',
    summary: 'This is a placeholder for the recipe summary and details.',
  };

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
              <FavoriteButton recipeId={recipe.id} />
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
