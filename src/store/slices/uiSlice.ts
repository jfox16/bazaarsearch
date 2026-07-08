import type { StateCreator } from 'zustand';

import type { BazaarState } from '../types';

/** Transient view state that isn't part of the data or query. */
export interface UiSlice {
  /** Mobile-only: whether the filter drawer is open. */
  filterFormOpen: boolean;
  setFilterFormOpen: (open: boolean) => void;
}

export const createUiSlice: StateCreator<BazaarState, [], [], UiSlice> = (set) => ({
  filterFormOpen: false,
  setFilterFormOpen: (open) => set({ filterFormOpen: open }),
});
