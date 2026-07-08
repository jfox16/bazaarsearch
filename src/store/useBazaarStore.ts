import { useMemo } from 'react';
import { create } from 'zustand';

import { filterCards } from 'functions/filterCards';
import { parseSmartQuery } from 'functions/parseSmartQuery';
import type { BazaarEntry } from 'types/bazaar';

import { createDataSlice } from './slices/dataSlice';
import { createFilterSlice } from './slices/filterSlice';
import { createSelectionSlice } from './slices/selectionSlice';
import { createUiSlice } from './slices/uiSlice';
import type { BazaarState } from './types';

/** Single store composed from one slice per concern (data / filter / selection / ui). */
export const useBazaarStore = create<BazaarState>()((...a) => ({
  ...createDataSlice(...a),
  ...createFilterSlice(...a),
  ...createSelectionSlice(...a),
  ...createUiSlice(...a),
}));

/** Memoized filtered + sorted entries derived from the current filter. */
export const useFilteredEntries = (): BazaarEntry[] => {
  const entries = useBazaarStore((s) => s.entries);
  const filter = useBazaarStore((s) => s.filter);
  const facets = useBazaarStore((s) => s.facets);
  return useMemo(() => {
    const { filter: effectiveFilter } = parseSmartQuery(filter, facets);
    return filterCards(entries, effectiveFilter);
  }, [entries, filter, facets]);
};

/** Facets auto-detected from the current text query (for UI feedback). */
export const useDetectedFilters = () => {
  const filter = useBazaarStore((s) => s.filter);
  const facets = useBazaarStore((s) => s.facets);
  return useMemo(() => parseSmartQuery(filter, facets).detected, [filter, facets]);
};

/** The currently selected entry, if any. */
export const useSelectedEntry = (): BazaarEntry | null => {
  const selectedId = useBazaarStore((s) => s.selectedId);
  const entries = useBazaarStore((s) => s.entries);
  return useMemo(
    () => (selectedId ? (entries.find((e: BazaarEntry) => e.id === selectedId) ?? null) : null),
    [selectedId, entries],
  );
};
