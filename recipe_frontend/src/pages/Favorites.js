import React from 'react';
import RecipeGrid from '../components/RecipeGrid';

/**
 * Favorites page shows user's saved recipes (shell).
 */
export default function Favorites() {
  // Placeholder favorite list
  const items = Array.from({ length: 4 }).map((_, i) => ({
    id: `fav-${i + 1}`,
    title: `Favorite ${i + 1}`,
    summary: 'A saved favorite recipe.',
    image: 'https://via.placeholder.com/640x360?text=Favorite',
  }));

  return <RecipeGrid recipes={items} />;
}
