import React, { useState } from 'react';
import RecipeFilters from '../components/RecipeFilters';
import RecipeGrid from '../components/RecipeGrid';

/**
 * Browse page lists recipes with filters (shell).
 */
export default function Browse() {
  const [filters, setFilters] = useState({});

  // Placeholder data
  const sample = Array.from({ length: 8 }).map((_, i) => ({
    id: `sample-${i + 1}`,
    title: `Sample Recipe ${i + 1}`,
    summary: 'Tasty and easy to make.',
    image: 'https://via.placeholder.com/640x360?text=Recipe',
  }));

  return (
    <>
      <RecipeFilters value={filters} onChange={setFilters} />
      <div style={{ height: 12 }} />
      <RecipeGrid recipes={sample} />
    </>
  );
}
