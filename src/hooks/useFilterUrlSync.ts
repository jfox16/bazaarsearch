import { useEffect, useRef } from 'react';

import { parseUrlSearchParams, serializeFilterToSearch } from 'functions/filterUrlParams';
import { useBazaarStore } from 'store/useBazaarStore';

/** Keep filter + sort state in sync with URL search params. Search writes after debounce via store `filter.text`. */
export const useFilterUrlSync = () => {
  const hydratingRef = useRef(false);
  const lastWrittenRef = useRef('');

  useEffect(() => {
    const writeUrl = () => {
      if (hydratingRef.current) return;

      const { filter, sort } = useBazaarStore.getState();
      const query = serializeFilterToSearch(filter, sort);
      const path = `${window.location.pathname}${window.location.hash}`;
      const nextUrl = query ? `${path}?${query}` : path;

      if (nextUrl === lastWrittenRef.current) return;
      lastWrittenRef.current = nextUrl;
      window.history.replaceState(null, '', nextUrl);
    };

    lastWrittenRef.current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    writeUrl();

    return useBazaarStore.subscribe((state, prevState) => {
      if (state.filter === prevState.filter && state.sort === prevState.sort) return;
      writeUrl();
    });
  }, []);

  useEffect(() => {
    const hydrateFromUrl = () => {
      const { filter, sort } = parseUrlSearchParams(window.location.search);
      hydratingRef.current = true;
      useBazaarStore.getState().hydrateFilter(filter);
      useBazaarStore.getState().setSort(sort);
      hydratingRef.current = false;

      const query = serializeFilterToSearch(useBazaarStore.getState().filter, useBazaarStore.getState().sort);
      const path = `${window.location.pathname}${window.location.hash}`;
      lastWrittenRef.current = query ? `${path}?${query}` : path;
    };

    window.addEventListener('popstate', hydrateFromUrl);
    return () => window.removeEventListener('popstate', hydrateFromUrl);
  }, []);
};
