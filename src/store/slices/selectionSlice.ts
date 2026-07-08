import type { StateCreator } from 'zustand';

import type { BazaarState } from '../types';

/** The currently opened card detail, tracked by id. */
export interface SelectionSlice {
  selectedId: string | null;
  select: (id: string | null) => void;
}

export const createSelectionSlice: StateCreator<BazaarState, [], [], SelectionSlice> = (set) => ({
  selectedId: null,
  select: (id) => set({ selectedId: id }),
});
