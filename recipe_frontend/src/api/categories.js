import api from './client';

/**
 * Categories API
 * Assumed endpoint:
 * - GET /categories                       list of categories
 * Adjust path if backend exposes a different route.
 */

// PUBLIC_INTERFACE
export async function listCategories() {
  /** Fetch all available categories for recipes. */
  const { data } = await api.get('/categories');
  return data;
}

export default {
  listCategories,
};
