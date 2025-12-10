import React, { useCallback, useEffect, useRef, useState } from 'react';
import RecipeGrid from '../components/RecipeGrid';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { listUserFavorites } from '../api/userFavorites';
import { useUI } from '../contexts/UIContext';
import { useInfiniteScroll } from '../hooks';

/**
 * Favorites page lists user's saved recipes with pagination.
 * - Loads from /users/me/favorites
 * - Handles loading/empty/error
 * - Supports infinite scroll pagination
 */
export default function Favorites() {
  const { showToast } = useUI();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const abortRef = useRef(null);

  const fetchPage = useCallback(
    async (pageToLoad, append = false) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const data = await listUserFavorites({ page: pageToLoad, pageSize }, { signal: controller.signal });
        // Normalize list; backend may return {items,total} or a bare array
        const list = Array.isArray(data) ? data : data?.items || [];
        const total = typeof data?.total === 'number' ? data.total : undefined;

        // Normalize each recipe shape
        const normalized = list.map((r) => ({
          id: r?.id || r?._id || r?.recipeId || r?.recipe?.id || r?.recipe?._id,
          title: r?.title || r?.name || r?.recipe?.title || r?.recipe?.name || 'Untitled Recipe',
          summary: r?.summary || r?.description || r?.recipe?.summary || r?.recipe?.description || '',
          image: r?.image || r?.cover || r?.recipe?.image || r?.recipe?.cover || 'https://via.placeholder.com/640x360?text=Favorite',
        })).filter((x) => x?.id);

        setItems((prev) => (append ? [...prev, ...normalized] : normalized));
        if (typeof total === 'number') {
          const count = (append ? items.length : 0) + normalized.length;
          setHasMore(count < total);
        } else {
          setHasMore(normalized.length === pageSize);
        }
        setPage(pageToLoad);
      } catch (e) {
        if (controller.signal.aborted) return;
        showToast('Failed to load favorites', { type: 'error' });
      }
    },
    [pageSize, showToast, items.length]
  );

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
      {initialLoading ? (
        <Loading label="Loading favorites..." />
      ) : isEmpty ? (
        <EmptyState
          title="No favorites yet"
          description="You haven't saved any recipes yet."
        />
      ) : (
        <>
          <RecipeGrid recipes={items} />
          <div ref={sentinelRef} style={{ height: 1 }} role="presentation" aria-hidden="true" />
          <div style={{ height: 12 }} />
          {loadingMore && <Loading label="Loading more..." variant="card" />}
          {!hasMore && items.length > 0 && (
            <EmptyState title="End of results" description="You have reached the end." />
          )}
        </>
      )}
    </>
  );
}
