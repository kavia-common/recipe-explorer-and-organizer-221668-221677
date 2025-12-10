import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDebounce, useInfiniteScroll } from '../hooks';
import RecipeGrid from '../components/RecipeGrid';
import { searchRecipes } from '../api/recipes';
import { useUI } from '../contexts/UIContext';

/**
 * Search page implements:
 * - keyword field
 * - chips-style ingredient input (Enter/comma/blur to add, backspace to remove last)
 * - debounced querying to /recipes/search with { q, ingredients[], page, pageSize }
 * - results rendering via RecipeGrid with infinite scroll
 * - loading/empty/error states and toasts surfaced via UIContext
 */
export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useUI();

  // Parse initial state from URL
  const sp = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialQ = sp.get('q') || '';
  const initialIngredients = (sp.getAll('ingredients') || sp.get('ingredients') || '')
    ? (sp.getAll('ingredients').length ? sp.getAll('ingredients') : (sp.get('ingredients') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean))
    : [];

  const [q, setQ] = useState(initialQ);
  const [ingredients, setIngredients] = useState(initialIngredients);

  const debouncedQ = useDebounce(q, 350);
  const debouncedIngredients = useDebounce(ingredients, 350);

  // Search results state
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const abortRef = useRef(null);

  // Sync URL when inputs change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    // Represent ingredients as repeated params for compatibility, also join fallback for readability
    if (debouncedIngredients?.length) {
      debouncedIngredients.forEach((ing) => params.append('ingredients', ing));
    }
    navigate({ pathname: '/search', search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
  }, [debouncedQ, debouncedIngredients, navigate]);

  const fetchPage = useCallback(
    async (pageToLoad, append = false) => {
      // Cancel previous in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const params = {
        q: debouncedQ || undefined,
        ingredients: debouncedIngredients?.length ? debouncedIngredients : undefined,
        page: pageToLoad,
        pageSize,
      };

      try {
        const data = await searchRecipes(params, { signal: controller.signal });
        const list = Array.isArray(data) ? data : data?.items || [];
        const total = data?.total;
        setItems((prev) => (append ? [...prev, ...list] : list));
        if (typeof total === 'number') {
          const newCount = (append ? items.length : 0) + list.length;
          setHasMore(newCount < total);
        } else {
          setHasMore(list.length === pageSize);
        }
        setPage(pageToLoad);
      } catch (e) {
        if (controller.signal.aborted) return;
        showToast('Failed to load search results', { type: 'error' });
      }
    },
    [debouncedQ, debouncedIngredients, pageSize, showToast, items.length]
  );

  // Run new search when debounced inputs change
  useEffect(() => {
    let mounted = true;
    (async () => {
      setInitialLoading(true);
      await fetchPage(1, false);
      if (mounted) setHasMore(true);
      setInitialLoading(false);
    })();
    return () => {
      mounted = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchPage]);

  // Infinite scroll
  const onLoadMore = useCallback(async () => {
    if (loadingMore || initialLoading) return;
    setLoadingMore(true);
    await fetchPage(page + 1, true);
    setLoadingMore(false);
  }, [fetchPage, page, loadingMore, initialLoading]);

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading: loadingMore || initialLoading,
    onLoadMore,
  });

  // Ingredient chips input behavior
  const [ingInput, setIngInput] = useState('');
  const ingInputRef = useRef(null);

  const normalizeIng = (s) => s.trim().replace(/\s+/g, ' ');
  const addIngredientTokens = useCallback((raw) => {
    const tokens = raw
      .split(',')
      .map((t) => normalizeIng(t))
      .filter(Boolean);
    if (!tokens.length) return;
    setIngredients((prev) => {
      const set = new Set(prev.map((p) => p.toLowerCase()));
      const next = [...prev];
      tokens.forEach((t) => {
        if (!set.has(t.toLowerCase())) {
          next.push(t);
          set.add(t.toLowerCase());
        }
      });
      return next;
    });
  }, []);

  const onIngKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (ingInput.trim()) {
        addIngredientTokens(ingInput);
        setIngInput('');
      }
    } else if (e.key === 'Backspace' && !ingInput) {
      // Remove last chip
      setIngredients((prev) => prev.slice(0, -1));
    }
  };

  const onIngBlur = () => {
    if (ingInput.trim()) {
      addIngredientTokens(ingInput);
      setIngInput('');
    }
  };

  const removeIngredient = (idx) => {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
    // focus input for convenience
    ingInputRef.current?.focus();
  };

  const isEmpty = !initialLoading && items.length === 0;

  return (
    <>
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-secondary)' }}>
            Keywords
          </span>
          <input
            type="text"
            placeholder="e.g. pasta, salad, curry"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(17,24,39,0.12)' }}
          />
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-secondary)' }}>
            Ingredients
          </span>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              border: '1px solid rgba(17,24,39,0.12)',
              borderRadius: 6,
              padding: 6,
              minHeight: 42,
              alignItems: 'center',
              background: '#fff',
            }}
            onClick={() => ingInputRef.current?.focus()}
          >
            {ingredients.map((ing, idx) => (
              <span
                key={`${ing}-${idx}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 8px',
                  borderRadius: 999,
                  background: '#e0f2fe',
                  border: '1px solid #93c5fd',
                  color: '#111827',
                  fontSize: 13,
                }}
              >
                {ing}
                <button
                  aria-label={`Remove ${ing}`}
                  title="Remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeIngredient(idx);
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </span>
            ))}
            <input
              ref={ingInputRef}
              type="text"
              placeholder={ingredients.length ? '' : 'Type an ingredient and press Enter'}
              value={ingInput}
              onChange={(e) => setIngInput(e.target.value)}
              onKeyDown={onIngKeyDown}
              onBlur={onIngBlur}
              style={{
                flex: 1,
                minWidth: 140,
                border: 'none',
                outline: 'none',
                padding: '6px 8px',
                font: 'inherit',
                background: 'transparent',
              }}
            />
          </div>
          <div style={{ color: 'var(--color-secondary)', fontSize: 12 }}>
            Tip: Press Enter or comma to add an ingredient. Backspace removes the last chip when input is empty.
          </div>
        </div>
      </div>

      <div style={{ height: 12 }} />

      {initialLoading ? (
        <div className="card">Searching...</div>
      ) : isEmpty ? (
        <div className="card">No recipes found. Try different keywords or ingredients.</div>
      ) : (
        <>
          <RecipeGrid recipes={items} />
          <div ref={sentinelRef} style={{ height: 1 }} />
          <div style={{ height: 12 }} />
          {loadingMore && <div className="card">Loading more...</div>}
          {!hasMore && items.length > 0 && <div className="card">You have reached the end.</div>}
        </>
      )}
    </>
  );
}
