import React, { useState } from 'react';
import { useDebounce } from '../hooks';
import RecipeGrid from '../components/RecipeGrid';

/**
 * Search page demonstrates a debounced query and results grid (shell).
 */
export default function Search() {
  const [q, setQ] = useState('');
  const debounced = useDebounce(q, 300);

  // Placeholder fake results based on query
  const results = debounced
    ? Array.from({ length: 6 }).map((_, i) => ({
        id: `s-${i + 1}`,
        title: `${debounced} Recipe ${i + 1}`,
        summary: `Result for "${debounced}"`,
        image: 'https://via.placeholder.com/640x360?text=Search',
      }))
    : [];

  return (
    <>
      <div className="card">
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-secondary)' }}>Search</span>
          <input
            type="text"
            placeholder="Type to search recipes..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(17,24,39,0.12)' }}
          />
        </label>
      </div>
      <div style={{ height: 12 }} />
      <RecipeGrid recipes={results} />
    </>
  );
}
