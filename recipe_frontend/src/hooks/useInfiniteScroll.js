import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Observer options default: triggers when the sentinel is visible near viewport end.
 */
const defaultObserverOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1,
};

// PUBLIC_INTERFACE
export function useInfiniteScroll({ hasMore, isLoading, onLoadMore, observerOptions = defaultObserverOptions }) {
  /**
   * Provides infinite scrolling via IntersectionObserver.
   * Returns { sentinelRef, isIntersecting }.
   * - Place sentinelRef on a div at the end of list.
   * - Triggers onLoadMore when intersecting and not currently loading and hasMore is true.
   */
  const [isIntersecting, setIsIntersecting] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const cleanupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    cleanupObserver();
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      const visible = entry?.isIntersecting ?? false;
      setIsIntersecting(visible);
      if (visible && hasMore && !isLoading) {
        onLoadMore?.();
      }
    }, observerOptions);

    observer.observe(el);
    observerRef.current = observer;

    return () => {
      cleanupObserver();
    };
  }, [sentinelRef, observerOptions, hasMore, isLoading, onLoadMore, cleanupObserver]);

  return { sentinelRef, isIntersecting };
}

export default useInfiniteScroll;
