import type { StateCreator } from 'zustand';

import type { BazaarFilter, Kind, Tier, ToggleFilterKey } from 'types/bazaar';

import type { BazaarState } from '../types';

const DEFAULT_KIND: Kind = 'item';

export const isDefaultKinds = (kinds: Set<Kind>) => kinds.size === 1 && kinds.has(DEFAULT_KIND);

const createDefaultFilter = (): BazaarFilter => ({
  text: '',
  kinds: new Set<Kind>([DEFAULT_KIND]),
  heroes: new Set<string>(),
  sizes: new Set<string>(),
  tiers: new Set<Tier>(),
  tags: new Set<string>(),
  tagMatchAll: false,
  nameGroups: [],
  nameExact: null,
  tooltipGroups: [],
  tagGroups: [],
  tierMin: null,
  tierMax: null,
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
    set((s) => {
      if (key === 'kinds') {
        const kind = value as Kind;
        if (s.filter.kinds.size === 1 && s.filter.kinds.has(kind)) return s;
        return { filter: { ...s.filter, kinds: new Set([kind]) } };
      }
      return { filter: { ...s.filter, [key]: toggleInSet(s.filter[key], value) } };
    }),

  setTagMatchAll: (value) => set((s) => ({ filter: { ...s.filter, tagMatchAll: value } })),

  clearFilters: () => set({ filter: createDefaultFilter() }),

  isFilterActive: () => {
    const f = get().filter;
    return (
      f.text.trim() !== '' ||
      !isDefaultKinds(f.kinds) ||
      f.heroes.size > 0 ||
      f.sizes.size > 0 ||
      f.tiers.size > 0 ||
      f.tags.size > 0
    );
  },
});
