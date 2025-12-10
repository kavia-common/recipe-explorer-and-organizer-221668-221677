import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RecipeFilters from '../components/RecipeFilters';
import RecipeGrid from '../components/RecipeGrid';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { listRecipes } from '../api/recipes';
import { useInfiniteScroll } from '../hooks';
import { useUI } from '../contexts/UIContext';

/**
 * Browse page lists recipes with filters.
 * - Syncs category with URL query param (?category=...)
 * - Loads recipes from API with pagination
 * - Infinite scroll using useInfiniteScroll hook
 * - Handles loading/empty/error via simple UI and toasts
 */
export default function Browse() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useUI();

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const categoryFromUrl = query.get('category') || '';
  const qFromUrl = query.get('q') || '';
  const ingredientsFromUrl = query.get('ingredients') || '';

  const [filters, setFilters] = useState({
    category: categoryFromUrl,
    q: qFromUrl,
    ingredients: ingredientsFromUrl,
  });

  // keep filters in sync when URL changes (e.g., via Sidebar)
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      category: categoryFromUrl,
    }));
    // only update category from URL; q and ingredients are controlled here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFromUrl]);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageSize = 12;

  const abortRef = useRef(null);

  const fetchPage = useCallback(
    async (pageToLoad, append = false) => {
      // cancel previous in-flight
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;
      const params = {
        page: pageToLoad,
        pageSize,
        category: filters.category || undefined,
        q: filters.q || undefined,
      };
      if (filters.ingredients) params.ingredients = filters.ingredients.split(',').map((s) => s.trim()).filter(Boolean);

      try {
        const data = await listRecipes(params, { signal: controller.signal });
        // Assume backend returns { items, total, page, pageSize } or array fallback
        const listRaw = Array.isArray(data) ? data : data?.items || [];
        const total = data?.total ?? undefined;

        // Normalize potential favorite flag if backend provides it
        const list = listRaw.map((r) => ({
          ...r,
          isFavorite: Boolean(r?.isFavorite),
        }));
        setItems((prev) => (append ? [...prev, ...list] : list));
        setHasMore(
          typeof total === 'number'
            ? (append ? prevCount(prev => prev) : 0) + list.length < total // fallback logic if needed
            : list.length === pageSize // if no total, infer from page size
        );
        setPage(pageToLoad);
      } catch (e) {
        // If aborted, ignore
        if (controller.signal.aborted) return;
        showToast('Failed to load recipes', { type: 'error' });
      }
    },
    [filters.category, filters.q, filters.ingredients, pageSize, showToast]
  );

  // helper since using setHasMore with total isn't straightforward; keep simple calculation
  function prevCountGetter(arr) {
    return Array.isArray(arr) ? arr.length : 0;
  }
  function prevCount(fn) {
    // small helper not to overcomplicate; not used due to closure, leaving fallback path above simple
    return items.length;
  }

  // Initial load and whenever filters change
  useEffect(() => {
    let mounted = true;
    (async () => {
      setInitialLoading(true);
      await fetchPage(1, false);
      if (mounted) {
        setHasMore(true); // reset; will update based on results
      }
      setInitialLoading(false);
    })();
    return () => {
      mounted = false;
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.q, filters.ingredients]);

  // Update URL when filters (q, ingredients) change from the filter bar
  const onFiltersChange = useCallback(
    (next) => {
      setFilters(next);
      const sp = new URLSearchParams(location.search);
      // category may be controlled via sidebar; keep it from next as well
      if (next.category) sp.set('category', next.category);
      else sp.delete('category');

      if (next.q) sp.set('q', next.q);
      else sp.delete('q');

      if (next.ingredients) sp.set('ingredients', next.ingredients);
      else sp.delete('ingredients');

      sp.delete('page'); // reset page when filters change
      navigate({ pathname: '/browse', search: `?${sp.toString()}` }, { replace: true });
    },
    [location.search, navigate]
  );

  // load more via infinite scroll
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

  const isEmpty = !initialLoading && items.length === 0;

  return (
    <>
      <RecipeFilters value={filters} onChange={onFiltersChange} />
      <div style={{ height: 12 }} />
      {initialLoading ? (
        <Loading label="Loading recipes..." />
      ) : isEmpty ? (
        <EmptyState title="No recipes found" description="Try adjusting filters or search terms." />
      ) : (
        <>
          <RecipeGrid recipes={items} />
          <div
            ref={sentinelRef}
            style={{ height: 1 }}
            role="presentation"
            aria-hidden="true"
          />
          <div style={{ height: 12 }} />
          {loadingMore && <Loading label="Loading more..." variant="card" />}
          {!hasMore && <EmptyState title="End of results" description="You have reached the end." />}
        </>
      )}
    </>
  );
}
