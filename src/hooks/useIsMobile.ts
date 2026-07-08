import { useSyncExternalStore } from 'react';

const QUERY = '(max-width: 800px)';

const subscribe = (callback: () => void) => {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
};

const getSnapshot = () => window.matchMedia(QUERY).matches;

/** True when the viewport is at or below the mobile breakpoint (800px). */
export const useIsMobile = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, () => false);
