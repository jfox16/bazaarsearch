import type { StateCreator } from 'zustand';

import type { BazaarFilter, Kind, ToggleFilterKey } from 'types/bazaar';

import type { BazaarState } from '../types';

const createDefaultFilter = (): BazaarFilter => ({
  text: '',
  kinds: new Set<Kind>(),
  heroes: new Set<string>(),
  sizes: new Set<string>(),
  tiers: new Set<string>(),
  tags: new Set<string>(),
  tagMatchAll: false,
});

const toggleInSet = <T,>(set: Set<T>, value: T): Set<T> => {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
};

/** The active search/filter query and the actions that mutate it. */
export interface FilterSlice {
  filter: BazaarFilter;
  setText: (text: string) => void;
  toggleFilter: (key: ToggleFilterKey, value: string) => void;
  setTagMatchAll: (value: boolean) => void;
  clearFilters: () => void;
  isFilterActive: () => boolean;
}

export const createFilterSlice: StateCreator<BazaarState, [], [], FilterSlice> = (set, get) => ({
  filter: createDefaultFilter(),

  setText: (text) => set((s) => ({ filter: { ...s.filter, text } })),

  toggleFilter: (key, value) =>
    set((s) => ({ filter: { ...s.filter, [key]: toggleInSet(s.filter[key], value) } })),

  setTagMatchAll: (value) => set((s) => ({ filter: { ...s.filter, tagMatchAll: value } })),

  clearFilters: () => set({ filter: createDefaultFilter() }),

  isFilterActive: () => {
    const f = get().filter;
    return (
      f.text.trim() !== '' ||
      f.kinds.size > 0 ||
      f.heroes.size > 0 ||
      f.sizes.size > 0 ||
      f.tiers.size > 0 ||
      f.tags.size > 0
    );
  },
});
