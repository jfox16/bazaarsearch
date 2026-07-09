import type { StateCreator } from 'zustand';

import { parseUrlSearchParams } from 'functions/filterUrlParams';
import type { SortField, SortOptions } from 'types/bazaar';

import type { BazaarState } from '../types';

const DEFAULT_SORT: SortOptions = { field: 'rarity', direction: 'asc' };

const initialUrlState =
  typeof window !== 'undefined' ? parseUrlSearchParams(window.location.search) : null;

/** Transient view state that isn't part of the data or query. */
export interface UiSlice {
  /** Mobile-only: whether the filter drawer is open. */
  filterFormOpen: boolean;
  setFilterFormOpen: (open: boolean) => void;
  sort: SortOptions;
  setSort: (sort: SortOptions) => void;
  setSortField: (field: SortField) => void;
  toggleSortDirection: () => void;
}

export const createUiSlice: StateCreator<BazaarState, [], [], UiSlice> = (set) => ({
  filterFormOpen: false,
  setFilterFormOpen: (open) => set({ filterFormOpen: open }),
  sort: initialUrlState?.sort ?? DEFAULT_SORT,
  setSort: (sort) => set({ sort }),
  setSortField: (field) => set((s) => ({ sort: { ...s.sort, field } })),
  toggleSortDirection: () =>
    set((s) => ({
      sort: { ...s.sort, direction: s.sort.direction === 'asc' ? 'desc' : 'asc' },
    })),
});
