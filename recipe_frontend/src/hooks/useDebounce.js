import { useEffect, useState } from 'react';

// PUBLIC_INTERFACE
export function useDebounce(value, delay = 300) {
  /** Debounce a value by delay milliseconds. Returns the debounced value. */
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default useDebounce;
