import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import FavoriteButton from '../components/FavoriteButton';
import NotesDrawer from '../components/NotesDrawer';
import {
  getRecipeById,
  listNotes as apiListNotes,
  createNote as apiCreateNote,
  updateNote as apiUpdateNote,
  deleteNote as apiDeleteNote,
} from '../api/recipes';
import { useUI } from '../contexts/UIContext';

/**
 * RecipeDetail page loads a single recipe from /recipes/:id, shows details,
 * a FavoriteButton, and a NotesDrawer with CRUD.
 */
export default function RecipeDetail() {
  const { id } = useParams();
  const { showToast } = useUI();
  const [notesOpen, setNotesOpen] = useState(false);

  const [recipe, setRecipe] = useState(null);
  const [initialFav, setInitialFav] = useState(false);
  const [loading, setLoading] = useState(false);

  // Notes state
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editorValue, setEditorValue] = useState('');

  const openNotesBtnRef = useRef(null);

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
        image:
          data?.image ||
          data?.cover ||
          'https://via.placeholder.com/800x420?text=Recipe+Detail',
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

  // Load notes
  const loadNotes = useCallback(async () => {
    if (!recipeId) return;
    setNotesLoading(true);
    setNotesError('');
    try {
      const data = await apiListNotes(recipeId);
      const list = Array.isArray(data) ? data : data?.items || [];
      // Normalize fields
      const normalized = list
        .map((n) => ({
          id: n?.id || n?._id || n?.noteId || n?.uuid,
          content: n?.content || n?.text || '',
          createdAt: n?.createdAt || n?.created_at || n?.created || null,
          updatedAt: n?.updatedAt || n?.updated_at || n?.updated || null,
        }))
        .filter((n) => n.id);
      setNotes(normalized);
    } catch (e) {
      setNotesError('Failed to load notes');
      showToast('Failed to load notes', { type: 'error' });
    } finally {
      setNotesLoading(false);
    }
  }, [recipeId, showToast]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  // When opening notes, fetch them fresh
  useEffect(() => {
    if (notesOpen) {
      loadNotes();
    } else {
      // reset editing state when closing
      setEditingId(null);
      setEditorValue('');
    }
  }, [notesOpen, loadNotes]);

  // Add note
  const [creating, setCreating] = useState(false);
  const [newNoteValue, setNewNoteValue] = useState('');
  const onCreateNote = useCallback(async () => {
    const text = newNoteValue.trim();
    if (!text) {
      showToast('Note cannot be empty', { type: 'info' });
      return;
    }
    setCreating(true);
    // optimistic add with temp id
    const tempId = `tmp_${Date.now()}`;
    const optimistic = { id: tempId, content: text, createdAt: new Date().toISOString() };
    setNotes((prev) => [optimistic, ...prev]);
    setNewNoteValue('');
    try {
      const res = await apiCreateNote(recipeId, { content: text });
      const created = {
        id: res?.id || res?._id || res?.noteId || optimistic.id,
        content: res?.content || res?.text || text,
        createdAt: res?.createdAt || res?.created_at || optimistic.createdAt,
        updatedAt: res?.updatedAt || res?.updated_at || null,
      };
      // replace temp
      setNotes((prev) =>
        prev.map((n) => (n.id === tempId ? created : n))
      );
      showToast('Note added', { type: 'success' });
    } catch (e) {
      // rollback
      setNotes((prev) => prev.filter((n) => n.id !== tempId));
      showToast('Failed to add note', { type: 'error' });
    } finally {
      setCreating(false);
    }
  }, [newNoteValue, recipeId, showToast]);

  // Start edit
  const startEdit = (id) => {
    const n = notes.find((x) => x.id === id);
    setEditingId(id);
    setEditorValue(n?.content || '');
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditorValue('');
  };

  // Save edit
  const [savingEdit, setSavingEdit] = useState(false);
  const onSaveEdit = useCallback(async () => {
    const text = (editorValue || '').trim();
    if (!editingId) return;
    if (!text) {
      showToast('Note cannot be empty', { type: 'info' });
      return;
    }
    // optimistic update
    const prev = notes;
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === editingId ? { ...n, content: text } : n))
    );
    setSavingEdit(true);
    try {
      await apiUpdateNote(recipeId, editingId, { content: text });
      showToast('Note updated', { type: 'success' });
      setEditingId(null);
      setEditorValue('');
    } catch (e) {
      // revert
      setNotes(prev);
      showToast('Failed to update note', { type: 'error' });
    } finally {
      setSavingEdit(false);
    }
  }, [editingId, editorValue, notes, recipeId, showToast]);

  // Delete note
  const [deletingId, setDeletingId] = useState(null);
  const onDeleteNote = useCallback(
    async (id) => {
      // optimistic removal
      const prev = notes;
      setNotes((prevNotes) => prevNotes.filter((n) => n.id !== id));
      setDeletingId(id);
      try {
        await apiDeleteNote(recipeId, id);
        showToast('Note deleted', { type: 'success' });
        if (editingId === id) {
          setEditingId(null);
          setEditorValue('');
        }
      } catch (e) {
        // rollback
        setNotes(prev);
        showToast('Failed to delete note', { type: 'error' });
      } finally {
        setDeletingId(null);
      }
    },
    [notes, recipeId, showToast, editingId]
  );

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
              <button
                ref={openNotesBtnRef}
                className="nav__link"
                onClick={() => setNotesOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={notesOpen}
                aria-controls="recipe-notes-drawer"
              >
                Open Notes
              </button>
            </div>
          </div>
        </div>
      </div>

      <NotesDrawer
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
        openerRef={openNotesBtnRef}
        title="Recipe Notes"
      >
        <div id="recipe-notes-drawer" role="region" aria-label="Recipe notes content">
          <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span
                style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-secondary)',
                }}
              >
                Add a note
              </span>
              <textarea
                rows={4}
                value={newNoteValue}
                onChange={(e) => setNewNoteValue(e.target.value)}
                placeholder="Write your note..."
                style={{
                  width: '100%',
                  borderRadius: 6,
                  border: '1px solid rgba(17,24,39,0.12)',
                  padding: 8,
                }}
              />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                className="nav__link"
                onClick={onCreateNote}
                disabled={creating || !newNoteValue.trim()}
                aria-disabled={creating || !newNoteValue.trim()}
              >
                {creating ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(17,24,39,0.06)', margin: '8px 0 12px' }} />

          {notesLoading ? (
            <div>Loading notes...</div>
          ) : notesError ? (
            <div style={{ color: 'var(--color-error)' }}>{notesError}</div>
          ) : notes.length === 0 ? (
            <div style={{ color: 'var(--color-secondary)' }}>No notes yet. Add your first note above.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
              {notes.map((n) => {
                const isEditing = editingId === n.id;
                return (
                  <li
                    key={n.id}
                    className="card"
                    style={{ padding: 12, borderRadius: 8 }}
                  >
                    {!isEditing ? (
                      <>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{n.content}</div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 8,
                            marginTop: 8,
                          }}
                        >
                          <button
                            className="nav__link"
                            onClick={() => startEdit(n.id)}
                            aria-label="Edit note"
                          >
                            Edit
                          </button>
                          <button
                            className="nav__link"
                            onClick={() => onDeleteNote(n.id)}
                            disabled={deletingId === n.id}
                            aria-disabled={deletingId === n.id}
                            aria-label="Delete note"
                          >
                            {deletingId === n.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <textarea
                          rows={4}
                          value={editorValue}
                          onChange={(e) => setEditorValue(e.target.value)}
                          style={{
                            width: '100%',
                            borderRadius: 6,
                            border: '1px solid rgba(17,24,39,0.12)',
                            padding: 8,
                          }}
                        />
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 8,
                            marginTop: 8,
                          }}
                        >
                          <button className="nav__link" onClick={cancelEdit}>
                            Cancel
                          </button>
                          <button
                            className="nav__link"
                            onClick={onSaveEdit}
                            disabled={savingEdit || !editorValue.trim()}
                            aria-disabled={savingEdit || !editorValue.trim()}
                          >
                            {savingEdit ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </NotesDrawer>
    </>
  );
}
