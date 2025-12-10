import api from './client';

/**
 * User Favorites API
 * Endpoints assumed:
 * - GET    /users/me/favorites                -> paginated list of favorite recipes
 *      Query: page, pageSize
 * - POST   /users/me/favorites/:recipeId      -> add a favorite
 * - DELETE /users/me/favorites/:recipeId      -> remove a favorite
 */

// PUBLIC_INTERFACE
export async function listUserFavorites({ page = 1, pageSize = 12 } = {}) {
  /** List the current user's favorite recipes. Returns { items, total, page, pageSize } or array. */
  const usp = new URLSearchParams();
  if (page) usp.set('page', page);
  if (pageSize) usp.set('pageSize', pageSize);
  const qs = usp.toString() ? `?${usp.toString()}` : '';
  const { data } = await api.get(`/users/me/favorites${qs}`);
  return data;
}

// PUBLIC_INTERFACE
export async function addUserFavorite(recipeId) {
  /** Add the recipe to current user's favorites. */
  const id = encodeURIComponent(recipeId);
  const { data } = await api.post(`/users/me/favorites/${id}`);
  return data;
}

// PUBLIC_INTERFACE
export async function removeUserFavorite(recipeId) {
  /** Remove the recipe from current user's favorites. */
  const id = encodeURIComponent(recipeId);
  const { data } = await api.delete(`/users/me/favorites/${id}`);
  return data;
}

export default {
  listUserFavorites,
  addUserFavorite,
  removeUserFavorite,
};
