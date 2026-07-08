import type { StateCreator } from 'zustand';

import type { BazaarFilter, Kind, Size, Tier, ToggleFilterKey } from 'types/bazaar';

import type { BazaarState } from '../types';

const DEFAULT_KIND: Kind = 'item';

export const isDefaultKinds = (kinds: Set<Kind>) => kinds.size === 1 && kinds.has(DEFAULT_KIND);

const createDefaultFilter = (): BazaarFilter => ({
  text: '',
  kinds: new Set<Kind>([DEFAULT_KIND]),
  heroes: new Set<string>(),
  sizes: new Set<string>(),
  tiers: new Set<Tier>(),
  types: new Set<string>(),
  tags: new Set<string>(),
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
  textFilterKey: number;
  setText: (text: string) => void;
  toggleFilter: (key: ToggleFilterKey, value: string) => void;
  applyTypeFilter: (type: string) => void;
  applyTagFilter: (tag: string) => void;
  applyHeroFilter: (hero: string) => void;
  applyKindFilter: (kind: Kind) => void;
  applySizeFilter: (size: Size) => void;
  applyTierFilter: (tier: Tier) => void;
  clearFilters: () => void;
  isFilterActive: () => boolean;
}

export const createFilterSlice: StateCreator<BazaarState, [], [], FilterSlice> = (set, get) => ({
  filter: createDefaultFilter(),
  textFilterKey: 0,

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

  applyTypeFilter: (type) =>
    set((s) => ({
      filter: {
        ...createDefaultFilter(),
        types: new Set([type]),
      },
      textFilterKey: s.textFilterKey + 1,
    })),

  applyTagFilter: (tag) => {
    const tags = new Set([tag]);
    if (!tag.endsWith('Reference')) tags.add(`${tag}Reference`);
    set((s) => ({
      filter: {
        ...createDefaultFilter(),
        kinds: new Set<Kind>(['item', 'skill']),
        tags,
      },
      textFilterKey: s.textFilterKey + 1,
    }));
  },

  applyHeroFilter: (hero) =>
    set((s) => ({
      filter: {
        ...createDefaultFilter(),
        kinds: new Set<Kind>(['item', 'skill']),
        heroes: new Set([hero]),
      },
      textFilterKey: s.textFilterKey + 1,
    })),

  applyKindFilter: (kind) =>
    set((s) => ({
      filter: {
        ...createDefaultFilter(),
        kinds: new Set([kind]),
      },
      textFilterKey: s.textFilterKey + 1,
    })),

  applySizeFilter: (size) =>
    set((s) => ({
      filter: {
        ...createDefaultFilter(),
        kinds: new Set<Kind>(['item']),
        sizes: new Set([size]),
      },
      textFilterKey: s.textFilterKey + 1,
    })),

  applyTierFilter: (tier) =>
    set((s) => ({
      filter: {
        ...createDefaultFilter(),
        kinds: new Set<Kind>(['item', 'skill']),
        tiers: new Set([tier]),
      },
      textFilterKey: s.textFilterKey + 1,
    })),

  clearFilters: () =>
    set((s) => ({
      filter: createDefaultFilter(),
      textFilterKey: s.textFilterKey + 1,
    })),

  isFilterActive: () => {
    const f = get().filter;
    return (
      f.text.trim() !== '' ||
      !isDefaultKinds(f.kinds) ||
      f.heroes.size > 0 ||
      f.sizes.size > 0 ||
      f.tiers.size > 0 ||
      f.types.size > 0 ||
      f.tags.size > 0
    );
  },
});
