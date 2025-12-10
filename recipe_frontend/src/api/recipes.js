import api from './client';

/**
 * Recipes API
 * Assumed endpoints (adjust with backend spec when available):
 * - GET    /recipes                          list (with optional query params)
 * - GET    /recipes/:id                      detail
 * - GET    /recipes/categories               categories list
 * - GET    /recipes/search?q=...&ingredients=...
 * - GET    /recipes/:id/favorites            get favorite status or list user's favorites
 * - POST   /recipes/:id/favorites            mark favorite
 * - DELETE /recipes/:id/favorites            unmark favorite
 * - GET    /recipes/:id/notes                list notes for a recipe
 * - POST   /recipes/:id/notes                create note
 * - PUT    /recipes/:id/notes/:noteId        update note
 * - DELETE /recipes/:id/notes/:noteId        delete note
 *
 * Adjust paths to match backend once OpenAPI becomes available.
 */

// Utilities
function buildQuery(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) {
      v.forEach((item) => usp.append(k, item));
    } else {
      usp.set(k, v);
    }
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
}

// PUBLIC_INTERFACE
export async function listRecipes(params = {}) {
  /** List recipes with optional filters: page, pageSize, category, ingredients, q, etc. */
  const { data } = await api.get(`/recipes${buildQuery(params)}`);
  return data;
}

// PUBLIC_INTERFACE
export async function getRecipeById(id) {
  /** Retrieve a single recipe by id. */
  const { data } = await api.get(`/recipes/${encodeURIComponent(id)}`);
  return data;
}

// PUBLIC_INTERFACE
export async function listCategories() {
  /** Get available recipe categories. */
  const { data } = await api.get('/recipes/categories');
  return data;
}

// PUBLIC_INTERFACE
export async function searchRecipes({ q, ingredients = [], category, page, pageSize } = {}) {
  /** Search recipes by text query and/or ingredients/category. */
  const params = { q, category, page, pageSize };
  if (ingredients && ingredients.length) params.ingredients = ingredients;
  const { data } = await api.get(`/recipes/search${buildQuery(params)}`);
  return data;
}

// PUBLIC_INTERFACE
export async function getFavoriteStatus(recipeId) {
  /** Get favorite status for a recipe for the current user. */
  const { data } = await api.get(`/recipes/${encodeURIComponent(recipeId)}/favorites`);
  return data;
}

// PUBLIC_INTERFACE
export async function addFavorite(recipeId) {
  /** Mark recipe as favorite for current user. */
  const { data } = await api.post(`/recipes/${encodeURIComponent(recipeId)}/favorites`);
  return data;
}

// PUBLIC_INTERFACE
export async function removeFavorite(recipeId) {
  /** Remove recipe from favorites for current user. */
  const { data } = await api.delete(`/recipes/${encodeURIComponent(recipeId)}/favorites`);
  return data;
}

/**
 * Notes endpoints
 */

// PUBLIC_INTERFACE
export async function listNotes(recipeId) {
  /** List notes for a specific recipe. GET /recipes/:id/notes */
  const { data } = await api.get(`/recipes/${encodeURIComponent(recipeId)}/notes`);
  return data;
}

// PUBLIC_INTERFACE
export async function createNote(recipeId, payload) {
  /** Create a note for the recipe. POST /recipes/:id/notes Payload: { content: string } */
  const { data } = await api.post(`/recipes/${encodeURIComponent(recipeId)}/notes`, payload);
  return data;
}

// PUBLIC_INTERFACE
export async function updateNote(recipeId, noteId, payload) {
  /** Update a note for the recipe. PUT /recipes/:id/notes/:noteId Payload: { content: string } */
  const { data } = await api.put(
    `/recipes/${encodeURIComponent(recipeId)}/notes/${encodeURIComponent(noteId)}`,
    payload
  );
  return data;
}

// PUBLIC_INTERFACE
export async function deleteNote(recipeId, noteId) {
  /** Delete a note for the recipe. DELETE /recipes/:id/notes/:noteId */
  const { data } = await api.delete(
    `/recipes/${encodeURIComponent(recipeId)}/notes/${encodeURIComponent(noteId)}`
  );
  return data;
}
